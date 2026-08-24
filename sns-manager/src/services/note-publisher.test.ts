import { describe, expect, it, vi } from "vitest";
import { buildPost } from "./__helpers";
import {
  getNoteCredentials,
  isNoteAutoPublishConfigured,
  NotePublishError,
  notePublishInputSchema,
  publishPostToNote,
  toNotePublishInput,
  type NotePublishDriver,
  type NotePublishResult,
} from "./note-publisher";

const CREDS_ENV = { NOTE_EMAIL: "a@example.com", NOTE_PASSWORD: "secret" };

function okDriver(result?: Partial<NotePublishResult>): NotePublishDriver {
  return {
    publishArticle: vi.fn(async () => ({
      externalPostId: "n/abc123",
      url: "https://note.com/sample_artist/n/abc123",
      published: true,
      ...result,
    })),
  };
}

describe("getNoteCredentials", () => {
  it("両方揃えば認証情報を返す", () => {
    expect(getNoteCredentials(CREDS_ENV)).toEqual({
      email: "a@example.com",
      password: "secret",
    });
  });

  it("どちらか欠けたら null", () => {
    expect(getNoteCredentials({ NOTE_EMAIL: "a@example.com" })).toBeNull();
    expect(getNoteCredentials({ NOTE_PASSWORD: "secret" })).toBeNull();
    expect(getNoteCredentials({})).toBeNull();
  });

  it("空文字は未設定扱い", () => {
    expect(
      getNoteCredentials({ NOTE_EMAIL: "  ", NOTE_PASSWORD: "secret" }),
    ).toBeNull();
  });
});

describe("isNoteAutoPublishConfigured", () => {
  it("認証情報の有無を反映する", () => {
    expect(isNoteAutoPublishConfigured(CREDS_ENV)).toBe(true);
    expect(isNoteAutoPublishConfigured({})).toBe(false);
  });
});

describe("notePublishInputSchema", () => {
  it("タイトル・本文が空だと不正", () => {
    expect(
      notePublishInputSchema.safeParse({ title: "", body: "x" }).success,
    ).toBe(false);
    expect(
      notePublishInputSchema.safeParse({ title: "x", body: "  " }).success,
    ).toBe(false);
  });

  it("hashtags/publish は既定値を補う", () => {
    const parsed = notePublishInputSchema.parse({ title: "t", body: "b" });
    expect(parsed.hashtags).toEqual([]);
    expect(parsed.publish).toBe(false);
  });
});

describe("toNotePublishInput", () => {
  it("SocialPost から driver 入力へ変換する", () => {
    const post = buildPost({
      platform: "note",
      title: "記事",
      body: "本文",
      hashtags: ["#音楽"],
    });
    expect(toNotePublishInput(post, true)).toEqual({
      title: "記事",
      body: "本文",
      hashtags: ["#音楽"],
      publish: true,
    });
  });
});

describe("publishPostToNote", () => {
  const approvedNote = () =>
    buildPost({
      platform: "note",
      status: "scheduled",
      title: "記事タイトル",
      body: "記事本文",
    });

  it("認証情報が無ければ not_configured", async () => {
    await expect(
      publishPostToNote(approvedNote(), okDriver(), { env: {} }),
    ).rejects.toMatchObject({ code: "not_configured" });
  });

  it("note 以外の媒体は拒否", async () => {
    await expect(
      publishPostToNote(buildPost({ platform: "x" }), okDriver(), {
        env: CREDS_ENV,
      }),
    ).rejects.toMatchObject({ code: "invalid_input" });
  });

  it("承認前ステータスの公開は拒否", async () => {
    const driver = okDriver();
    await expect(
      publishPostToNote(
        buildPost({ platform: "note", status: "draft", body: "b" }),
        driver,
        { env: CREDS_ENV },
      ),
    ).rejects.toMatchObject({ code: "not_approved" });
    expect(driver.publishArticle).not.toHaveBeenCalled();
  });

  it("本人未承認は拒否", async () => {
    await expect(
      publishPostToNote(
        buildPost({
          platform: "note",
          status: "scheduled",
          requiresArtistApproval: true,
          artistApprovedAt: null,
          body: "b",
        }),
        okDriver(),
        { env: CREDS_ENV },
      ),
    ).rejects.toMatchObject({ code: "artist_not_approved" });
  });

  it("下書き保存(publish=false)は承認チェックを課さない", async () => {
    const driver = okDriver({ published: false });
    const res = await publishPostToNote(
      buildPost({ platform: "note", status: "draft", body: "下書き" }),
      driver,
      { env: CREDS_ENV, publish: false },
    );
    expect(driver.publishArticle).toHaveBeenCalledOnce();
    expect(res.published).toBe(false);
  });

  it("承認済みなら driver に認証情報と入力を渡して公開する", async () => {
    const driver = okDriver();
    const res = await publishPostToNote(approvedNote(), driver, {
      env: CREDS_ENV,
    });
    expect(res.published).toBe(true);
    expect(driver.publishArticle).toHaveBeenCalledWith(
      { email: "a@example.com", password: "secret" },
      expect.objectContaining({ title: "記事タイトル", publish: true }),
    );
  });

  it("driver の例外は driver_error で包む", async () => {
    const driver: NotePublishDriver = {
      publishArticle: vi.fn(async () => {
        throw new Error("selector timeout");
      }),
    };
    await expect(
      publishPostToNote(approvedNote(), driver, { env: CREDS_ENV }),
    ).rejects.toMatchObject({ code: "driver_error" });
  });

  it("NotePublishError は Error インスタンス", () => {
    expect(new NotePublishError("x", "invalid_input")).toBeInstanceOf(Error);
  });
});

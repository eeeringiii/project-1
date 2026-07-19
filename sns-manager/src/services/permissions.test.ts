import { describe, expect, it } from "vitest";
import { can, canAny } from "./permissions";

describe("permissions.can", () => {
  it("admin はユーザー管理ができる", () => {
    expect(can("admin", "user.manage")).toBe(true);
  });

  it("staff は承認できない", () => {
    expect(can("staff", "post.approve")).toBe(false);
  });

  it("staff は投稿作成できる", () => {
    expect(can("staff", "post.create")).toBe(true);
  });

  it("artist は本人承認のみ可能", () => {
    expect(can("artist", "post.artist_approve")).toBe(true);
    expect(can("artist", "post.create")).toBe(false);
  });

  it("viewer は何も編集できない", () => {
    expect(can("viewer", "post.edit")).toBe(false);
    expect(can("viewer", "media.manage")).toBe(false);
  });

  it("manager は承認・カレンダー編集ができる", () => {
    expect(can("manager", "post.approve")).toBe(true);
    expect(can("manager", "calendar.edit")).toBe(true);
  });
});

describe("permissions.canAny", () => {
  it("いずれかの権限があれば true", () => {
    expect(canAny("staff", ["user.manage", "post.create"])).toBe(true);
    expect(canAny("viewer", ["post.create", "post.approve"])).toBe(false);
  });
});

// 入稿API（サーバー側）からGitHubのファイルを読み書きするためのヘルパー。
// mainへのコミットでVercelが自動再ビルドし、約2分でサイトに反映される。

const REPO = "eeeringiii/project-1";
const BRANCH = "main";

function headers(): HeadersInit {
  const token = process.env.GITHUB_CONTENT_TOKEN;
  if (!token) throw new Error("GITHUB_CONTENT_TOKEN 未設定");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
}

export async function getRepoFile(
  repoPath: string,
): Promise<{ text: string; sha: string }> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${repoPath}?ref=${BRANCH}`,
    { headers: headers(), cache: "no-store" },
  );
  if (!res.ok) throw new Error(`GitHub取得失敗: ${res.status} ${repoPath}`);
  const json = (await res.json()) as { content: string; sha: string };
  return {
    text: Buffer.from(json.content, "base64").toString("utf8"),
    sha: json.sha,
  };
}

export async function putRepoFile(
  repoPath: string,
  contentBase64: string,
  message: string,
  sha?: string,
): Promise<void> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${repoPath}`,
    {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({
        message,
        content: contentBase64,
        branch: BRANCH,
        ...(sha ? { sha } : {}),
      }),
    },
  );
  if (!res.ok) {
    const detail = await res.text();
    console.error("GitHub書き込み失敗:", res.status, detail.slice(0, 400));
    throw new Error(`GitHub書き込み失敗: ${res.status}`);
  }
}

export async function deleteRepoFile(
  repoPath: string,
  message: string,
  sha: string,
): Promise<void> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${repoPath}`,
    {
      method: "DELETE",
      headers: headers(),
      body: JSON.stringify({ message, sha, branch: BRANCH }),
    },
  );
  if (!res.ok) {
    const detail = await res.text();
    console.error("GitHub削除失敗:", res.status, detail.slice(0, 400));
    throw new Error(`GitHub削除失敗: ${res.status}`);
  }
}

export function toBase64(text: string): string {
  return Buffer.from(text).toString("base64");
}

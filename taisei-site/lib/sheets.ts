import crypto from "node:crypto";
import type { Order, OrderItem, OrderStatus } from "@/lib/content";

// 注文（個人情報）を Google スプレッドシートに保存・取得する。
// 公開リポジトリに個人情報を残さないための保存先。
// サービスアカウント認証（外部ライブラリ不要・Node標準の crypto で JWT を署名）。
//
// 必要な環境変数（Vercel に設定）:
//   GOOGLE_SERVICE_ACCOUNT_EMAIL … サービスアカウントのメール
//   GOOGLE_PRIVATE_KEY           … サービスアカウントの秘密鍵（\n を含む）
//   ORDERS_SHEET_ID              … 対象スプレッドシートのID（URLの /d/ と /edit の間）
//
// スプレッドシートはサービスアカウントのメールに「編集者」で共有しておくこと。

const EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "";
const RAW_KEY = process.env.GOOGLE_PRIVATE_KEY ?? "";
const SHEET_ID = process.env.ORDERS_SHEET_ID ?? "";

export const sheetsEnabled = Boolean(EMAIL && RAW_KEY && SHEET_ID);

// 列の並び（1行目のヘッダー）。items_json は明細の完全復元用。
const HEADER = [
  "注文番号",
  "日時",
  "ステータス",
  "氏名",
  "フリガナ",
  "メール",
  "電話",
  "郵便番号",
  "住所",
  "商品",
  "商品小計",
  "送料",
  "合計",
  "備考",
  "items_json",
];
const LAST_COL = "O"; // 15列目
const API = "https://sheets.googleapis.com/v4/spreadsheets";

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

let cachedToken: { token: string; exp: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.exp > Date.now() + 60_000) return cachedToken.token;

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: EMAIL,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const signingInput = `${header}.${claim}`;
  const privateKey = RAW_KEY.replace(/\\n/g, "\n");
  const signature = base64url(
    crypto.sign("RSA-SHA256", Buffer.from(signingInput), privateKey),
  );
  const assertion = `${signingInput}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    throw new Error(`Google認証に失敗: ${res.status} ${(await res.text()).slice(0, 200)}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: json.access_token, exp: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

async function api(path: string, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken();
  return fetch(`${API}/${SHEET_ID}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

// items を人が読める文字列にする（例: ロゴTシャツ（L）×2 ／ CD×1）
function itemsText(items: OrderItem[]): string {
  return items
    .map((it) => `${it.name}${it.variant ? `（${it.variant}）` : ""}×${it.qty}`)
    .join(" ／ ");
}

// 1行目にヘッダーが無ければ作成する
async function ensureHeader(): Promise<void> {
  const res = await api(`/values/A1:${LAST_COL}1`);
  if (!res.ok) throw new Error(`シート読み取りに失敗: ${res.status}`);
  const json = (await res.json()) as { values?: string[][] };
  if (!json.values || json.values.length === 0) {
    await api(`/values/A1:${LAST_COL}1?valueInputOption=RAW`, {
      method: "PUT",
      body: JSON.stringify({ values: [HEADER] }),
    });
  }
}

export async function appendOrder(order: Order): Promise<void> {
  await ensureHeader();
  const row = [
    order.id,
    order.createdAt,
    order.status,
    order.customer.name,
    order.customer.kana,
    order.customer.email,
    order.customer.phone,
    order.customer.postal,
    order.customer.address,
    itemsText(order.items),
    order.subtotal ?? "",
    order.shipping ?? "",
    order.total,
    order.note ?? "",
    JSON.stringify(order.items),
  ];
  const res = await api(
    `/values/A:${LAST_COL}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    { method: "POST", body: JSON.stringify({ values: [row] }) },
  );
  if (!res.ok) throw new Error(`注文の記録に失敗: ${res.status} ${(await res.text()).slice(0, 200)}`);
}

function rowToOrder(r: string[]): Order {
  let items: OrderItem[] = [];
  try {
    items = JSON.parse(r[14] ?? "[]") as OrderItem[];
  } catch {
    items = [];
  }
  return {
    id: r[0] ?? "",
    createdAt: r[1] ?? "",
    status: (r[2] as OrderStatus) || "受付",
    customer: {
      name: r[3] ?? "",
      kana: r[4] ?? "",
      email: r[5] ?? "",
      phone: r[6] ?? "",
      postal: r[7] ?? "",
      address: r[8] ?? "",
    },
    items,
    subtotal: r[10] ? Number(r[10]) : undefined,
    shipping: r[11] ? Number(r[11]) : undefined,
    total: Number(r[12] ?? 0),
    ...(r[13] ? { note: r[13] } : {}),
  };
}

export async function readOrders(): Promise<Order[]> {
  const res = await api(`/values/A2:${LAST_COL}`);
  if (!res.ok) throw new Error(`注文の取得に失敗: ${res.status}`);
  const json = (await res.json()) as { values?: string[][] };
  const rows = json.values ?? [];
  return rows
    .filter((r) => r[0])
    .map(rowToOrder)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

// 注文番号から、その行番号（スプレッドシート上の1始まり行）を探す
async function findRow(id: string): Promise<number | null> {
  const res = await api(`/values/A:A`);
  if (!res.ok) throw new Error(`行の検索に失敗: ${res.status}`);
  const json = (await res.json()) as { values?: string[][] };
  const rows = json.values ?? [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === id) return i + 1; // 1始まり
  }
  return null;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<boolean> {
  const row = await findRow(id);
  if (!row) return false;
  const res = await api(`/values/C${row}?valueInputOption=RAW`, {
    method: "PUT",
    body: JSON.stringify({ values: [[status]] }),
  });
  if (!res.ok) throw new Error(`ステータス更新に失敗: ${res.status}`);
  return true;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const row = await findRow(id);
  if (!row) return false;
  // 先頭シート（gridId=0）の該当行を削除（0始まりの行インデックス）
  const res = await api(`:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: { sheetId: 0, dimension: "ROWS", startIndex: row - 1, endIndex: row },
          },
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`行の削除に失敗: ${res.status}`);
  return true;
}

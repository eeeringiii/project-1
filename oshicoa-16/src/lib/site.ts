/** サイト全体のメタ情報。NEXT_PUBLIC_SITE_URL が未設定でもビルド可能なフォールバックを持つ。 */
export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://oshicoa16.example.com";

export const siteMeta = {
  siteName: "OSHICOA 16",
  reading: "オシコア・シックスティーン",
  title: "OSHICOA 16｜ヲタク生態診断",
  mainCopy: "推しが変わっても、あなたの“推し方の本性”は変わらない。",
  subCopy:
    "現場、積み、布教、同担、供給、ファンサ、解釈。あなたを動かしている「ヲタクの核」を、16の生態に分類します。",
  description:
    "OSHICOA 16は、愛の量ではなく“愛がどこへ向かうか”を診断する推し活診断。全24問・約3〜4分・登録不要。あなたのヲタク生態を16タイプに分類し、業タグ・関係フェーズ・能力値まで可視化します。",
  keywords: [
    "推し活診断",
    "オタク診断",
    "ヲタク診断",
    "推しタイプ診断",
    "推し方診断",
    "推し活16タイプ",
    "同担相性診断",
    "OSHICOA16",
  ],
  // X公式アカウント（プレースホルダー）
  xAccount: "@oshicoa16",
  contactEmail: "contact@oshicoa16.example.com",
} as const;

export function absoluteUrl(path = "/"): string {
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

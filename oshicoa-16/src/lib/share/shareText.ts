import type { OshicoaType, OtakuTag } from "@/types";
import { absoluteUrl } from "@/lib/site";

const HASHTAGS = ["OSHICOA16", "ヲタク生態診断"];

/**
 * Xシェア文を生成する。推し名の有無で文面を出し分ける。
 * 推し名はローカルでの文面生成にのみ使い、URL（クエリ）には含めない。
 */
export function buildXShareText(type: OshicoaType, tags: OtakuTag[], oshiName?: string): string {
  const tagLine = tags.length
    ? `業タグ：${tags.map((t) => `#${t.name}`).join(" ")}\n`
    : "";
  const head = oshiName
    ? `${oshiName}を推しているときの私のヲタク生態は\n「${type.code}｜${type.name}」でした。`
    : `私のヲタク生態は\n「${type.code}｜${type.name}」でした。`;
  return `${head}\n${type.catchphrase}\n${tagLine}\nあなたの推し方の本性は？\n${HASHTAGS.map((h) => `#${h}`).join(" ")}`;
}

/** 共有URLはタイプページのみ（個人入力情報を含めない）。 */
export function buildShareUrl(typeCode: string): string {
  return absoluteUrl(`/types/${typeCode}`);
}

export function buildXShareLink(type: OshicoaType, tags: OtakuTag[], oshiName?: string): string {
  const text = buildXShareText(type, tags, oshiName);
  const url = buildShareUrl(type.code);
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

export function buildLineShareLink(typeCode: string): string {
  const url = buildShareUrl(typeCode);
  return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;
}

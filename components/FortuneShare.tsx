'use client';
import { getType } from '@/data/types';

// 今日の運勢用のシェア文言。診断結果の Share と同じく X / LINE / コピー / Web Share に対応。
// url はサーバー側（app/fortune/page.tsx）で組み立てて渡す。
// ここで location を読むとサーバー描画とズレる（ハイドレーション不一致）ため、参照しないこと。
export function FortuneShare({ level, headline, topCategory, luckyAction, typeCode, url }: {
  level: string; headline: string; topCategory: string; luckyAction: string; typeCode?: string; url: string;
}) {
  const typeName = typeCode ? getType(typeCode)?.name : undefined;
  const lead = typeName ? `【${typeName}】の今日の推し活運勢は` : '今日の推し活運勢は';
  const text = `${lead}「${level}」🔮\n${headline}\n\n今日の一番は${topCategory}。\nラッキー推し活は「${luckyAction}」\n\n#OSHICOA16 #今日の推し活運勢`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); alert('URLをコピーしました'); }
    catch { prompt('このURLをコピーしてください', url); }
  };
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <a className="button" target="_blank" href={`https://x.com/intent/post?text=${encodeURIComponent(text + ' ' + url)}`}>Xで共有</a>
      <a className="button ghost" target="_blank" href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`}>LINE</a>
      <button className="button ghost" onClick={copy}>URLをコピー</button>
      <button className="button ghost" onClick={() => navigator.share?.({ title: 'OSHICOA 16｜今日の推し活運勢', text, url }).catch(() => {})}>共有</button>
    </div>
  );
}

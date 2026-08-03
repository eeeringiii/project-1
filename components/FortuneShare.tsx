'use client';

import { useSyncExternalStore } from 'react';

// 共有URLは絶対URLが必要だが、origin はブラウザでしか分からない。
// SSRとクライアントで直接出し分けるとハイドレーションがズレるため、
// stores/diagnosis.ts と同じ useSyncExternalStore で安全に読む
// （SSR/初期表示は空文字、ハイドレーション後に実際の origin へ切り替わる）。
const subscribe = () => () => {};
const getOrigin = () => location.origin;
const getServerOrigin = () => '';

/**
 * 今日の運勢用のシェアボタン。診断結果の Share と同じ並び（X / LINE / コピー / その他）。
 * 文言を変えたいときは下の `text` を書き換えてください。
 */
export function FortuneShare({ level, emoji, headline, topCategory, luckyAction, typeCode, typeName }: {
  level: string; emoji: string; headline: string; topCategory: string;
  luckyAction: string; typeCode?: string; typeName?: string;
}) {
  const origin = useSyncExternalStore(subscribe, getOrigin, getServerOrigin);
  const url = origin ? `${origin}/fortune${typeCode ? `?type=${typeCode}` : ''}` : '';

  const lead = typeName ? `【${typeName}】の今日の推し活運勢は` : '今日の推し活運勢は';
  const text = `${lead}「${level}」${emoji}\n${headline}\n\n今日の一番は${topCategory}。\nラッキー推し活は「${luckyAction}」\n\n#OSHICOA16 #今日の推し活運勢`;

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); alert('URLをコピーしました'); }
    catch { prompt('このURLをコピーしてください', url); }
  };

  return (
    <div className="shareRow">
      <a className="button" target="_blank" href={`https://x.com/intent/post?text=${encodeURIComponent(text + ' ' + url)}`}>Xでシェア</a>
      <a className="button ghost" target="_blank" href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`}>LINE</a>
      <button className="button ghost" onClick={copy}>URLをコピー</button>
      <button className="button ghost" onClick={() => navigator.share?.({ title: 'OSHICOA 16｜今日の推し活運勢', text, url }).catch(() => {})}>その他で共有</button>
    </div>
  );
}

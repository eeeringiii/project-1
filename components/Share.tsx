'use client';

import { OshicoaType, OtakuTag } from '@/types';

export function Share({ type, tags, name }: { type: OshicoaType; tags: OtakuTag[]; name?: string }) {
  const text = `${name ? `${name}を推しているときの` : '私の'}ヲタク生態は「${type.code}｜${type.name}」でした。\n\n${type.catchphrase}\n\n業タグ：${tags.map(tag => '#' + tag.name).join(' ')}\n#OSHICOA16 #ヲタク生態診断`;
  const url = typeof window === 'undefined' ? '' : `${location.origin}/types/${type.code}`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); alert('URLをコピーしました'); }
    catch { prompt('このURLをコピーしてください', url); }
  };

  return (
    <div className="shareRow">
      <a className="button" target="_blank" href={`https://x.com/intent/post?text=${encodeURIComponent(text + ' ' + url)}`}>Xでシェア</a>
      <a className="button ghost" target="_blank" href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`}>LINE</a>
      <button className="button ghost" onClick={copy}>URLをコピー</button>
      <button className="button ghost" onClick={() => navigator.share?.({ title: 'OSHICOA 16', text, url }).catch(() => {})}>その他で共有</button>
    </div>
  );
}

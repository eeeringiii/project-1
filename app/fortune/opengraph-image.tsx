import { ImageResponse } from 'next/og';
import { getFortune } from '@/lib/fortune';

// /fortune の日替わりOG画像。日付（JST）で内容が変わるので毎日更新される。
export const runtime = 'edge';
export const revalidate = 3600;
export const alt = 'OSHICOA 16｜今日の推し活運勢';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const f = getFortune();
  return new ImageResponse(
    (
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#090914', color: '#fff', padding: 72, fontFamily: 'sans-serif' }}>
        <span style={{ fontSize: 30, color: '#f0abfc' }}>OSHICOA 16｜今日の推し活運勢</span>
        <span style={{ fontSize: 34, color: '#d4d0dd', marginTop: 18 }}>{f.displayDate}</span>
        <strong style={{ fontSize: 132, marginTop: 24, color: f.level.tone }}>{f.level.emoji} {f.level.name}</strong>
        <span style={{ fontSize: 46, marginTop: 20 }}>{f.headline}</span>
        <span style={{ fontSize: 30, color: '#a5b4fc', marginTop: 28 }}>#OSHICOA16 #今日の推し活運勢</span>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

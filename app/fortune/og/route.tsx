import { ImageResponse } from 'next/og';
import { getFortune } from '@/lib/fortune';

// 今日の運勢のOG画像。?type= があればタイプ名も載せてパーソナライズする。
// （opengraph-image のファイル規約は searchParams を受け取れないため、動的ルートで実装）
export const runtime = 'edge';

export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get('type') || undefined;
  const f = getFortune({ typeCode: type });
  return new ImageResponse(
    (
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#090914', color: '#fff', padding: 72, fontFamily: 'sans-serif' }}>
        <span style={{ fontSize: 30, color: '#f0abfc' }}>OSHICOA 16｜今日の推し活運勢</span>
        <span style={{ fontSize: 32, color: '#d4d0dd', marginTop: 16 }}>
          {f.displayDate}{f.typeName ? `　/　${f.typeCode} ${f.typeName}` : ''}
        </span>
        <strong style={{ fontSize: 128, marginTop: 20, color: f.level.tone }}>{f.level.emoji} {f.level.name}</strong>
        <span style={{ fontSize: 46, marginTop: 18 }}>{f.headline}</span>
        <span style={{ fontSize: 28, color: '#a5b4fc', marginTop: 26 }}>#OSHICOA16 #今日の推し活運勢</span>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

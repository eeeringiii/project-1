import { ImageResponse } from 'next/og';
import { getType } from '@/data/types';
import { getFortune } from '@/lib/fortune';

// 今日の運勢のOG画像。?type= があればタイプ名も載せてパーソナライズする。
// （opengraph-image のファイル規約は searchParams を受け取れないため、動的ルートで実装）
// 見た目は /api/og（タイプのOG画像）と同じ「みるくポップ」に揃えている。
export const runtime = 'edge';

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get('type') || undefined;
  const type = code ? getType(code) : undefined;
  const fortune = getFortune({ typeCode: type?.code });

  return new ImageResponse(
    <div style={{ height: '100%', width: '100%', display: 'flex', padding: 44, background: fortune.level.tone, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, background: '#ffffff', border: '5px solid #3a2a4d', borderRadius: 44, padding: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ background: '#3a2a4d', color: '#fff', fontSize: 26, fontWeight: 700, padding: '10px 24px', borderRadius: 999 }}>OSHICOA 16</span>
          <span style={{ marginLeft: 20, fontSize: 26, color: '#7c6b90' }}>今日の推し活運勢</span>
        </div>
        <span style={{ fontSize: 28, color: '#7c6b90', marginTop: 26 }}>
          {fortune.displayDate}{type ? `　/　${type.code} ${type.name}` : ''}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
          <span style={{ fontSize: 96 }}>{fortune.level.emoji}</span>
          <span style={{ fontSize: 108, fontWeight: 700, color: '#3a2a4d', marginLeft: 20 }}>{fortune.level.name}</span>
        </div>
        <span style={{ fontSize: 38, color: '#3a2a4d', marginTop: 18, fontWeight: 700 }}>{fortune.headline}</span>
        <span style={{ fontSize: 26, color: '#ff6fa3', marginTop: 30, fontWeight: 700 }}>#今日の推し活運勢</span>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}

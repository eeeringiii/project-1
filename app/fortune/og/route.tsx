import { ImageResponse } from 'next/og';
import { getFortune } from '@/lib/fortune';

// 今日の運勢のOG画像。?type= があればタイプ名も載せてパーソナライズする。
// （opengraph-image のファイル規約は searchParams を受け取れないため、動的ルートで実装）
//
// 見た目は診断結果のOG（app/api/og）と同じ「みるくポップ」のシール風カードに揃えている。
// 背景色は data/fortune.ts の LEVELS[].tone を使うので、色はあちらを書き換えれば変わります。
// ※ OG画像は端末のフォントに頼れないため、全角の「｜」など一部の記号は使わない（豆腐□になります）。
export const runtime = 'edge';

export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get('type') || undefined;
  const f = getFortune({ typeCode: type });
  return new ImageResponse(
    (
      <div style={{ height: '100%', width: '100%', display: 'flex', padding: 44, background: f.level.tone, fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, background: '#ffffff', border: '5px solid #3a2a4d', borderRadius: 44, padding: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ background: '#3a2a4d', color: '#fff', fontSize: 26, fontWeight: 700, padding: '10px 24px', borderRadius: 999 }}>OSHICOA 16</span>
            <span style={{ marginLeft: 20, fontSize: 26, color: '#7c6b90' }}>今日の推し活運勢</span>
          </div>
          <span style={{ fontSize: 28, color: '#7c6b90', marginTop: 28 }}>
            {f.displayDate}{f.typeName ? `　${f.typeCode} ${f.typeName}` : ''}
          </span>
          <span style={{ fontSize: 104, fontWeight: 700, color: '#3a2a4d', marginTop: 8 }}>{f.level.emoji} {f.level.name}</span>
          <span style={{ fontSize: 40, color: '#3a2a4d', marginTop: 16 }}>{f.headline}</span>
          <span style={{ fontSize: 26, color: '#ff6fa3', marginTop: 30, fontWeight: 700 }}>#今日の推し活運勢</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

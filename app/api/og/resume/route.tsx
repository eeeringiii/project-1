import { ImageResponse } from 'next/og';

// ヲタク履歴書のOG画像。中身は端末内の入力なので、ここでは「作れること」だけを伝える。
// 見た目は /api/og・/api/og/fortune・/api/og/bingo と同じ「みるくポップ」に揃えている。
export const runtime = 'edge';

const ROWS = [
  ['推し', '〇〇くん'],
  ['ジャンル', '男性アイドル'],
  ['推し歴', '3〜5年'],
  ['現場頻度', '行ける限り行く'],
];

export function GET() {
  return new ImageResponse(
    <div style={{ height: '100%', width: '100%', display: 'flex', padding: 44, background: '#eae0ff', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', flex: 1, background: '#ffffff', border: '5px solid #3a2a4d', borderRadius: 44, padding: 56 }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ background: '#3a2a4d', color: '#fff', fontSize: 26, fontWeight: 700, padding: '10px 24px', borderRadius: 999 }}>OSHICOA 16</span>
          </div>
          <span style={{ fontSize: 86, fontWeight: 700, color: '#3a2a4d', marginTop: 26 }}>ヲタク履歴書</span>
          <span style={{ fontSize: 34, color: '#3a2a4d', marginTop: 14, fontWeight: 700 }}>
            あなたの推し活を、1枚のカードに。
          </span>
          <span style={{ fontSize: 26, color: '#7c6b90', marginTop: 16 }}>書けるところだけ埋めて、画像で保存・シェア</span>
          <span style={{ fontSize: 26, color: '#ff6fa3', marginTop: 26, fontWeight: 700 }}>#ヲタク履歴書</span>
        </div>

        {/* カードの見本 */}
        <div style={{ display: 'flex', flexDirection: 'column', width: 360, marginLeft: 40, padding: 28, borderRadius: 28, border: '4px solid #3a2a4d', background: '#fffafe' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#c45f95' }}>ヲタクネーム</span>
          <span style={{ fontSize: 38, fontWeight: 700, color: '#3a2a4d', marginTop: 4 }}>ななしのヲタク</span>
          <div style={{ display: 'flex', marginTop: 14 }}>
            <span style={{ background: '#eae0ff', color: '#6b3fd4', fontSize: 18, fontWeight: 700, padding: '8px 18px', borderRadius: 999 }}>RCGT　覇権プロデューサー</span>
          </div>
          {ROWS.map(([label, value]) => (
            <div key={label} style={{ display: 'flex', marginTop: 16 }}>
              <span style={{ fontSize: 19, fontWeight: 700, color: '#c45f95', width: 110 }}>{label}</span>
              <span style={{ fontSize: 19, color: '#473d69' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}

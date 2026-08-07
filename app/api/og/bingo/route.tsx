import { ImageResponse } from 'next/og';

// ヲタク業ビンゴのOG画像。結果は端末内の状態なので、ここでは「遊べること」が伝わる
// 誘い文句だけを載せる。見た目は /api/og・/api/og/fortune と同じ「みるくポップ」に揃えている。
export const runtime = 'edge';

// 盤面のイメージ。実際のカードではなく、雰囲気を伝えるための飾り。
const PREVIEW = [
  '供給が来たら秒で保存', '当落で情緒が乱高下', '「限定」で理性が溶ける',
  '推し活の予定が最優先', '推し活してる時点で優勝', '部屋に小さな祭壇がある',
  'ファンサを脳内で再生', '推しの幸せが自分の幸せ', '現場の一体感で毎回優勝',
];

export function GET() {
  return new ImageResponse(
    <div style={{ height: '100%', width: '100%', display: 'flex', padding: 44, background: '#ffeecb', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', flex: 1, background: '#ffffff', border: '5px solid #3a2a4d', borderRadius: 44, padding: 56 }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ background: '#3a2a4d', color: '#fff', fontSize: 26, fontWeight: 700, padding: '10px 24px', borderRadius: 999 }}>OSHICOA 16</span>
          </div>
          <span style={{ fontSize: 86, fontWeight: 700, color: '#3a2a4d', marginTop: 26 }}>ヲタク業ビンゴ</span>
          <span style={{ fontSize: 34, color: '#3a2a4d', marginTop: 14, fontWeight: 700 }}>
            あなたのヲタクの業、いくつ当てはまる？
          </span>
          <span style={{ fontSize: 26, color: '#7c6b90', marginTop: 16 }}>タップして埋めるだけ・毎日カードが変わります</span>
          <span style={{ fontSize: 26, color: '#ff6fa3', marginTop: 26, fontWeight: 700 }}>#ヲタク業ビンゴ</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', width: 372, marginLeft: 40 }}>
          {PREVIEW.map((item, i) => (
            <div
              key={item}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                width: 116, height: 116, margin: 4, padding: 8, borderRadius: 20,
                border: '3px solid #3a2a4d', lineHeight: 1.25,
                background: i === 4 ? '#ff6fa3' : i % 3 === 0 ? '#ffe0ec' : '#ffffff',
                color: i === 4 ? '#ffffff' : '#3a2a4d',
                fontSize: 15, fontWeight: 700,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}

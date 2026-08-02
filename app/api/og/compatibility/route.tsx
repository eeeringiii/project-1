import { ImageResponse } from 'next/og';
import { SCENE_LABELS } from '@/data/compatibility/sceneFit';
import { getType } from '@/data/types';
import { calculateCompatibility, normalizeOshicoaCode } from '@/lib/compatibility';
import { getTypeTheme } from '@/lib/theme';

export const runtime = 'edge';

// ImageResponse（Satori）はFragmentやgridを扱えないため、
// すべて display:flex の div を明示的に積み上げています。
const row = { display: 'flex', width: '100%', flexShrink: 0 } as const;

/**
 * 相性診断のOG画像。
 * ?me=RCGT&partner=CEMS のように渡すと、その2人向けの画像になります。
 * 不正な値・未指定のときは、相性診断ページ共通のカードを返します。
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const me = normalizeOshicoaCode(params.get('me'));
  const partner = normalizeOshicoaCode(params.get('partner'));
  const meType = me ? getType(me) : undefined;
  const partnerType = partner ? getType(partner) : undefined;
  const result = meType && partnerType ? calculateCompatibility(meType.code, partnerType.code) : undefined;

  const meTheme = getTypeTheme(me ?? 'RCGT');
  const partnerTheme = getTypeTheme(partner ?? 'CEMS');

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          padding: 40,
          background: `linear-gradient(135deg, ${meTheme.chip} 0%, #fff7f2 50%, ${partnerTheme.chip} 100%)`,
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            background: '#ffffff',
            border: '5px solid #3a2a4d',
            borderRadius: 44,
            padding: '44px 56px',
          }}
        >
          <div style={{ ...row, alignItems: 'center' }}>
            <span
              style={{
                background: '#3a2a4d',
                color: '#ffffff',
                fontSize: 26,
                fontWeight: 700,
                padding: '10px 24px',
                borderRadius: 999,
              }}
            >
              OSHICOA 16
            </span>
            <span style={{ marginLeft: 18, fontSize: 26, color: '#7c6b90', fontWeight: 700 }}>
              推し活相性診断
            </span>
          </div>

          {result && meType && partnerType ? (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <div style={{ ...row, marginTop: 26 }}>
                <span style={{ fontSize: 42, fontWeight: 700, color: '#3a2a4d', lineHeight: 1.3 }}>
                  {meType.name} × {partnerType.name}
                </span>
              </div>
              <div style={{ ...row, marginTop: 6 }}>
                <span style={{ fontSize: 24, color: '#7c6b90', letterSpacing: 4 }}>
                  {meType.code} × {partnerType.code}
                </span>
              </div>
              <div style={{ ...row, alignItems: 'flex-end', marginTop: 16 }}>
                <span style={{ fontSize: 32, color: '#7c6b90', marginBottom: 16 }}>総合相性</span>
                <span
                  style={{
                    fontSize: 100,
                    fontWeight: 700,
                    color: '#ff6fa3',
                    marginLeft: 16,
                    lineHeight: 1,
                  }}
                >
                  {result.overallScore}
                </span>
                <span style={{ fontSize: 46, fontWeight: 700, color: '#ff6fa3', marginBottom: 8 }}>%</span>
              </div>
              <div style={{ ...row, marginTop: 16 }}>
                <span
                  style={{
                    background: '#eae0ff',
                    color: '#5b3b7a',
                    fontSize: 26,
                    fontWeight: 700,
                    padding: '10px 24px',
                    borderRadius: 999,
                  }}
                >
                  {result.pairTitle}
                </span>
              </div>
              <div style={{ ...row, marginTop: 20 }}>
                <span style={{ fontSize: 24, color: '#7c6b90' }}>
                  {SCENE_LABELS.renban} {result.scenes[0].score}%　/　{SCENE_LABELS.expedition}{' '}
                  {result.scenes[1].score}%　/　{SCENE_LABELS.afterTalk} {result.scenes[2].score}%
                </span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <div style={{ ...row, marginTop: 28 }}>
                <span style={{ fontSize: 62, fontWeight: 700, color: '#3a2a4d', lineHeight: 1.3 }}>
                  あの人と推したら、どんな関係になる？
                </span>
              </div>
              <div style={{ ...row, marginTop: 22 }}>
                <span style={{ fontSize: 30, color: '#7c6b90', lineHeight: 1.5 }}>
                  2人のOSHICOAタイプから、連番・遠征・感想会・交換・応援企画の相性を解析します。
                </span>
              </div>
              <div style={{ ...row, marginTop: 26 }}>
                <span style={{ fontSize: 26, color: '#ff6fa3', fontWeight: 700 }}>#推し活相性診断</span>
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

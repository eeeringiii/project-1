import { ImageResponse } from 'next/og';
import { getType } from '@/data/types';
import { getTypeTheme } from '@/lib/theme';

export const runtime = 'edge';

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get('type') || 'CEMS';
  const type = getType(code) || getType('CEMS')!;
  const theme = getTypeTheme(type.code);

  return new ImageResponse(
    <div style={{ height: '100%', width: '100%', display: 'flex', padding: 44, background: theme.chip, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, background: '#ffffff', border: '5px solid #3a2a4d', borderRadius: 44, padding: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ background: '#3a2a4d', color: '#fff', fontSize: 26, fontWeight: 700, padding: '10px 24px', borderRadius: 999 }}>OSHICOA 16</span>
          <span style={{ marginLeft: 20, fontSize: 26, color: '#7c6b90', letterSpacing: 4 }}>{type.code}</span>
        </div>
        <span style={{ fontSize: 88, fontWeight: 700, color: '#3a2a4d', marginTop: 34 }}>{type.name}</span>
        <span style={{ fontSize: 36, color: '#7c6b90', marginTop: 22 }}>{type.catchphrase}</span>
        <span style={{ fontSize: 26, color: '#ff6fa3', marginTop: 34, fontWeight: 700 }}>#ヲタク生態診断</span>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}

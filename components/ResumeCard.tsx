'use client';

import { forwardRef } from 'react';
import { OshicoaType } from '@/types';
import { ResumeInput, resumeFields, resumeProfileRows } from '@/data/resume';

export const RESUME_CARD_WIDTH = 1080;
export const RESUME_CARD_HEIGHT = 1440;

/** 指定文字数で折り返して描く。SVGのtextは自動で折り返さないため自前で分ける。 */
function Lines({ text, x, y, size = 26, max = 26, line = 1.4, fill = '#473d69', weight = 500 }: {
  text: string; x: number; y: number; size?: number; max?: number; line?: number; fill?: string; weight?: number;
}) {
  const rows: string[] = [];
  for (let i = 0; i < text.length; i += max) rows.push(text.slice(i, i + max));
  if (rows.length === 0) rows.push('');
  return (
    <text x={x} y={y} fontSize={size} fill={fill} fontWeight={weight}>
      {rows.map((row, i) => <tspan x={x} dy={i ? size * line : 0} key={`${row}-${i}`}>{row}</tspan>)}
    </text>
  );
}

/**
 * ヲタク履歴書のカード。PNG保存は既存の downloadSvgAsPng に渡すので、
 * 画面表示と保存画像がまったく同じものになる（別々に組み立てない）。
 */
export const ResumeCard = forwardRef<SVGSVGElement, {
  input: ResumeInput;
  type?: OshicoaType;
  className?: string;
}>(({ input, type, className }, ref) => {
  const name = input.displayName?.trim() || 'ななしのヲタク';
  const rows = resumeProfileRows(input);

  return (
    <svg
      ref={ref}
      className={className}
      viewBox={`0 0 ${RESUME_CARD_WIDTH} ${RESUME_CARD_HEIGHT}`}
      role="img"
      aria-label={`${name}のヲタク履歴書`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={RESUME_CARD_WIDTH} height={RESUME_CARD_HEIGHT} fill="#f6f0ff" />
      <rect x="24" y="24" width={RESUME_CARD_WIDTH - 48} height={RESUME_CARD_HEIGHT - 48} rx="38" fill="#fffafe" stroke="#cbb9e5" strokeWidth="4" />

      {/* 飾り。右上は「OTAKU RESUME」の見出しとキャラクター画像で埋まるため、
          飾りは左下の余白だけに置く（重なりを避ける＋情報の邪魔をしない）。 */}
      <text x="60" y="1385" fontSize="34" fill="#d7a44a">✦</text>
      <text x="112" y="1392" fontSize="26" fill="#d985b6">♡</text>
      <circle cx="162" cy="1376" r="10" fill="#dcd3f5" />

      {/* ヘッダー */}
      <rect x="58" y="52" width="265" height="54" rx="27" fill="#7658b8" />
      <text x="190" y="88" textAnchor="middle" fontSize="25" fontWeight="800" fill="#fff">OSHICOA 16</text>
      <text x={RESUME_CARD_WIDTH - 60} y="86" textAnchor="end" fontSize="21" fontWeight="700" fill="#a586c8">OTAKU RESUME</text>

      {/* 名前 */}
      <text x="62" y="196" fontSize="22" fontWeight="800" fill="#c45f95">ヲタクネーム</text>
      <text x="62" y="256" fontSize="56" fontWeight="900" fill="#342858">{name}</text>

      {/* 診断済みならタイプを載せる。未診断でもカードは成立する */}
      {type ? (
        <g transform="translate(62 292)">
          <rect width="640" height="64" rx="32" fill="#eae0ff" />
          <text x="30" y="42" fontSize="24" fontWeight="800" fill="#6b3fd4">
            {type.code}　{type.name}
          </text>
        </g>
      ) : (
        <text x="62" y="334" fontSize="22" fill="#9a8aaf">診断するとヲタク生態も載せられます</text>
      )}
      {type && (
        <image
          href={`/characters/${type.code.toLowerCase()}.png`}
          x="770" y="150" width="250" height="215"
          preserveAspectRatio="xMidYMax meet"
          aria-label={`${type.name}のキャラクター`}
        />
      )}

      {/* 基本情報 */}
      <g transform="translate(62 400)">
        <rect width="956" height="272" rx="28" fill="#ffffff" stroke="#dacded" strokeWidth="3" />
        <text x="30" y="52" fontSize="26" fontWeight="800" fill="#7b5aaa">推しプロフィール</text>
        {rows.map(([label, value], i) => (
          <g key={label} transform={`translate(30 ${104 + i * 46})`}>
            <text fontSize="21" fontWeight="800" fill="#c45f95">{label}</text>
            <text x="160" fontSize="22" fill="#473d69">{value}</text>
          </g>
        ))}
      </g>

      {/* 自由記述 */}
      <g transform="translate(62 700)">
        <rect width="956" height="600" rx="28" fill="#ffffff" stroke="#dacded" strokeWidth="3" />
        {resumeFields.map((field, i) => (
          <g key={field.key} transform={`translate(30 ${58 + i * 143})`}>
            <text fontSize="22" fontWeight="800" fill="#c45f95">{field.label}</text>
            <Lines
              text={(input[field.key] ?? '').trim() || '—'}
              x={0} y={44} size={25} max={36}
              fill={(input[field.key] ?? '').trim() ? '#473d69' : '#b6a9c7'}
            />
          </g>
        ))}
      </g>

      <text x={RESUME_CARD_WIDTH - 62} y={RESUME_CARD_HEIGHT - 46} textAnchor="end" fontSize="23" fontWeight="800" fill="#8b70b3">
        #OSHICOA16 #ヲタク履歴書
      </text>
    </svg>
  );
});

ResumeCard.displayName = 'ResumeCard';

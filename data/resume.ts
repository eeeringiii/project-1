// ヲタク履歴書の自由記述欄。
//
// 項目を足す・減らす・文言を変えるときは、この配列だけ触れば入力欄とカードの両方に反映されます。
//
// ── 設問の決まり ────────────────────────────────
//  1. すべて任意。空欄でもカードが成立するように、単独で意味が通る項目にする。
//  2. 課金額や現場数を書かせない（README「課金額や現場数を評価せず」）。
//     「どれだけ使ったか」ではなく「どう好きか」を聞く。
//  3. 答えやすさ優先。placeholder に具体例を必ず置く。
//  4. maxLength はカードに収まる上限。増やすときはカードの表示も確認すること。
// ──────────────────────────────────────────

export interface ResumeField {
  key: string;
  label: string;
  placeholder: string;
  maxLength: number;
  /** true なら複数行で入力する（カードでも折り返して表示）。 */
  multiline?: boolean;
}

export const resumeFields: ResumeField[] = [
  {
    key: 'trigger',
    label: '沼落ちのきっかけ',
    placeholder: '友達に見せられた一本の動画から',
    maxLength: 60,
    multiline: true,
  },
  {
    key: 'favoritePoint',
    label: '好きなところ',
    placeholder: '努力を絶対に人に見せないところ',
    maxLength: 60,
    multiline: true,
  },
  {
    key: 'motto',
    label: '推し活ポリシー',
    placeholder: '無理はしない。でも勝負所は逃さない。',
    maxLength: 60,
    multiline: true,
  },
  {
    key: 'pitch',
    label: '布教するならこの一言',
    placeholder: 'とりあえず一回だけ見て。それで十分。',
    maxLength: 60,
    multiline: true,
  },
];

/** 入力内容。すべて任意なので、どのキーも欠けうる。 */
export type ResumeInput = {
  displayName?: string;
  oshiName?: string;
  genre?: string;
  duration?: string;
  frequency?: string;
} & Partial<Record<string, string>>;

/** カードの上部に出す基本情報。値が無い項目は「—」で埋めて、枠が崩れないようにする。 */
export function resumeProfileRows(input: ResumeInput): [string, string][] {
  return [
    ['推し', input.oshiName?.trim() || '—'],
    ['ジャンル', input.genre || '—'],
    ['推し歴', input.duration || '—'],
    ['現場頻度', input.frequency || '—'],
  ];
}

/** 何項目入力できているか（カードの「記入率」表示に使う）。 */
export function resumeFilledCount(input: ResumeInput): number {
  const keys = ['displayName', 'oshiName', 'genre', 'duration', 'frequency', ...resumeFields.map(f => f.key)];
  return keys.filter(key => (input[key] ?? '').trim() !== '').length;
}

export const resumeTotalFields = 5 + resumeFields.length;

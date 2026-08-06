// ヲタク業ビンゴのマス目データ。
//
// 文言を足したり直したりするときは、このファイルだけ触れば反映されます。
//
// ── 書きかたの決まり ──────────────────────────────
//  1. 短く。5×5のマスに入るので全角13文字までを目安に（長いと文字が潰れます）。
//  2. 課金額や現場数で優劣をつけない（README「課金額や現場数を評価せず」）。
//     「いくら使った」ではなく「どう振る舞うか」を書く。
//  3. ジャンルを限定しない。アイドルでも声優でもVTuberでも「わかる」内容にする。
//  4. 自虐は軽く、笑って頷ける範囲まで。刺す言葉にはしない。
//  5. 二人称は省略して、行動をそのまま言い切る形にする。
// ────────────────────────────────────────────

/** マスに入る「あるある」。ここから24個を選んでカードを作ります。 */
export const bingoItems: string[] = [
  '供給が来たら秒で保存',
  'セトリを帰り道で即再生',
  '「無理」だけで会話が成立',
  '推しの誕生日は自分の記念日',
  '現場の余韻で数日動けない',
  '当落で情緒が乱高下',
  'グッズの置き場所がもう無い',
  '同担のレポを巡回して答え合わせ',
  '昔のブログまで読破済み',
  '遠征先は観光より会場導線',
  '「限定」の二文字で理性が溶ける',
  'ランダムは出るまで終われない',
  'つい知らない人に布教する',
  '保存用と鑑賞用で複数買い',
  '推しの数字を本人より気にする',
  '認知されたい気持ちは一応ある',
  '現場の一体感で毎回優勝',
  'スクショで指が止まらない',
  '部屋に小さな祭壇がある',
  '降りる宣言から供給で復活',
  'トレカ交換の連絡が爆速',
  '推し活の予定が最優先',
  '感想を熟成させて長文投下',
  '記念日は必ず形に残す',
  '解釈を自分の中で完成させがち',
  '新規が増えると少し寂しい',
  'ファンサを脳内で再生検証',
  '硬質ケースを常備している',
  '推しが笑っただけで今日は勝ち',
  '遠征の荷造りが年々早い',
  'グッズは使わず存在を保護',
  'MCをメモに残している',
  '会場限定と店舗限定は別物',
  '推しがいない生活は無理',
  '応援企画をつい主導する',
  '推しの幸せが自分の幸せ',
  '通知音で心拍数が上がる',
  '推し色のものを無意識に選ぶ',
  '寝る前に供給を見返す',
  '推し友との通話が止まらない',
];

/** 中央のフリーマス。ここだけ最初から埋まっています。 */
export const BINGO_FREE_TEXT = '推し活してる\n時点で優勝';

/**
 * 埋めたマス数（フリー含む25マス）で決まるランク。
 * 上から順に判定するので、min の大きい順に並べてください。
 */
export const bingoRanks: { min: number; name: string; emoji: string; comment: string }[] = [
  { min: 25, name: '伝説のヲタク', emoji: '👑', comment: '全マス制覇。もはや推し活の生き字引です。' },
  { min: 19, name: '沼の主', emoji: '🌊', comment: '沼が深い。推しへの解像度が高すぎます。' },
  { min: 13, name: 'ガチヲタク', emoji: '🔥', comment: '推し活が生活にしっかり根を張っています。' },
  { min: 7, name: '通常運転ヲタク', emoji: '🌸', comment: '健やかな推し活。あなたのペースがいちばん。' },
  { min: 0, name: '見習いヲタク', emoji: '🌱', comment: 'これからが楽しい時期。ようこそ沼へ。' },
];

export function bingoRankFor(filledCount: number) {
  return bingoRanks.find(rank => filledCount >= rank.min) ?? bingoRanks[bingoRanks.length - 1];
}

/** 5×5 の中央がフリーマス。 */
export const BINGO_CENTER = 12;
export const BINGO_SIZE = 5;

/** 縦5・横5・斜め2 の計12ライン。 */
export const bingoLines: number[][] = [
  ...Array.from({ length: BINGO_SIZE }, (_, r) =>
    Array.from({ length: BINGO_SIZE }, (_, c) => r * BINGO_SIZE + c)),
  ...Array.from({ length: BINGO_SIZE }, (_, c) =>
    Array.from({ length: BINGO_SIZE }, (_, r) => r * BINGO_SIZE + c)),
  Array.from({ length: BINGO_SIZE }, (_, i) => i * BINGO_SIZE + i),
  Array.from({ length: BINGO_SIZE }, (_, i) => (i + 1) * (BINGO_SIZE - 1)),
];

/**
 * 種（seed）から24マスを選んで5×5に並べる。中央はフリー。
 * 同じ種なら必ず同じカードになるので、サーバーとクライアントで表示がズレません。
 */
export function buildBingoCard(seed: number): string[] {
  let a = seed >>> 0;
  const random = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const pool = [...bingoItems];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  let next = 0;
  return Array.from({ length: BINGO_SIZE * BINGO_SIZE }, (_, i) =>
    i === BINGO_CENTER ? BINGO_FREE_TEXT : pool[next++]);
}

/** 揃ったライン数と、その構成マス。 */
export function countBingoLines(filled: ReadonlySet<number>) {
  const completed = bingoLines.filter(line => line.every(i => filled.has(i)));
  return { count: completed.length, cells: new Set(completed.flat()) };
}

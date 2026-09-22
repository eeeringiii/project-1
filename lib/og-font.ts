/**
 * OG画像（/api/og/*）で本文と同じ Zen Maru Gothic を使うための読み込み処理。
 *
 * なぜ「実行時にダウンロード」なのか:
 * 日本語フォントは全グリフ入りだと数MBあり、OG画像の上限 500KB に収まらない。
 * Google Fonts の text= パラメータを使うと「その画像に出てくる文字だけ」に絞った
 * TTF が数KBで返ってくるので、それを都度取りに行っている。
 *
 * フォントを変えたいときは FAMILY を Google Fonts のフォント名に差し替えてください
 * （app/layout.tsx のサイト本文フォントも合わせて変更すること）。
 */

const FAMILY = 'Zen Maru Gothic';
const WEIGHTS = [400, 700] as const;

/** JSX の fontFamily に指定する値。取得に失敗したときは sans-serif に落ちる。 */
export const OG_FONT_STACK = `${FAMILY}, sans-serif`;

type Weight = (typeof WEIGHTS)[number];

interface OgFont {
  name: string;
  data: ArrayBuffer;
  weight: Weight;
  style: 'normal';
}

interface OgImageOptions {
  width: number;
  height: number;
  fonts?: OgFont[];
}

// 同じ文字の組み合わせなら取得し直さない（同一インスタンス内でのみ有効）
const cache = new Map<string, Promise<OgFont[]>>();

/**
 * ImageResponse の第2引数。画像に載せる文字列をすべて渡すこと
 * （渡し忘れた文字はフォントに含まれず豆腐になります）。
 */
export async function ogImageOptions(...texts: (string | undefined)[]): Promise<OgImageOptions> {
  const fonts = await loadFonts(texts);
  return { width: 1200, height: 630, ...(fonts.length > 0 ? { fonts } : {}) };
}

function loadFonts(texts: (string | undefined)[]): Promise<OgFont[]> {
  // 重複を除いてURLを短く保つ。並べ替えて文字順の違いでキャッシュが分かれないようにする。
  const chars = [...new Set(texts.filter(Boolean).join(''))].sort().join('');
  if (!chars) return Promise.resolve([]);

  const cached = cache.get(chars);
  if (cached) return cached;

  // 失敗しても画像そのものは出したいので、ここで握りつぶして空配列にする。
  const pending = fetchSubset(chars).catch(() => []);
  cache.set(chars, pending);
  return pending;
}

async function fetchSubset(chars: string): Promise<OgFont[]> {
  const cssUrl =
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(FAMILY)}:wght@${WEIGHTS.join(';')}` +
    `&text=${encodeURIComponent(chars)}`;
  const css = await text(cssUrl);

  // text= 付きのリクエストには Google が必ず TTF を返す（satori は woff2 を読めない）。
  const faces = [...css.matchAll(/font-weight:\s*(\d+);[\s\S]*?src:\s*url\((https:\/\/[^)]+)\)/g)];

  return Promise.all(
    faces.map(async ([, weight, src]) => ({
      name: FAMILY,
      data: await binary(src),
      weight: Number(weight) as Weight,
      style: 'normal' as const,
    })),
  );
}

async function fetchOk(url: string): Promise<Response> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`font fetch failed: ${res.status} ${url}`);
  return res;
}

const text = (url: string) => fetchOk(url).then((r) => r.text());
const binary = (url: string) => fetchOk(url).then((r) => r.arrayBuffer());

// サイトの公開URL。OG画像・sitemap・robotsの絶対URL生成に使う唯一の基準値です。
// 独自ドメインに移行するときは、ここか Vercel の環境変数 NEXT_PUBLIC_SITE_URL を変えるだけで全ページに反映されます。
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://oshicoa16.vercel.app').replace(/\/$/, '');

/** 診断タイプごとのOG画像URL（SNSに貼られたときのカード画像）。 */
export const ogImageUrl = (typeCode: string) => `${SITE_URL}/api/og?type=${typeCode}`;

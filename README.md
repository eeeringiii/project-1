# OSHICOA 16

推しが変わっても、あなたの「推し方の本性」を16のヲタク生態として解析する、プライバシー優先の診断Webアプリです。課金額や現場数を評価せず、愛がどこへ向かうかを扱います。

## 技術

Next.js 16 (App Router)、TypeScript、Tailwind CSS v4、SVG レーダーチャート、ブラウザ標準の localStorage / Web Share / Clipboard API を使用しています。Vercel にそのままデプロイできます。

## 開発

```bash
npm install
npm run dev
npm run build
npm run lint
npm run typecheck
npm test        # 相性ロジックのユニットテスト（Vitest）
```

`NEXT_PUBLIC_SITE_URL` を設定すると canonical、sitemap、共有 URL の基準 URL に使用します。Google Analytics / GTM の ID は未設定でも動作する構成です（分析スクリプトの実装は導入時に追加します）。

## 構成

- `data/questions.ts`: 24問の質問、8軸・業タグ・レーダー補正
- `data/types.ts`: 16タイプの文章、能力値、相性の初期データ
- `data/tags.ts` / `data/phases.ts`: 30の業タグと8つの関係フェーズ
- `lib/diagnosis/index.ts`: 集計、同点規則、タイプ・タグ・フェーズ・チャート算出
- `stores/diagnosis.ts`: バージョン付き端末内状態。推し名・回答をサーバー送信しません
- `app/api/og/route.tsx`: `?type=CEMS` 形式の動的 OG 画像
- `data/compatibility/`: 相性の点数表（`pairFit.ts` / `sceneFit.ts`）と文章テンプレート（`textTemplates.ts`）
- `lib/compatibility/`: 相性計算の純粋関数（UIから独立。`calculateCompatibility.ts` が中核）
- `app/compatibility/page.tsx`: `?me=RCGT&partner=CEMS` で結果を再表示できる相性診断ページ
- `app/dev/compatibility-matrix/page.tsx`: 16×16の相性一覧（開発環境のみ表示）

## 診断ロジック

回答は「3 / 1 / -1 / -3」。質問ごとの重みを 4 組の対立軸（R/C、E/P、G/M、T/S）へ集計し、強い側をタイプコードにします。同点は強い回答数、最後に定義済みの固定優先則で決めるため、ランダム性はありません。業タグは複数質問の合算で上位2件を返し、該当が不足しても必ず2件を返します。チャートはタイプ基本値に質問補正を足し、0〜100へ制限します。

質問・タイプ・タグ・フェーズはすべてデータファイルで分離しているため、CMSや48問版へ置き換え可能です。note URL、GA/GTM、PNG 化された結果画像、PWA キャッシュ、E2E テストは将来拡張のための未実装項目です。

## 相性診断ロジック

`/compatibility` は2人のタイプコードだけを入力に、ブラウザ内で相性を計算します（サーバー送信・外部APIなし）。4軸それぞれを「R×C」のように正規化したペアキーへ変換し、`data/compatibility/pairFit.ts` の点数を加重平均して総合相性を出します。同じ文字ほど高い、という単純な設計ではなく、違う軸は「補完＝役割分担」として評価します。連番・遠征・感想会・グッズ交換・応援企画の5シーンは、別のウェイトと点数表で個別に算出します。文章は4軸の一致・相違から合成し、タイプコードのハッシュで決定論的にテンプレートを選ぶため、同じ2人には毎回同じ結果が出ます（`Math.random` は不使用）。

## 仮データ

タイプごとの推定割合、相性の説明、プレミアム CTA、各タイプの能力値は初期仮データです。結果画像は日本語フォントの配信差異を避けるため、現在 SVG として保存します。公開前にブランド用フォントと実測統計へ差し替えてください。

## デプロイ

GitHub へ push 後、Vercel でリポジトリを Import し、必要なら `NEXT_PUBLIC_SITE_URL` を設定してデプロイします。Build Command は `npm run build` です。

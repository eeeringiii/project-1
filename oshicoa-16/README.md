# OSHICOA 16（オシコア・シックスティーン）

> 推しが変わっても、あなたの“推し方の本性”は変わらない。

推し活の優劣や愛の大きさではなく、「愛がどこへ向かうか」を診断するWeb診断サービスです。全24問・約3〜4分・登録不要で、あなたのヲタク生態を16タイプに分類し、業タグ・関係フェーズ・8項目の能力値まで可視化します。

## サービスコンセプト

- 診断するのは**愛の量ではなく「向き」**。課金額・在宅・新規・古参・同担拒否・箱推し・複数推し、どの推し方も否定しません。
- きれいな性格説明だけでなく、ヲタクが抱える**矛盾・執着・愛おしい“業”**まで言語化します。
- SNSで拡散され、何度も遊ばれ、将来的に収益化・IP展開できる設計を目指しています。

---

## 使用技術

| 分類 | 採用 |
| --- | --- |
| フレームワーク | Next.js 16（App Router, Turbopack） |
| 言語 | TypeScript（strict） |
| スタイリング | Tailwind CSS v4（`@tailwindcss/postcss`） |
| 状態管理 | Zustand（localStorage永続化・バージョン付き） |
| フォント | `next/font/google`（Noto Sans JP / Space Grotesk） |
| テスト | Vitest（診断ロジックのユニットテスト） |
| Lint | ESLint（`eslint-config-next`） |
| デプロイ | Vercel想定 |

### ライブラリ選定に関する補足（重要）

指示書ではFramer Motion / Recharts / shadcn/ui / React Hook Form / Zod / Lucide Reactが例示されていますが、同指示書の「**外部ライブラリの導入前に標準機能で実装できないか確認する／必要以上に増やさず保守性と表示速度を優先する**」という方針、および非機能要件（表示速度・レイアウトシフト防止・チャート非表示時の代替）を優先し、以下は標準実装に置き換えています。運用中に必要になれば差し替え可能な構造です。

- **Recharts → 自作SVGレーダーチャート**（`components/charts/RadarChart.tsx`）。SSRで確定描画されレイアウトシフトなし、モバイルのラベル重なりを制御でき、`role="img"`＋非表示データ表で代替テキストを提供。
- **Framer Motion → CSSアニメーション**（`globals.css`、`prefers-reduced-motion`対応）。
- **React Hook Form / Zod → 素のReact state**（任意入力フォームが小規模なため）。
- **shadcn/ui → 自作の軽量コンポーネント**（`components/common/*`）。
- **Lucide React → インラインSVG / 記号**（絵文字多用を避けるデザイン方針にも合致）。

---

## 環境構築・起動・ビルド

```bash
cd oshicoa-16
npm install

# 開発サーバ
npm run dev            # http://localhost:3000

# 本番ビルド & 起動
npm run build
npm start

# 型チェック / Lint / テスト
npm run typecheck
npm run lint
npm test
```

> このリポジトリはモノレポ構成で、本サービスは `oshicoa-16/` サブディレクトリに独立して同居しています（`next.config.ts` の `outputFileTracingRoot` をリポジトリ直下に設定済み）。

### Vercelへのデプロイ

1. Vercelで新規プロジェクトを作成し、このリポジトリを連携。
2. **Root Directory** に `oshicoa-16` を指定。
3. Framework Preset は Next.js（自動検出）。Build Command / Output はデフォルトのままでOK。
4. 環境変数（下記・すべて任意）を設定してデプロイ。

---

## 環境変数

すべて任意です。未設定でもビルド・動作します。

```env
NEXT_PUBLIC_SITE_URL=          # 公開URL（OG/canonical/sitemapの絶対URLに使用。未設定時はフォールバック）
NEXT_PUBLIC_GA_ID=             # Google Analytics 測定ID（設定時のみ計測スクリプトを読み込む）
NEXT_PUBLIC_GTM_ID=            # Google Tag Manager ID（同上）
NEXT_PUBLIC_PREMIUM_ENABLED=   # 1 で有料導線を一括有効化（動作確認用。本番はタイプ個別設定を推奨）
```

### 有料コンテンツ（note等）の設定

タイプ別の販売導線は `src/data/premium.ts` に集約しています。公開したいタイプを `overrides` に追記するだけで購入ボタンが有効になり、未設定のタイプは結果画面で「準備中」表示になります（デッドリンクにしません）。

```ts
const overrides = {
  RCGT: { url: "https://note.com/xxxx/n/xxxxxxxx", price: 500, available: true },
};
```

---

## フォルダ構成

```
oshicoa-16/
  src/
    app/
      page.tsx                     # トップ
      diagnosis/page.tsx           # 任意入力（診断開始前）
      diagnosis/questions/page.tsx # 24問診断
      result/[typeCode]/page.tsx   # 結果（直URLはタイプ基本結果）
      types/page.tsx               # 16タイプ一覧（軸で絞り込み）
      types/[typeCode]/page.tsx    # タイプ詳細（16件を静的生成）
      compatibility/page.tsx       # 相性診断（準備中・構造のみ）
      about / privacy / terms
      api/og/route.tsx             # 動的OG画像（日本語サブセットwoff同梱）
      sitemap.ts / robots.ts / manifest.ts / icon.svg
      not-found.tsx / error.tsx
    components/{common,layout,diagnosis,result,types,share,charts}
    data/      # 診断データ（types/questions/tags/phases/compatibility/chartMetrics/faq）
    lib/
      diagnosis/ # 診断ロジック（UIから分離）
      share/     # シェア文・結果画像生成
      storage/   # localStorage（バージョン付き）
      analytics/ # 計測イベント
      site.ts
    stores/diagnosisStore.ts       # Zustand
    types/index.ts                 # ドメイン型
    constants/                     # 軸・任意入力の選択肢
```

---

## デザインテーマ / キャラクター画像

- **ビジュアル方針**: ゆめかわ・パステル可愛い路線（ラベンダー×ピンク、丸ゴシック体 `Zen Maru Gothic`＋`Fredoka`、丸みとふんわり感）。ヲタク女子がスクショ・シェアしたくなる世界観を狙っています。デザイントークンは `globals.css` に集約しており、配色変更はここだけで完結します。
- **タイプ別キャラクター**: 診断結果・タイプ詳細・トップのプレビューに、16タイプそれぞれのキャラクターを表示できます。`public/characters/{CODE}.webp`（無ければ `.png`）を置くだけで自動反映され、**画像が未用意のタイプは自動で抽象ビジュアル（きらきらの円）にフォールバック**します（`components/result/TypeCharacter.tsx`）。命名・推奨サイズは `public/characters/README.md` を参照。アプリ側の変更なしで、あとからイラストを差し込むだけで完成します。

## 診断ロジック

UIから完全に分離し、単体テスト可能です（`src/lib/diagnosis/`）。**`Math.random` は使わず、同じ回答からは必ず同じ結果**を返します。

処理の流れ（`createResult.ts`）:

1. **`calculateAxes`** — 各質問の極重み × 回答強度（3 / 1 / -1 / -3）を8極に集計。
2. **`normalizeScores`** — 各極を「その極の総重み × 3」で割り、-1〜1の同意度に正規化。**質問数の偏りが結果を偏らせないための鍵**。
3. **`determineType`** — 対立軸ごとに正規化スコアを比較して4文字コードを決定。同点時は ①強い回答のみで再計算 → ②その軸に関係する直近回答 → ③事前定義ルール、の順で決定的に解決。
4. **`calculateTags`** — 複数回答の組み合わせからタグスコアを算出し、しきい値以上の上位2件（なければフォールバックで必ず2件）を返す。
5. **`determinePhase`** — 推し歴（任意入力）を主要シグナルに、回答傾向で上書きされ得る形でフェーズを1つ選定。
6. **`calculateChart`** — タイプ基準値＋回答補正を0〜100にクランプ。同タイプでも回答で個人差が出る。

### タイプコードの規則

コードは「1文字＝1軸」の単純連結**ではありません**（仕様の16コードに合わせています）。

- 1文字目: 軸1 `R`（共鳴）/`C`（接続）
- 2文字目: 軸2 の体験/所有を軸1に応じて表記変換（R系は 体験=`C`・所有=`P`、C系は 体験=`E`・所有=`P`）
- 3文字目: 軸3 `G`（成長支援）/`M`（自己充足）
- 4文字目: 軸4 `T`（連帯）/`S`（単独）

この規則で仕様の16コード（RCGT〜CPMS）を過不足なく生成します（詳細は `determineType.ts` のコメント）。

### 4軸

| 軸 | 内容 | 正極 | 負極 |
| --- | --- | --- | --- |
| 1 | 推しから得たいもの | R 共鳴（作品・表現への没入） | C 接続（本人からの認知・反応） |
| 2 | 愛の証明方法 | E 体験（その瞬間の共有） | P 所有（形として残す） |
| 3 | 推し愛の向かう先 | G 成長支援（推しの未来を動かす） | M 自己充足（思い出を大切に） |
| 4 | ファンダムとの関わり | T 連帯（一緒に盛り上がる） | S 単独（自分のペースを守る） |

### レーダーチャート（8項目）の計算

`最終値 = clamp(タイプ基準値 chartBaseValues + Σ(質問のchartWeight × 回答強度) × 4, 0, 100)`

現場行動力・積み耐性・布教力・解釈力・同担連帯力・認知欲・余韻持続力・記録保存力の8項目を算出します。

---

## データの編集方法

すべて `src/data/` にID付きで分離しており、表示コンポーネントに文言を直書きしていません（将来のCMS移行を想定）。

- **質問データ**: 標準24問は `data/questions.ts`（`standardQuestions`）、精密版の追加24問は `data/questionsPrecise.ts`（`additionalQuestions`、精密版は `preciseQuestions` = 標準+追加の48問）。`weights`（軸）・`chartWeights`・`tagWeights`・`phaseWeights` を編集。問題セットは `data/questionSets.ts` に集約され、正規化は「回答された設問集合」から都度算出するため、設問を増減しても軸の偏りは自動補正されます。
- **問題セット（標準/精密）**: `data/questionSets.ts` の `questionSets` / `QUESTION_SET_META` に定義。`/diagnosis` の入力画面で標準24問・精密48問を選択でき、選択は端末内に保存されます。新しいセット（例: ジャンル別）を追加する場合もここに定義を足すだけで、診断ロジック（`createResult(answers, oshiProfile, setId)`）はそのまま利用できます。
- **タイプデータ**: `data/types.ts`。`OshicoaType` 型に沿って16件を定義。`premiumUrl` はタイプ別のnote等の販売導線（**仮URL**）。
- **業タグの追加**: `data/tags.ts` に要素を追加し、`questions.ts` の `tagWeights` で加点。最大30種以上へ拡張可能。
- **関係フェーズの追加**: `data/phases.ts` に追加し、`lib/diagnosis/determinePhase.ts` の推し歴マッピングや `questions.ts` の `phaseWeights` を調整。
- **相性データの追加**: `data/compatibility.ts` に `CompatibilityScore` を追加（順序非依存で参照）。各タイプの「相性のよいタイプ」は `types.ts` の `compatibility.bestTypeCode`。

---

## シェア / 画像 / OG

- **シェア**: X・LINE・URLコピー・Web Share API（`components/share/ShareButtons.tsx`）。共有URLはタイプページのみで、**推し名などの個人入力情報はクエリに含めません**。
- **結果画像**: ブラウザCanvasでPNG生成（`lib/share/generateResultImage.ts`）。正方形1080×1080 / 縦長1080×1350の2種。「上位◯%（突出能力）」バッジを載せ、`public/characters/{CODE}` が存在すればキャラクター画像も合成する。端末のシステムフォントで日本語を描画し、`document.fonts.ready` を待ってから生成。推し名が長い場合は自動で省略。
- **ヲタク履歴書（`/resume`）**: 推し活プロフィールを入力すると1枚のカードに整形し、Canvas画像で保存・シェアできる（`lib/share/generateResumeImage.ts`）。入力はサーバー送信せず端末内のみ。
- **ヲタク業ビンゴ（`/bingo`）**: あるある/業を5×5でタップし、ビンゴ数とヲタクランクを判定して拡散できるミニ機能。
- **OG画像**: `app/api/og/route.tsx`（`next/og` の `ImageResponse`）。タイプコードだけで生成でき、SNSクローラーでも動作。日本語は、OGで使う文字だけを含む**サブセットwoffを同梱**（`NotoSansJP-subset.woff`）して実行時ネットワークに依存せず確実に描画します。

---

## 分析イベント

`lib/analytics/index.ts` に集約。GA/GTMのIDが未設定なら何も送信しません。**推し名などの個人情報はイベントに送信しない**二重防御（ブロックキー）付き。

`diagnosis_start` / `oshi_profile_completed` / `question_answered` / `diagnosis_abandoned` / `diagnosis_completed` / `result_viewed` / `result_shared_x` / `result_shared_line` / `result_url_copied` / `result_image_saved` / `diagnosis_restarted` / `premium_cta_clicked` / `type_detail_viewed`

---

## 仮データを使用している箇所（要差し替え）

情報が不足していた箇所は、ブランド思想に沿った妥当な仮データで実装しています。

1. **16タイプの詳細文**（`data/types.ts`）: 指示書の基本特徴・キャッチコピー・業をもとに、`description` / `strengths` / `habits` / `shadowTraits` などを補完。
2. **業タグ30種の説明文**（`data/tags.ts`）: タグ名から説明文を作成。
3. **関係フェーズ8種の説明・アドバイス**（`data/phases.ts`）。
4. **推定割合 `estimatedRatio`**（`data/types.ts`）: 合計が概ね100%になるよう設定した仮値。
5. **相性スコア**（`data/compatibility.ts`）: 代表ペアの7項目スコアと要約を仮設定。
6. **有料コンテンツURL `premiumUrl`**（`data/types.ts`）: `https://note.com/oshicoa16/type/{CODE}` 形式のプレースホルダー。
7. **サイトURL・X公式アカウント・問い合わせ先**（`lib/site.ts`）: `example.com` 等のプレースホルダー。`NEXT_PUBLIC_SITE_URL` で本番URLを注入。
8. **各質問の重み（weights等）**（`data/questions.ts`）: 設問内容を分析して設定した設計値。

---

## テスト

`npm test` で診断ロジックのユニットテスト（`src/lib/diagnosis/diagnosis.test.ts`, 17ケース）を実行。

- 4軸集計 / 16タイプ判定 / 同点時の決定性 / 業タグ / フェーズ / チャートの0〜100制限
- 同じ回答→同じ結果、全問回答→結果生成、回答不足→`IncompleteDiagnosisError`
- データ整合性（全極が正重みを持つ・タグID参照の妥当性）
- 多様な回答で16タイプの大半へ到達（分布の極端な偏りがないこと）

---

## 将来拡張する場合の注意点

- 診断データを増やす際も**表示コンポーネントに文言を直書きしない**こと（`data/`に集約）。
- **実装済みの拡張**: 精密48問版（問題セット選択）／同担相性診断（`/compatibility`）／ヲタク業ビンゴ（`/bingo`）／ヲタク履歴書（`/resume`）／有料note導線（`data/premium.ts`）／結果画像・OGのリッチ化。
- 多言語・ジャンル別版などは、`questionSets.ts` / `types.ts` の構造を維持したまま追加できます。
- 相性診断（`/compatibility`）はデータ構造（7項目スコア・順序非依存参照）を用意済み。UIを実装すれば公開できます。
- 会員登録・Stripe決済・管理画面などサーバー側機能を追加する場合も、**推しの名前などの個人情報を端末外へ出さない**方針を維持してください。

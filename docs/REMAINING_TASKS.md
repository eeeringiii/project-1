# OSHICOA 16 残タスク一覧

現行コード（`main` 相当）を実際に動かして洗い出した残作業。
優先度順。P0 は公開前に必ず潰す必要がある。

検証方法は各項目に記載。数値はすべて実測値。

---

## P0 — 公開前に必須（現状バグ）

### 1. 診断の 23% がクラッシュし、4タイプに永久に到達できない

**症状**: 24問すべて回答した直後、結果画面に行かず無言で `/diagnosis`（プロフィール入力）へ戻される。

**原因**: 型コードの定義と生成ロジックが噛み合っていない。

- `types.ts` の `typeCodes` は `RCGT / RCGS / RCMT / RCMS` を含む（2文字目が `C`）
- `lib/diagnosis/index.ts` の `determineType()` は
  `pick('R','C') + pick('E','P') + pick('G','M') + pick('T','S')` なので
  **2文字目は必ず `E` か `P`**。`RC**` は構造上ぜったいに生成されない
- 代わりに未定義の `REGT / REGS / REMT / REMS` が生成される
- → `calculateChart()` の `getType(type)!.chartBaseValues` が
  `undefined.chartBaseValues` で TypeError
- → `app/diagnosis/questions/page.tsx` の `catch{router.push('/diagnosis')}` が
  例外を握り潰すので、ユーザーには「24問答えたのに最初に戻された」としか見えない

**実測**: 実コードでランダム回答 20,000 回

```
success: 15,339 / CRASHED: 4,661 (23.3%)
crash message: Cannot read properties of undefined (reading 'chartBaseValues')
到達不能な定義済みタイプ: RCGT, RCGS, RCMT, RCMS
```

つまり **16タイプ中4タイプ（覇権プロデューサー / 孤高の参謀 / ファンサ収集家 / 秘密の特別枠）は誰も診断されない**。

**対応にオーナー判断が必要**（型コードが変わるため）:

- 案A: `RC**` を `RE**` にリネーム。共鳴(R)×体験(E) という読みは
  「孤高の参謀」「ファンサ収集家」の内容とも整合する。
  既存の共有URL用に `/types/RCGT → /types/REGT` の redirect を `next.config.ts` に追加
- 案B: 2文字目の軸設計そのものを見直す

**再発防止**: `determineType()` の出力が必ず `typeCodes` に含まれることを検証するテストを1本入れる。これがあれば即検出できた（→ P4-20）。

### 2. 別プロジェクト（カロリー管理アプリ）の残骸が本番にデプロイされている

`npm run build` のルート一覧に以下がそのまま載る:

```
ƒ /api/analyze-food
ƒ /api/feedback
```

- どちらも **認証なしで Anthropic API を叩く公開エンドポイント**。
  誰でも POST でき、こちらの API キーで課金が発生する
- `app/api/analyze-food/route.ts` / `app/api/feedback/route.ts`
- 使用モデル指定が `claude-opus-4-8`（存在しないID）

同じ出自の残骸:

| ファイル | 内容 |
|---|---|
| `app/components/CalorieChart.tsx` | 体重・カロリーグラフ |
| `app/components/WeightChart.tsx` | 同上 |
| `app/hooks/useLocalStorage.ts` | 未使用 |
| `public/manifest.json` | `"name": "BodyMake Food Tracker"`、テーマ色 `#16a34a`（緑） |
| `public/icon-192.png` / `icon-512.png` | 上記アプリのアイコン |
| `package.json` の `@anthropic-ai/sdk` | この2ルート専用の依存 |

**対応**: 上記をすべて削除し、`@anthropic-ai/sdk` を依存から外す。
`manifest.json` は OSHICOA 用に書き直す（現状 `layout.tsx` から参照もされていない）。

---

## P1 — シェア導線が成立していない

### 3. OG画像が1枚も出ない（`/api/og` が完全な死にコード）

`app/api/og/route.tsx` は正常に動く（日本語も描画される。`?type=CEMS` で 1200×630 PNG を確認済み）が、
**どのページからも参照されていない**。

`/types/CEMS` の実際の HTML:

```html
<meta property="og:title" content="OSHICOA 16｜ヲタク生態診断"/>   ← 全ページ共通
<meta name="twitter:card" content="summary_large_image"/>         ← 画像なしで large_image
<!-- og:image が存在しない -->
```

そして `components/Share.tsx` が X / LINE に流す URL がまさに `/types/{code}`。
**結果を共有しても、タイプ名すら出ない真っ白なカードになる。**
「結果ページはスクショされ・共有されるべき」という製品の根幹が機能していない。

**対応**: `app/types/[typeCode]/page.tsx` に `generateMetadata` を追加し、
タイプごとの title / description / `og:image = /api/og?type={code}` を出す。
`/result/[typeCode]` にも同様に。

### 4. キャラクター画像16枚が未配置

`public/characters/` は `README.md` のみ。
診断書・X用カード・Story用カード・結果画面のキャラクター領域が空のまま
（`ResultClient.tsx` は画像ロード失敗時に絵文字マークへフォールバックするが、
SVGカード側は `inlineSvgImages()` が `image.remove()` するので**完全に空白**になる）。

保存用カードが主要な共有導線なので、ここが空だと 3 を直しても効果が薄い。

---

## P2 — ユーザーに見えている「仮データ」

### 5. レーダーチャートの数値が式で生成されていて、全タイプ同じ形

`data/types.ts:29`

```ts
const chartBaseValues = Object.fromEntries(metrics.map((m,j)=>[m, 45+((i*11+j*9)%42)]))
```

実際の値:

```
RCGT: 45,54,63,72,81,48,57,66
RCGS: 56,65,74,83,50,59,68,77   ← 同じ数列がずれているだけ
```

`/types/[code]` のレーダーはこの値を直接描画しているので、
**16タイプすべてレーダーの形が同一（回転しているだけ）**。

さらに悪いことに、手書きの `baseAbilities`（タイプごとに実際にチューニングされている）と
二重管理になっていて、出典が食い違う:

- 診断済み → `chartScores`（＝ 式生成の `chartBaseValues` が土台）
- 未診断（タイプ紹介ページ経由） → `baseAbilities`（手書き）

同じ「ヲタク能力」の欄で違うデータが出る。

**対応**: `chartBaseValues` を廃止し、`baseAbilities` を単一の真実として
`calculateChart()` の土台にする（ID は `field↔event`, `analysis↔interpretation`,
`community↔fandom` 以外そのまま対応する）。

### 6. 相性データが機械割当＋説明文が全タイプ同一

`data/types.ts:40`

```ts
compatibility: {
  bestTypeCode: raw[(i+8)%16][0],                                  // 8個先を機械的に指定
  description: '違う熱量の置き場所が、お互いの推し活を豊かにします。'  // 16タイプ全部これ
}
```

結果ページ・タイプページの両方に出る。README にも「相性の詳細点数データは未実装」と明記あり。

### 7. 業タグ30個のうち10個が到達不能

`data/questions.ts` が参照しているタグは20個のみ。

```
到達不能: tag-5, tag-14, tag-15, tag-17, tag-18, tag-22, tag-24, tag-25, tag-26, tag-27
```

うち `tag-5 / 15 / 17 / 18 / 22 / 26` は `data/types.ts` の `karmaTagCandidates` から参照されている。
つまり**未診断でタイプページを見たときだけ表示され、実際に診断すると絶対に出ないタグ**がある。

### 8. 業タグの説明文が30個とも同一テンプレ

`data/tags.ts:3`

```ts
description: `${name}の気配。推しへの熱量が、あなたらしい行動として表れています。`
```

AGENTS.md「日本語コピーは機械翻訳っぽくしない」に真っ向から反する。30本書き下ろしが必要。

### 9. 業タグが実質「1問の言い換え」になっている

- 1タグにつき設問1問、重み固定 `2`（4タグのみ2問）
- 最大スコア = 2 × 3 = 6、閾値 = 5
- → **その1問に「めちゃくちゃ当てはまる」と答えたかどうか**だけで決まる

「複数設問の合算で業を抽出する」という設計意図（README 記載）が効いていない。
重みと閾値を設計し直すか、1タグ最低2〜3問に紐づける。

### 10. 描画されていない死にデータ

定義されているがどのコンポーネントからも参照されていない:

| フィールド | 備考 |
|---|---|
| `estimatedRatio` | `5+i%4` で生成。16個の合計が **104%** |
| `premiumCtaTitle` / `premiumCtaDescription` | 有料導線（AGENTS.md 結果ページ優先度7）が未実装 |
| `shortDescription` / `traits` / `shadowTraits` | |
| `DiagnosisResult.axisScores` | 4軸のスコアを保存しているが未表示。軸バーは出せるはず |
| `DiagnosisQuestion.phaseWeights` | 型定義だけあって全設問で未使用 |

出すか消すかを決める。

### 11. 関係フェーズ `adjust` が到達不能

`determinePhase()` は `adjust`（倦怠・距離調整期）を一度も返さない（50,000回試行で0件）。
8フェーズ中7フェーズしか出ない。

### 12. タイプ本文の差別化が弱い

`description` / `traits` / `habits` / `shadowTraits` は `points` 配列からの定型生成:

```ts
description: [`あなたは、${points[0]}人です。`, '現場、供給、記録のどこに…（全タイプ共通文）']
traits: [points[0], '自分の納得できる推し方を持つ', '好きの理由を日常に持ち帰れる']  // 後ろ2つ共通
```

一方 `ecologyData`（生息地・主食・口癖・TOP5・強み・業）は16タイプ分きちんと書き下ろされている。
前者を後者の水準に引き上げるか、前者を捨てて後者だけ使う。

---

## P3 — 診断ロジックの設計

### 13. T/S 軸の重みが不均衡（4 対 15）

軸ごとの総重み / 設問数:

| 軸 | R | C | E | P | G | M | T | S |
|---|---|---|---|---|---|---|---|---|
| 総重み | 13 | 10 | 10 | 12 | 20 | 18 | **4** | **15** |
| 設問数 | 7 | 7 | 4 | 5 | 10 | 11 | **3** | **10** |

T に寄与するのは3問（合計重み4）だけ。全問「めちゃくちゃ当てはまる」なら T=12 / S=45 で必ず S。
全問「まったく当てはまらない」なら必ず T。
**T/S が「全体的に肯定的に答えたか」の裏返しになっていて、軸として機能していない。**

ランダム回答での出現率（クラッシュ分を除く実測）:

```
RPGT 10.2% … CEMS 9.9% … CPGS 3.2%   ← 3倍以上の開き
```

E/P も 10 対 12 でやや薄い。設問側の重みを配分し直す。

---

## P4 — UX / 実装品質

### 14. 質問画面

- 「← 前の質問」で戻っても、**前回選んだ選択肢がハイライトされない**
  （`app/diagnosis/questions/page.tsx` に選択状態の表示がない）
- `24` / `23` がハードコード（`questions.length` を使うべき）。
  設問数を変えると静かに壊れる
- 例外を `catch{router.push('/diagnosis')}` で握り潰している（→ P0-1 が見えなくなった原因）

### 15. モバイル

- `@media(max-width:820px)` で `.navlinks{display:none}` だが**ハンバーガーメニューがない**。
  スマホではヘッダーから「16タイプ / 診断について / 相性診断」に行けない（フッターのみ）
- トップの16タイプ一覧が1カラムになり縦に長い。2カラムのほうが一覧性が高い

### 16. `app/robots.ts` の sitemap が相対パス

```ts
sitemap: '/sitemap.xml'   // 絶対URLが必要
```

`sitemap.ts` 側は `NEXT_PUBLIC_SITE_URL` を使っているので、robots も揃える。

### 17. `metadataBase` の既定値がプレースホルダ

`app/layout.tsx` / `app/sitemap.ts` ともに `https://oshicoa16.example.com`。
`NEXT_PUBLIC_SITE_URL` を Vercel に設定し忘れると OG・canonical・sitemap が全滅する。

### 18. `/result/[typeCode]` が毎回 SSR

`generateStaticParams()` がないため build 出力で `ƒ (Dynamic)`。
中身はタイプごとに静的なので、`/types/[typeCode]` と同様に事前生成できる。

### 19. `/compatibility` が「準備中」のままヘッダーに露出

ヘッダーナビの3項目のうち1つが工事中ページ。公開時は導線から外すか、実装する。

### 20. テストが1本もない

`package.json` に test スクリプトなし。
P0-1 は次の1行テストで即検出できた:

```ts
// 全回答パターンで determineType の出力が typeCodes に含まれること
expect(typeCodes).toContain(determineType(scores, answers))
```

最低限:
- `determineType` の出力が必ず `typeCodes` に含まれる
- 16タイプすべてが到達可能
- 30タグ・8フェーズすべてが到達可能
- `createResult` が例外を投げない

### 21. コアファイルが1行圧縮スタイルで書かれている

`lib/diagnosis/index.ts`（10行に全ロジック）、`stores/diagnosis.ts`（1行）、
`data/questions.ts`（24問が1行）、`app/sitemap.ts` / `app/robots.ts`。

AGENTS.md の「非エンジニアのオーナーが後から更新しやすいほうを選ぶ」と矛盾する。
少なくとも `data/questions.ts` と `lib/diagnosis/index.ts` は通常の整形に戻したい
（P0-1 の型コード不整合が発見しづらかった一因でもある）。

---

## 参考: 現状の品質ゲート

```
npm run lint   ✅ 通る
npm run build  ✅ 通る（型エラーなし）
```

**lint と build が通っていても P0-1 は検出されない。** 型レベルでは
`determineType` の戻り値が `as TypeCode` でキャストされているため、
実行時の不整合がコンパイル時に見えない。

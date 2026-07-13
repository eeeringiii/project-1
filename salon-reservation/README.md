# salon-reservation — エルメ（L Message）サロン予約 連携

エルメの **サロン予約**（`https://step.lme.jp/basic/calendar-salon/24789`）の予約データを
外部アプリで受け取り・保管・参照するための **API/データ連携** アプリ（Next.js 16 / App Router）。

予約の発生・変更・キャンセルを **Webhook で受信** して正規化・保管し、
アプリ側は内部API `/api/reservations` から正規化済みデータを取得できる。
エルメから能動的に取得したい場合向けに、アウトバウンドAPIクライアントも用意している。

> エルメの旧「カレンダー予約」は 2025年3月末で廃止され、現在は **レッスン予約 / サロン予約** に移行しています。
> 本アプリは URL パス `calendar-salon`（＝サロン予約）を対象としています。

## 構成

```
salon-reservation/
├─ app/
│  ├─ page.tsx                       予約一覧ダッシュボード（サーバーコンポーネント）
│  └─ api/
│     ├─ lme/webhook/route.ts        エルメ→本アプリ の Webhook 受信口
│     └─ reservations/route.ts       アプリ→内部 の 予約取得API（JSON）
├─ lib/
│  ├─ config.ts                      環境変数の集約
│  ├─ reservation.ts                 正規化モデル + ペイロード正規化ロジック
│  ├─ store.ts                       保管層（既定=メモリ / 差し替え可能）
│  └─ lme-client.ts                  エルメAPIクライアント（能動取得用）
└─ .env.example                      設定サンプル
```

## セットアップ

```bash
cd salon-reservation
npm install
cp .env.example .env.local   # 値を設定（最低限 LME_WEBHOOK_SECRET）
npm run dev                   # http://localhost:3000
```

## 連携手順（エルメ側の設定）

エルメには「予約が入ったら外部URLへ通知」する仕組みがあります（ネイティブWebhook、
または **Zapier** の Webhooks by Zapier を経由）。送信先を本アプリのエンドポイントに向けます。

1. デプロイ後のドメインを用意（例: Vercel）。
2. エルメ／Zapier の Webhook 送信先URLを次のように設定:

   ```
   https://<あなたのドメイン>/api/lme/webhook?token=<LME_WEBHOOK_SECRET と同じ値>
   ```

   （`?token=` の代わりに `x-webhook-secret` ヘッダーでも可）
3. サロン予約の「予約作成 / 変更 / キャンセル」時に上記へ POST されるよう設定。
4. ブラウザで `GET /api/lme/webhook` を開き `{ "ok": true }` が返れば疎通OK。

### 受信ペイロードについて（重要）

エルメの Webhook / API の**正確なフィールド名は管理画面ログイン後の確認が必要**です。
本アプリの正規化ロジック（`lib/reservation.ts`）は、想定される複数のキー名
（`start_at` / `予約日時` / `reservation_id` / `予約ID` など）を吸収する防御的実装ですが、
実ペイロードと差異がある場合は次で調整してください:

- 実際の JSON をサーバーログ（`accepted: 0` 時に警告出力）や Zapier のテスト送信で確認
- `lib/reservation.ts` の `pick(body, [...])` の候補キーを実キー名に合わせて追加

`予約ID`（一意キー）と `開始日時` が取得できないイベントはスキップされます。

## アプリ側からのデータ取得

```
GET /api/reservations
GET /api/reservations?status=confirmed
GET /api/reservations?from=2026-07-13&to=2026-07-31
```

レスポンス例:

```json
{
  "count": 1,
  "reservations": [
    {
      "id": "10023",
      "status": "confirmed",
      "customerName": "山田 花子",
      "menu": "カット＋カラー",
      "staff": "佐藤",
      "startAt": "2026-07-20T04:00:00.000Z",
      "source": "lme",
      "receivedAt": "2026-07-13T09:00:00.000Z"
    }
  ]
}
```

## エルメから能動的に取得する場合（任意）

Webhook を待たず、こちらから予約一覧を取りに行きたい場合は `LmeClient` を使います。

```ts
import { lmeClient } from "@/lib/lme-client";
const reservations = await lmeClient.listReservations(); // LME_CALENDAR_ID を使用
```

エルメの API エンドポイント／認証方式は仕様確認が必要なため、`LME_API_BASE_URL` /
`LME_API_RESERVATIONS_PATH` / `LME_API_TOKEN`（環境変数）で差し替え可能にしています。
Webhook 受信のみで完結する場合、このクライアントは不要です。

## 本番運用の注意（永続化）

既定の保管層はプロセス内メモリ（`lib/store.ts`）で、Vercel等のサーバーレスでは
インスタンスをまたいで揮発します。本番では次のいずれかを推奨:

- `LME_FORWARD_URL` を設定し、受信イベントを永続バックエンドへ転送する
- `ReservationStore` インターフェースを満たす永続実装（Vercel KV / Redis / RDB）を用意し
  `getStore()` を差し替える

## 環境変数

| 変数 | 必須 | 説明 |
| --- | --- | --- |
| `LME_WEBHOOK_SECRET` | ✅ | Webhook 受信の共有シークレット |
| `LME_CALENDAR_ID` | | 対象サロン予約カレンダーID（既定: 24789） |
| `LME_API_BASE_URL` | | エルメAPIのベースURL（能動取得時） |
| `LME_API_TOKEN` | | エルメAPIのトークン（能動取得時） |
| `LME_API_RESERVATIONS_PATH` | | 予約一覧の取得パス（`{calendarId}` を置換） |
| `LME_FORWARD_URL` | | 受信イベントの永続化転送先（任意） |

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## LINE ファネル分析機能

LP → LINE公式アカウント登録 → 面談、という流れを数値で追い、Claudeに分析させる機能です。`/funnel` ページで実績と転換率を確認できます。

### 1. LINE Messaging API のチャネルを作成する

1. [LINE Developers コンソール](https://developers.line.biz/console/) にログインし、対象のLINE公式アカウントに紐づく **プロバイダー** を作成（または選択）します。
2. 「Messaging API」チャネルを新規作成します（すでにLINE公式アカウントマネージャーでアカウントを運用している場合は、そのアカウントを選択してMessaging APIを有効化できます）。
3. チャネル作成後の管理画面から以下を取得します。
   - **チャネルシークレット**（「チャネル基本設定」タブ）
   - **チャネルアクセストークン（長期）**（「Messaging API設定」タブで発行）

### 2. 環境変数を設定する

`.env.example` を `.env.local` にコピーし、値を設定してください。

```bash
cp .env.example .env.local
```

```
ANTHROPIC_API_KEY=...
LINE_CHANNEL_SECRET=...
LINE_CHANNEL_ACCESS_TOKEN=...
```

### 3. Webhook URLを設定する

アプリをデプロイした後、LINE Developersコンソールの「Messaging API設定」タブで、Webhook URLに以下を設定し、Webhookを有効化してください。

```
https://<デプロイ先のドメイン>/api/line/webhook
```

これで、ユーザーがLINE公式アカウントを友だち追加すると「LINE登録」として自動でカウントされ、`/funnel` ページに反映されます。

### 4. LP訪問数を計測する

LPのHTMLに以下のタグを1つ追加すると、ページが読み込まれるたびに「LP訪問」としてカウントされます（LPが別ドメインの場合は `data-endpoint` に本アプリのURLを絶対パスで指定してください）。

```html
<script src="https://<デプロイ先のドメイン>/funnel-track.js" data-endpoint="https://<デプロイ先のドメイン>/api/funnel/event"></script>
```

### 5. 面談完了を記録する

面談の実施はLINE側から自動検知できないため、`/funnel` ページの「面談完了を1件記録」ボタンで手動記録します。

### 注意（データの永続化）

現状、集計データは `data/funnel-events.json` にファイルとして保存されます。Vercelなどのサーバーレス環境ではファイルシステムがデプロイごとにリセットされるため、本番運用する場合はデータベース（Vercel KV、Postgresなど）への置き換えを推奨します。

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

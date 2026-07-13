# エルメ 初回面談リマインド 半自動セットアップ（CDP接続）

自分のPCでデバッグ起動したChromeに Playwright を **CDP接続**し、エルメ（L Message）の各画面に文面を自動入力するツールです。

## なぜこの方式か（安全性）
- **パスワードを渡さない**：自分でログイン済みのChromeセッションを再利用するだけ。認証情報はスクリプトにもチャットにも一切残らない
- **2段階認証を突破しない**：既にログインした状態のブラウザを使う
- **誤爆しない**：自動化するのは「本文の下書き入力」まで。`保存 / 配信ON / 公開` は必ず自分で目視して押す

> このスクリプトは**あなたのローカルPCで動かします**（AI側のリモート環境からはあなたのChromeに接続できません）。

## 前提
- Node.js 18+
- 依存インストール：このフォルダで `npm init -y && npm i playwright`

## 手順

### 1. Chromeをデバッグ起動（専用プロファイル推奨）
既存のChromeとは別プロファイルで、リモートデバッグを有効にして起動します。

**macOS**
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 \
  --user-data-dir="$HOME/elme-automation-profile"
```

**Windows (PowerShell)**
```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --remote-debugging-port=9222 `
  --user-data-dir="$env:USERPROFILE\elme-automation-profile"
```

### 2. 起動したChromeで https://step.lme.jp にログイン
LINE連携・2段階認証もこのウィンドウで済ませておく。

### 3. セレクタとURLを設定（初回のみ）
`setup.mjs` 冒頭の `CONFIG` を実画面に合わせて埋めます。
- `urls.greeting / calendar / reminder`：各編集画面のURL（空でもOK。その場合は自分でその画面を開いてEnter）
- `selectors.messageEditor`：本文入力欄のセレクタ。エルメで対象欄を「検証」して拾う（例 `textarea[name="message"]` や `div.ql-editor`）
  - **空のままでも動きます**：その場合は文面をコンソールに表示するので手動で貼り付け → Enter

### 4. 接続テスト
```bash
node setup.mjs
```
「接続 OK」と現在URLが出れば成功。

### 5. ステップ実行
```bash
node setup.mjs greeting    # ⓪ あいさつメッセージ
node setup.mjs calendar    # カレンダー予約 ＋ ① 予約直後
node setup.mjs reminders   # ② 前日 / ③ 直前 / ④ 面談後 / ⑤ 3日後
node setup.mjs all         # 上を順に
```
各ステップで下書きが入ったら**内容を目視確認 → 自分で保存**。リマインドの「配信ON」も最後に自分で。

## 文面の変更
`messages.mjs` を編集すれば反映されます（出典：`秘書用/アイデア/2026-07-13_初回面談リマインドメッセージ.md`）。

## 注意
- エルメの画面構成はプラン/更新で変わることがあります。セレクタが効かない時は `CONFIG.selectors` を空にして手動貼付フォールバックで進めてください。
- 自動操作はSaaSの利用規約に触れる場合があります。あくまで**自分のアカウントの設定入力を補助する**用途に留めてください。

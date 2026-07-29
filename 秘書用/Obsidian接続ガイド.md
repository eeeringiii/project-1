---
tags:
  - 設定
---

# 🔌 Obsidian接続ガイド

このリポジトリ（`eeeringiii/project-1`）が、そのまま **Obsidianの保管庫（Vault）** になっています。
秘書がGitHubに書いた日報・todo・アイデアが、Obsidianを開くだけで手元に届く状態にするための手順です。

- **Vaultの場所**：リポジトリのいちばん上のフォルダ（`.obsidian` があるところ）
- **ノートの置き場所**：`秘書用/` の中だけ。それ以外のフォルダはHPのソースコードです
- **同期の仕組み**：Obsidian Git プラグインが、裏でGitHubと pull / push します

---

## 1. パソコンに繋ぐ（最初の1回だけ）

### ① Obsidianを入れる
https://obsidian.md/ からダウンロードしてインストールします。

### ② GitHubのアクセストークンを作る
Obsidianがあなたの代わりにGitHubへ読み書きするための鍵です。

1. GitHub → 右上のアイコン → **Settings**
2. 左の一番下 **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. **Generate new token (classic)** を押す
4. Note に `obsidian` と入力、Expiration は `No expiration` でも可
5. **`repo` のチェックだけ**入れる（他は不要）
6. 生成された `ghp_...` の文字列をコピー

> [!warning] トークンの扱い
> このトークンはパスワードと同じです。**このVaultの中を含め、どこにもメモとして保存しないでください。**
> 貼り付ける先はObsidianの設定画面だけです。忘れたら作り直せます。

### ③ Obsidianにリポジトリを取り込む
1. Obsidianを起動 → **新規保管庫を作成** で、空のフォルダを1つ作る（例：`Documents/oshicoa`）
2. 左下の歯車 → **コミュニティプラグイン** → **制限モードを無効化**
3. **閲覧** → `Git` を検索 → **Obsidian Git**（作者 Vinzent03）をインストール → **有効化**
4. `Ctrl`(`⌘`) + `P` でコマンドパレット → `Git: Clone an existing remote repo` を実行
5. URLに次を貼る：
   ```
   https://github.com/eeeringiii/project-1.git
   ```
6. 認証を聞かれたら **ユーザー名：`eeeringiii`／パスワード：さっきの `ghp_...` トークン**
7. 「保管庫のルートに置くか」を聞かれたら **Vaultのルート** を選ぶ
8. 終わったらObsidianを再読み込み（`Ctrl`(`⌘`) + `R`）

これで `秘書用/` が見えれば成功です。左のブックマークから 🏠 ホーム を開いてください。

### ④ 同期の設定（おすすめ値）
歯車 → **Obsidian Git** の設定で、次だけ変えれば十分です。

| 設定項目 | 値 | 意味 |
| --- | --- | --- |
| Vault backup interval (minutes) | `10` | 10分ごとに自動でGitHubへ保存 |
| Auto pull interval (minutes) | `10` | 10分ごとに秘書の更新を取り込む |
| Pull updates on startup | ON | 起動した瞬間に最新にする |
| Push on backup | ON | 保存と同時にGitHubへ送る |
| Commit message | `obsidian: {{date}}` | 記録が読みやすくなる |

手動でやりたいときは、コマンドパレットから
`Git: Commit-and-sync`（送る）／`Git: Pull`（受け取る）です。

---

## 2. スマホに繋ぐ

> [!note] 先に知っておいてほしいこと
> このリポジトリはHPのソースコードも一緒に入っているため、**スマホのObsidian Gitで直接クローンすると重く、失敗しやすい**です。
> iPhoneなら下の「Working Copy経由」が確実です。

### iPhone / iPad（Working Copy経由・推奨）
1. App Storeで **Obsidian** と **Working Copy** を入れる
2. Working Copy でこのリポジトリをクローン（同じトークンでログイン）
3. Working Copy でリポジトリを開く → 共有メニュー → **Setup Folder Sync** → Obsidian用の場所を選ぶ
4. Obsidian → **保管庫を開く** → **端末上のフォルダを開く** → 同期したフォルダを選ぶ
5. 更新の受け取り／送信は Working Copy 側で pull / push

### Android
1. Google Play で **Obsidian** を入れる
2. PCと同じ手順（コミュニティプラグイン → Obsidian Git → `Git: Clone an existing remote repo`）
3. 初回のクローンに数分かかることがあります。Wi-Fiで、画面を消さずに待ってください

---

## 3. 毎日の使い方

| やりたいこと | 操作 |
| --- | --- |
| 今日の日報を書く | 左のリボン → **今日のノートを開く**（`秘書用/日報/YYYY-MM-DD.md` が自動作成） |
| タスクを作る | `秘書用/todo/` を右クリック → 新規ノート → ファイル名を `YYYY-MM-DD_タスク名` |
| ひな形を入れる | コマンドパレット → **テンプレートを挿入** |
| 過去のメモを探す | `Ctrl`(`⌘`) + `O`（ファイル名）／`Ctrl`(`⌘`) + `Shift` + `F`（本文） |
| 秘書の更新を取り込む | 起動時に自動。急ぐときは `Git: Pull` |

Obsidianで書き足した内容もGitHubに戻るので、**次にClaudeで秘書を呼んだとき、秘書はそれを読んだ状態から始められます。**

---

## 4. 困ったとき

**「秘書が書いたはずのノートが出てこない」**
→ コマンドパレットで `Git: Pull` を実行。それでも出ないときはObsidianを再読み込み（`Ctrl`(`⌘`) + `R`）。

**「conflict と出た」**
→ 同じファイルをPCとスマホの両方で編集したときに出ます。該当ファイルを開くと
`<<<<<<<` `=======` `>>>>>>>` の記号で両方の内容が並んでいるので、残したい方を手で整えて記号を消し、
もう一度 `Git: Commit-and-sync` すれば直ります。

**「重い・同期が遅い」**
→ `node_modules` は同期対象外なので本来は軽いはずです。スマホで遅い場合は上のWorking Copy方式に切り替えてください。

**「コードのフォルダが邪魔」**
→ 検索・グラフ・クイックスイッチャーからは除外済みです（`.obsidian/app.json` の `userIgnoreFilters`）。
ファイル一覧からも隠したい場合は、この設定に追記すれば増やせます。

---

## 5. 触らないでほしいもの

- `.obsidian/` — Obsidianの設定。消すとこのガイドの設定が全部消えます
- `app/` `components/` `data/` `lib/` `stores/` `public/` — HPのソースコード
- `AGENTS.md` / `CLAUDE.md` — Claudeへの指示書

ノートを増やすのは `秘書用/` の中だけにしてください。

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AI利用方針（使用量の最適化）

このリポジトリでは Claude と Codex を併用する。**使用量（コスト・クォータ）を無駄にしない**ため、作業内容に応じて適切なモデル・ツールを選ぶ。以下は開発作業（コーディングエージェント）での指針であり、アプリ実行時の API モデル選定は各 route の実装に従う。

## 1. タスク別のモデル使い分け（Claude Code）

`/model` で切り替える。**既定は Sonnet**。難所だけ上げ、単純作業は下げる。

| 作業内容 | モデル |
|---|---|
| 設計・アーキ判断、原因不明のバグ調査、曖昧な要件の整理 | Opus 4.8 |
| 通常の機能実装・リファクタ・型修正・テスト追加 | **Sonnet 5（既定）** |
| 定型編集、文言修正、簡単なCRUD、フォーマット、質問回答 | Haiku 4.5 |

- `/fast`（Opus高速モード）は割高なので常用しない。
- 迷ったら Sonnet。行き詰まったら Opus に上げる。

## 2. Claude と Codex の役割分担

仕様が確定した機械的な作業は Codex に逃がし、Claude のクォータは「考える作業」に温存する。独立した作業は両者で**並行**して進めてよい。

| Claude に任せる | Codex に任せる |
|---|---|
| 仕様が曖昧で対話しながら詰める作業 | 仕様が確定した実装 |
| 複数ファイルにまたがる設計変更・調査 | 単一ファイル内の定型実装・ボイラープレート |
| デバッグの原因究明・最終レビュー | テストケースの量産、叩き台の生成 |

## 3. セッション運用の原則（無駄削減）

- **前提はこのファイルと各 CLAUDE.md に書く**。毎回の再説明・再探索を避ける。
- **依頼はまとめて仕様を先出しする**。小刻みな追加依頼は手戻り（再生成）を増やす。
- **大きな変更は plan mode で設計を確定してから実装する**。
- 1行修正など些細な編集はエージェントを起動せず自分で行う。
- 文脈が膨らんだら区切りで新セッションに切り替える。

## 4. アプリ実行時の API コスト

- 外部API呼び出しのモデルは既定を軽量モデルにし、必要時のみ `ANTHROPIC_MODEL` で上書きする（例：`app/api/analyze-food`・`app/api/feedback` は Haiku 4.5）。
- 固定の長い文脈（ブランドルール等）はプロンプトキャッシュを検討する。
- ルールベースで代替できる処理は API を呼ばない。

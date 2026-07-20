/**
 * アーティスト グッズ 注文の保存先（このスプレッドシートに付属のスクリプト）
 *
 * 使い方:
 *  1. 注文用スプレッドシートを開く →「拡張機能」→「Apps Script」
 *  2. 既定の Code.gs の中身をすべて消し、このファイルの内容を貼り付けて保存
 *  3. 右上「デプロイ」→「新しいデプロイ」→ 種類「ウェブアプリ」
 *       - 次のユーザーとして実行: 自分
 *       - アクセスできるユーザー: 全員
 *     →「デプロイ」→ 表示される「ウェブアプリのURL（/exec で終わる）」をコピー
 *  4. Vercel の環境変数に設定:
 *       ORDERS_WEBHOOK_URL    = コピーした /exec のURL
 *       ORDERS_WEBHOOK_SECRET = 下の SECRET と同じ値
 *
 * ※ SECRET は Vercel 側と必ず一致させること（第三者の書き込みを防ぐ合言葉）。
 */

// Vercel の ORDERS_WEBHOOK_SECRET と同じ値にすること
const SECRET = "ac084e94364c966c513fd79b7ec1ce053553ae57b6fd954c";

const HEADER = [
  "注文番号", "日時", "ステータス", "氏名", "フリガナ", "メール", "電話",
  "郵便番号", "住所", "商品", "商品小計", "送料", "合計", "備考", "items_json",
];

function sheet_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sh.getLastRow() === 0) sh.appendRow(HEADER);
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.secret !== SECRET) return json_({ ok: false, error: "unauthorized" });

    const sh = sheet_();
    const action = body.action;

    if (action === "append") {
      sh.appendRow(body.row);
      return json_({ ok: true });
    }

    if (action === "list") {
      const values = sh.getDataRange().getValues();
      values.shift(); // ヘッダー行を除く
      return json_({ ok: true, rows: values });
    }

    if (action === "status" || action === "delete") {
      const last = sh.getLastRow();
      if (last < 2) return json_({ ok: false, error: "notfound" });
      const ids = sh.getRange(2, 1, last - 1, 1).getValues();
      let row = -1;
      for (let i = 0; i < ids.length; i++) {
        if (String(ids[i][0]) === String(body.id)) {
          row = i + 2; // データは2行目から
          break;
        }
      }
      if (row === -1) return json_({ ok: false, error: "notfound" });
      if (action === "status") {
        sh.getRange(row, 3).setValue(body.status);
      } else {
        sh.deleteRow(row);
      }
      return json_({ ok: true });
    }

    return json_({ ok: false, error: "bad action" });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

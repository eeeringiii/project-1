/**
 * 【フォールバック版】LINE Messaging API の Webhook を直接受ける版。
 *
 * エルメに「外部URLを叩くアクション」が無い場合はこちらを使う。
 * 友だち追加＝follow イベントを LINE から直接受け取り、getProfile で
 * 表示名を取得してスプレッドシートに1行追記する。
 *
 * ※ この Code_LINE_webhook.gs と 通常版 Code.gs は "どちらか一方" を使う。
 *   1つのGASプロジェクトに両方入れると doPost が衝突するので注意。
 *
 * 【重要な前提】
 *   LINE公式アカウントの Webhook URL は1つだけ。ここに設定すると
 *   エルメ側の自動応答は止まる。エルメを主で使う場合は通常版(Code.gs)＋
 *   エルメの外部送信アクションを優先すること。
 *
 * 【デプロイ】
 *   1. script.google.com で新規プロジェクト → このファイルを貼り付け
 *   2. 下の設定を埋める（特に CHANNEL_ACCESS_TOKEN）
 *   3. デプロイ → ウェブアプリ（実行=自分 / アクセス=全員）
 *   4. LINE Developers → 対象チャネル → Messaging API設定:
 *        Webhook URL = 発行URL + "?token=秘密の文字列"
 *        「Webhookの利用」をON / 「応答メッセージ」はお好みでOFF
 *   5. 「検証」ボタンで疎通確認
 */

// ========================= 設定 =========================
const SHEET_ID = '1UPoW2mvBQ72tdxDVPn4AG2Pcr0QuXxt0hfrZ8ZUzbNk';
const SHEET_NAME = ''; // 空なら先頭シート
const OA_ID = 'Uedaf7af0694ed06d83174a48eaa032a4'; // トークルームURL用

// LINE Developers → Messaging API設定 → 「チャネルアクセストークン(長期)」
const CHANNEL_ACCESS_TOKEN = 'CHANGE_ME_チャネルアクセストークン';

// Webhook URLの ?token= と一致させる合言葉（第三者POST対策）
const SECRET_TOKEN = 'CHANGE_ME_長いランダム文字列に置き換える';

const SKIP_DUPLICATE = true; // 同じuidが居たら追記しない
// =======================================================

function doPost(e) {
  // LINEには常に200を返す（処理失敗でも再送ループを避ける）
  try {
    if (!e || !e.parameter || String(e.parameter.token || '') !== String(SECRET_TOKEN)) {
      return ok_(); // 認証NGでも200（内容は無視）
    }
    const body = (e.postData && e.postData.contents) ? JSON.parse(e.postData.contents) : {};
    const events = body.events || [];
    events.forEach(function (ev) {
      if (ev && ev.type === 'follow' && ev.source && ev.source.userId) {
        handleFollow_(ev.source.userId);
      }
    });
  } catch (err) {
    Logger.log('doPost error: ' + err);
  }
  return ok_();
}

// LINEの「検証」ボタンや疎通確認用（GETで開ける）
function doGet() {
  return ContentService.createTextOutput('OK');
}

function handleFollow_(uid) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30 * 1000);
  try {
    const sheet = getSheet_();
    if (SKIP_DUPLICATE && uidExists_(sheet, uid)) return;

    const name = getDisplayName_(uid) || 'LINEユーザー';
    const talkRoomUrl = 'https://chat.line.biz/' + OA_ID + '/chat/' + uid;
    const nextNo = nextNo_(sheet);
    // A No | B 名前 | C トークルームURL | D..L 空 | M ステータス
    sheet.appendRow([nextNo, name, talkRoomUrl, '', '', '', '', '', '', '', '', '', '']);
  } finally {
    lock.releaseLock();
  }
}

function getDisplayName_(uid) {
  try {
    const res = UrlFetchApp.fetch('https://api.line.me/v2/bot/profile/' + uid, {
      method: 'get',
      headers: { 'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN },
      muteHttpExceptions: true
    });
    if (res.getResponseCode() === 200) {
      const profile = JSON.parse(res.getContentText());
      return profile.displayName || '';
    }
    Logger.log('getProfile failed: ' + res.getResponseCode() + ' ' + res.getContentText());
  } catch (err) {
    Logger.log('getProfile error: ' + err);
  }
  return '';
}

function getSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  if (SHEET_NAME) {
    const s = ss.getSheetByName(SHEET_NAME);
    if (!s) throw new Error('sheet not found: ' + SHEET_NAME);
    return s;
  }
  return ss.getSheets()[0];
}

function uidExists_(sheet, uid) {
  const last = sheet.getLastRow();
  if (last < 1) return false;
  const urls = sheet.getRange(1, 3, last, 1).getValues();
  for (let i = 0; i < urls.length; i++) {
    if (String(urls[i][0] || '').indexOf(uid) >= 0) return true;
  }
  return false;
}

function nextNo_(sheet) {
  const last = sheet.getLastRow();
  if (last < 1) return 1;
  const col = sheet.getRange(1, 1, last, 1).getValues();
  let maxNo = 0;
  for (let i = 0; i < col.length; i++) {
    const v = col[i][0];
    if (typeof v === 'number' && isFinite(v)) {
      if (v > maxNo) maxNo = v;
    } else if (typeof v === 'string' && /^\d+$/.test(v.trim())) {
      const n = parseInt(v.trim(), 10);
      if (n > maxNo) maxNo = n;
    }
  }
  return maxNo + 1;
}

function ok_() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

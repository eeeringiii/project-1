/**
 * エルメ(L Message)の「友だち追加アクション」から叩かれ、
 * 友だち情報をGoogleスプレッドシートに1行追記するWebアプリ。
 *
 * 【デプロイ方法】
 *   1. https://script.google.com で新規プロジェクトを作成
 *   2. このファイルの内容を Code.gs に貼り付け
 *   3. 下の「設定」セクションを自分の値に書き換え
 *   4. 「デプロイ」→「新しいデプロイ」→ 種類「ウェブアプリ」
 *        - 実行するユーザー : 自分
 *        - アクセスできるユーザー : 全員
 *   5. 発行された「ウェブアプリのURL」を控える（エルメ側で使用）
 *
 * 【叩き方】GET / POST どちらでも可。以下のパラメータを渡す。
 *   token  : 下の SECRET_TOKEN と一致必須（不正アクセス防止）
 *   name   : LINE表示名（必須）
 *   uid    : LINEユーザーID(mid, U始まり) 任意 → トークルームURLの生成に使用
 *   status : ステータス列に入れる文字列 任意
 *
 * 例:
 *   https://script.google.com/macros/s/XXXX/exec?token=秘密の文字列&name=山田太郎&uid=U123...
 */

// ========================= 設定（ここだけ書き換える） =========================
// 追記先スプレッドシートのID（URLの /d/ と /edit の間）
const SHEET_ID = '1UPoW2mvBQ72tdxDVPn4AG2Pcr0QuXxt0hfrZ8ZUzbNk';

// 書き込むシート名。空文字なら先頭シートを使う。
const SHEET_NAME = '';

// トークルームURL( https://chat.line.biz/{OA_ID}/chat/{uid} )のアカウント部分。
// 既存シートのURLから採取済み。LINE公式アカウントを変えたら差し替える。
const OA_ID = 'Uedaf7af0694ed06d83174a48eaa032a4';

// 不正アクセス防止の合言葉。長いランダム文字列にして、エルメ側URLの ?token= と一致させる。
const SECRET_TOKEN = 'CHANGE_ME_長いランダム文字列に置き換える';

// 同じ人(uid)が既に居たら追記しない（ブロック解除→再追加時の重複防止）
const SKIP_DUPLICATE = true;
// ============================================================================

function doGet(e) {
  return handle_(e);
}

function doPost(e) {
  return handle_(e);
}

function handle_(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30 * 1000); // 同時追記の競合を防ぐ
  try {
    const p = parseParams_(e);

    // 認証
    if (String(p.token || '') !== String(SECRET_TOKEN)) {
      return json_({ ok: false, error: 'unauthorized' });
    }

    const name = String(p.name || '').trim();
    if (!name) {
      return json_({ ok: false, error: 'name is required' });
    }

    const uid = String(p.uid || '').trim();
    const statusText = String(p.status || '').trim();
    const talkRoomUrl = uid ? ('https://chat.line.biz/' + OA_ID + '/chat/' + uid) : '';

    const sheet = getSheet_();

    // 重複チェック（トークルームURL列に同じuidが有れば skip）
    if (SKIP_DUPLICATE && uid) {
      if (uidExists_(sheet, uid)) {
        return json_({ ok: true, skipped: true, reason: 'duplicate', name: name });
      }
    }

    const nextNo = nextNo_(sheet);

    // 列: A No | B LINEユーザー名 | C トークルームURL | D 営業 | E 初回面談設定 |
    //     F 契約締結 | G サポート | H 受給 | I 入金 | J プラン | K 金額 | L 担当者 | M ステータス
    const row = [nextNo, name, talkRoomUrl, '', '', '', '', '', '', '', '', '', statusText];
    sheet.appendRow(row);

    return json_({ ok: true, added: true, no: nextNo, name: name });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function parseParams_(e) {
  // クエリ / フォームPOST
  const params = (e && e.parameter) ? Object.assign({}, e.parameter) : {};
  // JSON body の POST にも対応
  if (e && e.postData && e.postData.contents) {
    const type = String(e.postData.type || '');
    if (type.indexOf('application/json') >= 0) {
      try {
        const body = JSON.parse(e.postData.contents);
        Object.keys(body).forEach(function (k) {
          if (params[k] === undefined) params[k] = body[k];
        });
      } catch (ignore) {}
    }
  }
  return params;
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
  // C列(トークルームURL)を走査
  const urls = sheet.getRange(1, 3, last, 1).getValues();
  for (let i = 0; i < urls.length; i++) {
    const v = String(urls[i][0] || '');
    if (v && v.indexOf(uid) >= 0) return true;
  }
  return false;
}

function nextNo_(sheet) {
  const last = sheet.getLastRow();
  if (last < 1) return 1;
  const col = sheet.getRange(1, 1, last, 1).getValues(); // A列
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

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 動作確認用。エディタ上で実行するとテスト行が1行追加される。
 * 実行後にシートを確認し、問題なければテスト行は手動削除してください。
 */
function testAppend() {
  const res = handle_({
    parameter: {
      token: SECRET_TOKEN,
      name: 'テスト太郎',
      uid: 'Utest0000000000000000000000000001',
      status: 'テスト追加'
    }
  });
  Logger.log(res.getContent());
}

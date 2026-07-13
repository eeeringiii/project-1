// エルメ（L Message）初回面談リマインド 半自動セットアップ
// ローカルPCで、CDPデバッグ起動した自分のChromeに接続して文面を流し込む。
//
// 使い方は README.md を参照。要点だけ:
//   1) 専用プロファイルのChromeを --remote-debugging-port=9222 で起動し、エルメにログイン
//   2) `node setup.mjs`（デフォルトは接続テストのみ。安全確認）
//   3) `node setup.mjs greeting` のようにステップ名を指定して実行
//
// 【安全方針】
//   - 認証情報はこのスクリプトに一切持たせない（本人のChromeセッションを再利用）
//   - 文面の入力(下書き)まで自動。「保存/配信ON/公開」は人間が目視で押す
//   - セレクタは実DOMに依存するため CONFIG.selectors に集約。空なら手動貼付にフォールバック

import { chromium } from 'playwright';
import readline from 'node:readline';
import { MESSAGES } from './messages.js';

const CONFIG = {
  cdpUrl: process.env.CDP_URL || 'http://localhost:9222',
  // エルメの各画面URL（実環境に合わせて調整。空なら遷移せず現在のタブを使う）
  urls: {
    greeting: '',   // あいさつメッセージ編集画面
    calendar: '',   // カレンダー予約 新規作成画面
    reminder: '',   // リマインド配信 新規作成画面
  },
  // 本文入力欄のセレクタ。実画面で開発者ツール(要素を検証)で拾って埋める。
  // textarea でも contenteditable でも下の fillEditor が両対応する。
  selectors: {
    // 例: 'textarea[name="message"]' や 'div.ql-editor'
    messageEditor: '',
  },
  // 安全ロック: 配信ON・公開・確定など「後戻りしにくい操作」は自動で押さない
  neverClick: ['配信', '公開', '送信', '有効', 'ON', '確定'],
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));
const log = (...a) => console.log('  ', ...a);

async function connect() {
  console.log(`\n[接続] ${CONFIG.cdpUrl} のChromeに接続します...`);
  const browser = await chromium.connectOverCDP(CONFIG.cdpUrl);
  const context = browser.contexts()[0];
  if (!context) throw new Error('コンテキストが見つかりません。Chromeがデバッグ起動しているか確認してください。');
  const page = context.pages()[0] || (await context.newPage());
  console.log('[接続] OK。現在のURL:', page.url());
  return { browser, page };
}

// textarea / input / contenteditable のいずれでも本文を流し込む
async function fillEditor(page, selector, text) {
  if (!selector) {
    console.log('\n--- セレクタ未設定のため、以下を手動で貼り付けてください ---');
    console.log(text);
    console.log('--- ここまで ---');
    await ask('貼り付けたら Enter を押してください > ');
    return;
  }
  const el = page.locator(selector).first();
  await el.waitFor({ state: 'visible', timeout: 15000 });
  const tag = await el.evaluate((n) => n.tagName.toLowerCase());
  if (tag === 'textarea' || tag === 'input') {
    await el.fill(text);
  } else {
    // contenteditable 想定: クリア→タイプ
    await el.click();
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
    await page.keyboard.press('Delete');
    await el.type(text, { delay: 5 });
  }
  log('本文を入力しました（下書き）。内容を目視で確認してください。');
}

async function goto(page, url) {
  if (url) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    log('遷移:', url);
  } else {
    log('URL未設定のため、対象画面をご自分で開いてください。');
    await ask('対象画面を開いたら Enter > ');
  }
}

// --- 各ステップ（本文入力=下書きまで。保存/ONは人間が押す） ---
const STEPS = {
  async greeting(page) {
    console.log('\n■ STEP1: あいさつメッセージ（⓪申込導線）');
    await goto(page, CONFIG.urls.greeting);
    await fillEditor(page, CONFIG.selectors.messageEditor, MESSAGES.greeting);
    console.log('※ 予約URL発行後、〔予約ボタン／URL〕を差し替えてください。');
  },
  async calendar(page) {
    console.log('\n■ STEP2: カレンダー予約');
    await goto(page, CONFIG.urls.calendar);
    console.log('  予約名: 退職相談 初回面談 / 所要: 45分');
    await fillEditor(page, CONFIG.selectors.messageEditor, MESSAGES.calendarGuide);
    console.log('※ 予約完了時アクションに①を設定 → 発行された予約URLをSTEP1へ。');
    await fillEditor(page, CONFIG.selectors.messageEditor, MESSAGES.bookingConfirm);
  },
  async reminders(page) {
    console.log('\n■ STEP3-4: リマインド配信（②前日/③直前/④面談後/⑤3日後）');
    console.log('  基準日時 = カレンダー予約の予約日時');
    const items = [
      ['② 前日 18:00（基準の1日前）', MESSAGES.reminderPrevDay],
      ['③ 開始1時間前', MESSAGES.reminderJustBefore],
      ['④ 面談後（当日21:00 or 2時間後）', MESSAGES.afterSameDay],
      ['⑤ 3日後 10:00（要: 手続き中タグ除外）', MESSAGES.after3days],
    ];
    for (const [label, text] of items) {
      console.log(`\n  ▶ ${label}`);
      await goto(page, CONFIG.urls.reminder);
      await fillEditor(page, CONFIG.selectors.messageEditor, text);
      await ask('  このタイミングを保存したら Enter で次へ > ');
    }
  },
};

async function main() {
  const step = process.argv[2];
  console.log('==== エルメ 初回面談リマインド 半自動セットアップ ====');
  console.log('安全方針: 下書き入力まで自動 / 保存・配信ONは手動。');
  console.log(`自動でクリックしない語: ${CONFIG.neverClick.join(' , ')}`);

  const { browser, page } = await connect();
  try {
    if (!step) {
      console.log('\n[確認モード] 接続のみ成功。実行するには次のいずれかを指定:');
      console.log('  node setup.mjs greeting    … あいさつメッセージ');
      console.log('  node setup.mjs calendar    … カレンダー予約＋①');
      console.log('  node setup.mjs reminders   … ②③④⑤リマインド');
      console.log('  node setup.mjs all         … 上を順に');
    } else if (step === 'all') {
      for (const fn of Object.values(STEPS)) await fn(page);
    } else if (STEPS[step]) {
      await STEPS[step](page);
    } else {
      console.log(`不明なステップ: ${step}`);
    }
    console.log('\n完了。各画面の内容を目視確認し、問題なければ手動で保存/配信ONしてください。');
  } finally {
    rl.close();
    // CDP接続はデタッチのみ（本人のChromeは閉じない）
    await browser.close();
  }
}

main().catch((e) => {
  console.error('エラー:', e.message);
  process.exit(1);
});

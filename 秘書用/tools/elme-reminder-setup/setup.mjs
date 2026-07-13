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
import { MESSAGES } from './messages.mjs';

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
  const pages = context.pages();
  // エルメ管理画面(step.lme.jp)のタブを最優先で選ぶ。広告LP等の別タブを掴まないため。
  let page =
    pages.find((p) => p.url().includes('step.lme.jp')) ||
    pages.find((p) => p.url().includes('lme.jp/basic')) ||
    pages[0] ||
    (await context.newPage());
  await page.bringToFront().catch(() => {});
  console.log('[接続] OK。操作するタブ:', page.url());
  const others = pages.filter((p) => p !== page).map((p) => p.url());
  if (others.length) console.log('  （他のタブ: ' + others.join(' / ') + '）');
  return { browser, page };
}

// 入力欄を自動検出（メインフレーム＋iframe を走査し、可視で最大の候補を返す）
async function findEditor(page) {
  const selectors = [
    'textarea',
    'div[contenteditable="true"]',
    '[contenteditable="true"]',
    '.ql-editor',
    'div[role="textbox"]',
  ];
  let best = null;
  for (const frame of page.frames()) {
    for (const sel of selectors) {
      let els = [];
      try { els = await frame.$$(sel); } catch { continue; }
      for (const el of els) {
        let box;
        try { box = await el.boundingBox(); } catch { continue; }
        if (!box || box.width < 100 || box.height < 30) continue; // 小さすぎる欄は除外
        const area = box.width * box.height;
        if (!best || area > best.area) best = { el, area };
      }
    }
  }
  return best ? best.el : null;
}

// textarea / input / contenteditable のいずれでも本文を流し込む
async function typeInto(page, el, text) {
  const tag = await el.evaluate((n) => n.tagName.toLowerCase());
  const editable = await el.evaluate((n) => n.isContentEditable);
  await el.evaluate((n) => n.scrollIntoView({ block: 'center' }));
  if (tag === 'textarea' || tag === 'input') {
    await el.fill(text);
  } else if (editable) {
    await el.click();
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
    await page.keyboard.press('Delete');
    await el.type(text, { delay: 3 });
  } else {
    await el.fill(text).catch(async () => { await el.type(text, { delay: 3 }); });
  }
  log('本文を入力しました（下書き）。内容を目視で確認してください。');
}

// セレクタ指定 → 自動検出 → それでも無理なら手動貼付、の順で本文を入れる
async function fillEditor(page, selector, text) {
  // 1) セレクタが明示されていればそれを使う
  if (selector) {
    const el = page.locator(selector).first();
    try {
      await el.waitFor({ state: 'visible', timeout: 8000 });
      await typeInto(page, el, text);
      return;
    } catch { /* 見つからなければ自動検出へ */ }
  }
  // 2) 入力欄を自動検出し、赤枠でハイライトして確認
  const found = await findEditor(page);
  if (found) {
    await found.evaluate((n) => { n.style.outline = '3px solid #e11'; });
    console.log('\n入力候補の欄を【赤枠】でハイライトしました。エルメ画面をご確認ください。');
    const ans = await ask('この欄でよければ Enter / 違う・手動で貼るなら s + Enter > ');
    await found.evaluate((n) => { n.style.outline = ''; });
    if (ans.trim().toLowerCase() !== 's') {
      await typeInto(page, found, text);
      return;
    }
  }
  // 3) フォールバック: 手動貼付
  console.log('\n--- 自動入力できないので、以下を手動で貼り付けてください ---');
  console.log(text);
  console.log('--- ここまで ---');
  await ask('貼り付けたら Enter を押してください > ');
}

// 画面の入力欄・ボタンを一覧で吐き出す（自動化コードを書くための調査）
async function inspect(page) {
  console.log('\n■ 画面の入力欄・ボタンを調査します:', page.url());
  const report = [];
  let frameIdx = 0;
  for (const frame of page.frames()) {
    const items = await frame.evaluate(() => {
      const out = [];
      const vis = (el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
      };
      const desc = (el) => {
        const p = [el.tagName.toLowerCase()];
        if (el.id) p.push('#' + el.id);
        if (el.name) p.push('[name="' + el.name + '"]');
        const ph = el.getAttribute && el.getAttribute('placeholder');
        if (ph) p.push('[placeholder="' + ph + '"]');
        if (typeof el.className === 'string' && el.className.trim())
          p.push('.' + el.className.trim().split(/\s+/).slice(0, 3).join('.'));
        return p.join(' ');
      };
      document.querySelectorAll('input, textarea, [contenteditable="true"], .ql-editor, [role="textbox"]').forEach((el) => {
        if (!vis(el)) return;
        const r = el.getBoundingClientRect();
        out.push({ kind: 'input', desc: desc(el), type: el.type || '', w: Math.round(r.width), h: Math.round(r.height) });
      });
      document.querySelectorAll('button, a[role="button"], input[type="submit"], [role="button"]').forEach((el) => {
        if (!vis(el)) return;
        const label = (el.innerText || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 30);
        out.push({ kind: 'button', desc: desc(el), label });
      });
      return out;
    }).catch(() => []);
    if (items.length) {
      report.push(`--- frame#${frameIdx} ${frame.url().slice(0, 70)} ---`);
      for (const it of items) {
        if (it.kind === 'input') report.push(`  [入力] ${it.desc}  (type=${it.type}, ${it.w}x${it.h})`);
        else report.push(`  [ボタン] "${it.label}"  ${it.desc}`);
      }
    }
    frameIdx++;
  }
  console.log(report.join('\n') || '（入力欄・ボタンが見つかりませんでした。対象画面が開いているか確認してください）');
  console.log('\n↑ この出力を秘書に貼ってください。各画面用の自動化コードを作ります。');
}

// ①スコープ: ファネル段階タグ ＋ 制御_予約済 を一括作成
const FUNNEL_TAGS = [
  'F1_友だち追加',
  'F2_予約ページ閲覧',
  'F3_予約完了',
  'F4_面談実施',
  'F5_手続き中',
  'F6_成約',
  'F9_離脱_無反応',
  'F9_キャンセル',
  'F9_無断欠席',
  'F9_対象外',
  '制御_予約済',
];

// タグ管理画面(/basic/tag)で、複数タグ欄に一括入力して保存する
async function tags(page) {
  console.log('\n■ タグ一括作成:', page.url());
  if (!page.url().includes('/basic/tag')) {
    console.log('  タグ管理画面(左メニュー「データ管理」→「タグ管理」)を開いてから実行してください。');
    return;
  }
  const inputSel = 'input[name^="tag-"]';
  const addBtn = page.locator('button:has-text("タグを追加")').first();

  // 入力欄が無ければ「新規作成」でモーダルを開く
  let inputs = await page.locator(inputSel).all();
  if (inputs.length === 0) {
    log('入力欄が無いので「新規作成」を開きます。');
    await page.locator('button:has-text("新規作成")').first().click().catch(() => {});
    await page.waitForTimeout(700);
    inputs = await page.locator(inputSel).all();
  }
  if (inputs.length === 0) {
    console.log('  タグ名の入力欄が見つかりませんでした。「新規作成」を押して入力欄が出た状態で再実行してください。');
    return;
  }

  // 1件ずつ入力。欄が足りなければ「タグを追加」で増やす
  for (let i = 0; i < FUNNEL_TAGS.length; i++) {
    inputs = await page.locator(inputSel).all();
    if (i >= inputs.length) {
      await addBtn.click();
      await page.waitForTimeout(350);
      inputs = await page.locator(inputSel).all();
    }
    if (i >= inputs.length) {
      console.log(`  欄を増やせませんでした（${i + 1}件目）。手動で「タグを追加」を押してから再実行してください。`);
      break;
    }
    await inputs[i].fill(FUNNEL_TAGS[i]);
    log(`入力: ${FUNNEL_TAGS[i]}`);
  }

  console.log('\n入力が完了しました。エルメ画面で内容（全11件・誤字なし）をご確認ください。');
  const ans = await ask('保存しますか？ Enter=保存する / s+Enter=保存せず終了 > ');
  if (ans.trim().toLowerCase() === 's') {
    console.log('保存せず終了しました。');
    return;
  }
  await page.locator('button.btn-save, button:has-text("保存")').first().click();
  log('保存しました。タグ一覧に11件反映されているか確認してください。');
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
    } else if (step === 'inspect') {
      await inspect(page);
    } else if (step === 'tags') {
      await tags(page);
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

/**
 * 【事務所】グッズ制作進捗管理表 — 書式・入力規則の自動設定
 *
 * 使い方（1回だけ）:
 *  1. 対象シートを開く
 *     https://docs.google.com/spreadsheets/d/1Nibc2RAFbJB0LjLsNQNFl2XxutN3ZpCBcIufhlkByGA/edit
 *  2. メニュー「拡張機能」→「Apps Script」を開く
 *  3. このファイルの中身を全部貼り付けて保存
 *  4. 関数「setupGoodsSheet」を選んで ▶ 実行（初回だけ承認を求められます）
 *
 * やること: ヘッダー整形・固定／列幅調整／ステータスのプルダウン／
 *          金額と日付の表示形式／期限超過の自動ハイライト／縞模様／凡例メモ
 */
function setupGoodsSheet() {
  var SHEET_ID = '1Nibc2RAFbJB0LjLsNQNFl2XxutN3ZpCBcIufhlkByGA';
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheets()[0];

  // 列の並び（A=1）: 1グッズID 2ステータス 3商品名 4種別 5制作会社 6窓口担当
  // 7連絡手段 8数量 9原価単価 10販売価格 11発注日 12入稿締切 13校了日
  // 14納品予定日 15納品完了日 16販売開始日 17在庫数 18支払期限 19支払完了 20備考
  var lastRow = Math.max(sh.getMaxRows(), 200);
  var lastCol = 20;

  // --- ヘッダー整形 ---
  var header = sh.getRange(1, 1, 1, lastCol);
  header.setBackground('#1f2a44').setFontColor('#ffffff').setFontWeight('bold')
        .setVerticalAlignment('middle').setHorizontalAlignment('center');
  sh.setRowHeight(1, 34);
  sh.setFrozenRows(1);
  sh.setFrozenColumns(3); // グッズID・ステータス・商品名まで固定

  // --- 列幅（見やすさ優先） ---
  var widths = {1:110, 2:96, 3:180, 4:90, 5:150, 6:100, 7:170, 8:64, 9:90,
                10:90, 11:100, 12:100, 13:100, 14:110, 15:110, 16:110, 17:72,
                18:100, 19:84, 20:260};
  Object.keys(widths).forEach(function(c){ sh.setColumnWidth(Number(c), widths[c]); });

  // --- ステータスのプルダウン（B列 2行目以降） ---
  var statuses = ['企画','見積','発注','入稿待ち','校正中','校了','製造中','納品待ち','納品済','販売中','完売'];
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(statuses, true)
             .setAllowInvalid(true).build();
  sh.getRange(2, 2, lastRow - 1, 1).setDataValidation(rule);
  // ステータスの意味は B1 のメモに退避（備考欄をすっきりさせる）
  sh.getRange(1, 2).setNote('選択肢：' + statuses.join(' / '));

  // --- 金額（原価9・販売10）と数量（8・在庫17）の表示形式 ---
  sh.getRange(2, 9, lastRow - 1, 2).setNumberFormat('¥#,##0');
  sh.getRange(2, 8, lastRow - 1, 1).setNumberFormat('#,##0');
  sh.getRange(2, 17, lastRow - 1, 1).setNumberFormat('#,##0');
  // 日付列（11発注 12入稿 13校了 14納品予定 15納品完了 16販売開始 18支払期限）
  [11,12,13,14,15,16,18].forEach(function(c){
    sh.getRange(2, c, lastRow - 1, 1).setNumberFormat('yyyy/mm/dd');
  });

  // --- 縞模様（既存のバンディングがあれば消してから） ---
  sh.getBandings().forEach(function(b){ b.remove(); });
  sh.getRange(1, 1, lastRow, lastCol)
    .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false);

  // --- 条件付き書式（期限超過などを自動で色付け） ---
  var body = sh.getRange(2, 1, lastRow - 1, lastCol);
  var rules = [];
  // 支払期限超過（支払完了S=空 かつ 支払期限R<今日）→ 行を薄赤
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND($S2="",$R2<>"",$R2<TODAY())')
    .setBackground('#f8d0d0').setRanges([body]).build());
  // 納品予定日超過（納品完了O=空 かつ 納品予定N<今日）→ 納品予定セルを橙
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND($O2="",$N2<>"",$N2<TODAY())')
    .setBackground('#ffe0b2').setRanges([sh.getRange(2,14,lastRow-1,1)]).build());
  // 入稿締切超過（校了M=空 かつ 入稿締切L<今日）→ 入稿締切セルを黄
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND($M2="",$L2<>"",$L2<TODAY())')
    .setBackground('#fff3b0').setRanges([sh.getRange(2,12,lastRow-1,1)]).build());
  // ステータス=完売 → 行をグレーアウト
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$B2="完売"')
    .setBackground('#e8e8e8').setFontColor('#888888').setRanges([body]).build());
  sh.setConditionalFormatRules(rules);

  SpreadsheetApp.flush();
}

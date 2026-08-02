# OSHICOA 16 character assets

正式キャラクター画像はこのフォルダに配置します。

- `rcgt.png`
- `rcgs.png`
- `rcmt.png`
- `rcms.png`
- `rpgt.png`
- `rpgs.png`
- `rpmt.png`
- `rpms.png`
- `cegt.png`
- `cegs.png`
- `cemt.png`
- `cems.png`
- `cpgt.png`
- `cpgs.png`
- `cpmt.png`
- `cpms.png`

背景透過PNGを推奨します。ファイル名は変更しないでください。

画像が未配置の場合、診断書・X用カード・Storyカード・Web結果画面では代替の簡易アバターを生成せず、キャラクター領域は空のまま表示されます。

## 使われる場所

- 結果画面（`/result/[typeCode]`）のヒーロー
- 設問画面（`/diagnosis/questions`）— 24問のあいだ16タイプが順番に登場します
- 設問画面の「解析中…」ローディング

設問画面では16枚すべてを順に読み込むため、1枚あたり **200KB 以下**（横幅 800px 程度）に圧縮してから置いてください。
画像が無いタイプは、`lib/theme.ts` で設定した絵文字マークに自動でフォールバックします。

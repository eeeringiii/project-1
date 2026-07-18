import type { DiagnosisQuestion } from "@/types";

/**
 * 24問の診断質問。
 *
 * weights: 軸の極への加点。回答強度（3/1/-1/-3）と掛け合わせる。
 *   R(共鳴)↔C(接続) / E(体験)↔P(所有) / G(成長支援)↔M(自己充足) / T(連帯)↔S(単独)
 * chartWeights: レーダーチャート8項目への補正。
 * tagWeights: 業タグのスコア加点（複数回答の組み合わせで判定される）。
 * phaseWeights: 関係フェーズのスコア加点。
 *
 * 各質問がどの判定へ影響するかは README「診断ロジック」に一覧を記載している。
 * 極ごとの合計重みには偏りがあるが、determineType では極ごとに正規化して比較するため
 * 質問数の偏りが結果を偏らせない設計になっている（lib/diagnosis/normalizeScores.ts 参照）。
 */
export const questions: DiagnosisQuestion[] = [
  {
    id: "q1",
    text: "推しの作品そのものより、推し本人から反応をもらえた瞬間のほうが強く記憶に残る。",
    weights: { C: 2 },
    chartWeights: { ninchi: 2 },
    tagWeights: { "res-kensho": 1 },
  },
  {
    id: "q2",
    text: "新規ファンが増えると嬉しいが、少しだけ寂しさも感じる。",
    weights: { S: 2, M: 1 },
    tagWeights: { "shinki-keikai": 2, "kosan-kioku": 1 },
    phaseWeights: { kentai: 1 },
  },
  {
    id: "q3",
    text: "ランダムグッズは、推しが出るまで買わないと終われない。",
    weights: { P: 2 },
    chartWeights: { tsumi: 2 },
    tagWeights: { "random-haiboku": 2, "gentei-yowai": 1 },
    phaseWeights: { zenryoku: 1 },
  },
  {
    id: "q4",
    text: "ライブ後は誰かと話すより、ひとりでセトリを聴き直したい。",
    weights: { S: 2, M: 1 },
    chartWeights: { yoin: 2, rentai: -1 },
    tagWeights: { "setlist-saisei": 2, "kyokyu-hansu": 1 },
    phaseWeights: { "kaishaku-shinka": 1 },
  },
  {
    id: "q5",
    text: "公式の宣伝が弱いと、自分が何とかしなければと思う。",
    weights: { G: 2 },
    chartWeights: { fukyo: 1 },
    tagWeights: { "unei-kanshi": 2 },
    phaseWeights: { zenryoku: 1 },
  },
  {
    id: "q6",
    text: "認知されなくても、作品を長く残すことに貢献できれば満足だ。",
    weights: { R: 2, G: 1 },
    chartWeights: { ninchi: -2, kiroku: 1 },
    tagWeights: { "kosan-kioku": 1 },
  },
  {
    id: "q7",
    text: "推しの売上や再生数を、本人以上に気にしている気がする。",
    weights: { G: 2 },
    chartWeights: { fukyo: 1 },
    tagWeights: { "unei-kanshi": 1, "koushiki-tsuchi": 2 },
  },
  {
    id: "q8",
    text: "同担のファンサ報告を見て、素直に喜べない日もある。",
    weights: { C: 1, S: 1 },
    chartWeights: { ninchi: 1, rentai: -1 },
    tagWeights: { "doutan-kansoku": 2, "res-kensho": 1 },
    phaseWeights: { jocho: 1 },
  },
  {
    id: "q9",
    text: "参戦する予定がなくても、チケット情報は一応確認する。",
    weights: { E: 2 },
    chartWeights: { genba: 2 },
    tagWeights: { zentsu: 2, "ticket-jocho": 1 },
  },
  {
    id: "q10",
    text: "グッズは使うためではなく、存在を保護するために買う。",
    weights: { P: 2 },
    chartWeights: { kiroku: 2 },
    tagWeights: { "kyokyu-hozon": 2, "saidan-zochiku": 1 },
  },
  {
    id: "q11",
    text: "推しを知らない友達へ説明するとき、最適な動画をすぐ提示できる。",
    weights: { T: 2, G: 1, R: 1 },
    chartWeights: { fukyo: 2 },
    tagWeights: { "fukyo-jozai": 2 },
  },
  {
    id: "q12",
    text: "現場が終わった直後から、次に会える日を探してしまう。",
    weights: { E: 2, C: 1 },
    chartWeights: { genba: 2 },
    tagWeights: { zentsu: 1, "ticket-jocho": 1 },
    phaseWeights: { zenryoku: 1 },
  },
  {
    id: "q13",
    text: "「無理しないで応援して」と言われても、勝負所では無理をする。",
    weights: { G: 2 },
    chartWeights: { tsumi: 2 },
    tagWeights: { tsundekara: 2, "ensei-kinsen": 1 },
    phaseWeights: { zenryoku: 2 },
  },
  {
    id: "q14",
    text: "推しの昔のブログやインタビューを掘るのが好きだ。",
    weights: { R: 2 },
    chartWeights: { kiroku: 2, kaishaku: 1 },
    tagWeights: { "kosan-kioku": 2, "kotoba-hozon": 2 },
    phaseWeights: { "kaishaku-shinka": 1 },
  },
  {
    id: "q15",
    text: "同担とは仲良くしたいが、自分の特別な思い出までは共有したくない。",
    weights: { S: 2 },
    chartWeights: { rentai: -1 },
    tagWeights: { "doutan-kansoku": 1 },
  },
  {
    id: "q16",
    text: "推しのために使った金額を、正確には把握していない。",
    weights: { P: 2 },
    chartWeights: { tsumi: 1 },
    tagWeights: { "ensei-kinsen": 2, tsundekara: 1 },
    phaseWeights: { zenryoku: 1 },
  },
  {
    id: "q17",
    text: "推しの発言に矛盾があっても、自分の中で解釈を完成させられる。",
    weights: { R: 2, S: 1 },
    chartWeights: { kaishaku: 2 },
    tagWeights: { "shinya-choubun": 2 },
    phaseWeights: { "kaishaku-shinka": 2 },
  },
  {
    id: "q18",
    text: "推しが幸せならそれでよいと思う一方、自分の存在も少しは知ってほしい。",
    weights: { C: 2 },
    chartWeights: { ninchi: 2 },
    tagWeights: { "res-kensho": 1 },
  },
  {
    id: "q19",
    text: "遠征先では、観光より会場までの導線を優先する。",
    weights: { E: 2 },
    chartWeights: { genba: 2 },
    tagWeights: { "dousen-saiyusen": 2, "ensei-nizukuri": 1 },
  },
  {
    id: "q20",
    text: "推しの魅力より、運営への改善案のほうが長文になることがある。",
    weights: { G: 2 },
    chartWeights: { kaishaku: 1 },
    tagWeights: { "unei-kanshi": 2 },
    phaseWeights: { kentai: 1 },
  },
  {
    id: "q21",
    text: "降りようと思った直後に良い供給が来ると、運命だと思う。",
    weights: { M: 2 },
    chartWeights: { yoin: 1 },
    tagWeights: { "oriru-sagi": 2, "oshigae-hinin": 1 },
    phaseWeights: { jocho: 2 },
  },
  {
    id: "q22",
    text: "同じ絵柄でも、会場限定・店舗限定なら別物として欲しくなる。",
    weights: { P: 2 },
    chartWeights: { tsumi: 1, kiroku: 1 },
    tagWeights: { "tokuten-shiyo": 2, "gentei-yowai": 2 },
  },
  {
    id: "q23",
    text: "ファンが増えすぎる前に推していた事実を、少し誇らしく思う。",
    weights: { S: 2, M: 1 },
    tagWeights: { "kosan-kioku": 2, "shinki-keikai": 1 },
  },
  {
    id: "q24",
    text: "推し活がなくなった自分を想像すると、生活の一部が欠けるように感じる。",
    weights: { M: 2 },
    chartWeights: { yoin: 2 },
    tagWeights: { "kyokyu-hansu": 1 },
    phaseWeights: { eikyu: 2 },
  },
];

export const questionMap: Record<string, DiagnosisQuestion> = Object.fromEntries(
  questions.map((q) => [q.id, q]),
);

export const QUESTION_COUNT = questions.length;

import type { OtakuTag } from "@/types";

/**
 * ヲタクの業タグ（初期30種）。
 * threshold は calculateTags で算出したタグスコアの下限。
 * 単一回答ではなく複数回答の組み合わせで加点される（questions.ts の tagWeights 参照）。
 * 30種以上への拡張は、この配列に要素を追加し questions.ts で加点するだけでよい。
 */
export const tags: OtakuTag[] = [
  { id: "zentsu", name: "全通予備軍", description: "参戦予定がなくても日程とチケット状況を無意識に確認している。行く前提で人生が回っている。", threshold: 3 },
  { id: "shinki-keikai", name: "新規警戒型", description: "新規が増えるのは嬉しい。でも、増えすぎる前の景色を知っている自分を少しだけ守りたい。", threshold: 3 },
  { id: "doutan-kansoku", name: "同担観測民", description: "同担と争わない。ただ静かに観測し、距離を測り、自分の解釈だけは渡さない。", threshold: 3 },
  { id: "res-kensho", name: "レス検証班", description: "「今の、私に向けた？」を何度も再生し、角度と視線から真実を導き出す。", threshold: 3 },
  { id: "kyokyu-hozon", name: "供給即保存型", description: "供給が来た瞬間に指が動く。まず保存、感情はあとから処理する。", threshold: 3 },
  { id: "saidan-zochiku", name: "祭壇増築中", description: "置き場所はもう無い。それでも供給は迎え入れる。祭壇は生き物である。", threshold: 3 },
  { id: "unei-kanshi", name: "運営監視員", description: "推しの心配より運営の采配が気になる日がある。改善案なら三日三晩でも語れる。", threshold: 3 },
  { id: "kosan-kioku", name: "古参記憶保持者", description: "公式が忘れた供給も覚えている。歴史は、あなたの中で途切れていない。", threshold: 3 },
  { id: "random-haiboku", name: "ランダム敗北者", description: "「推しが出るまで」は呪文。出るまで終われないルールで生きている。", threshold: 3 },
  { id: "ensei-kinsen", name: "遠征金銭感覚喪失型", description: "遠征先では移動費が霞む。会えるなら距離も金額も四捨五入される。", threshold: 3 },
  { id: "oshi-kotei-bot", name: "推し肯定bot", description: "供給が来るたび「無理」「しんどい」「天才」を高速で射出する。語彙は溶けている。", threshold: 3 },
  { id: "shinya-choubun", name: "深夜長文感想型", description: "簡単な言葉にするのが惜しくて、気づけば深夜に長文を書いている。", threshold: 3 },
  { id: "tsundekara", name: "積んでから考える型", description: "勝負所では手が先に動く。金額は、積み終わってから直視することにしている。", threshold: 3 },
  { id: "oshigae-hinin", name: "推し変否認期", description: "「降りるかも」と言いながら、その否定材料を無意識に集めている。", threshold: 3 },
  { id: "koukan-bakusoku", name: "交換連絡爆速型", description: "取引の返信は光速。梱包は丁寧。信頼だけは決して落とさない。", threshold: 3 },
  { id: "ticket-jocho", name: "チケット運情緒連動型", description: "当落発表で情緒が乱高下する。その日は仕事にならないと決まっている。", threshold: 3 },
  { id: "kyokyu-hansu", name: "供給永久反芻型", description: "終演後も脳内で再生が止まらない。あの表情を、何日も味わい続ける。", threshold: 3 },
  { id: "screenshot", name: "スクショ連写型", description: "配信中は指が止まらない。あとで見返すためのフィルムを撮り続けている。", threshold: 3 },
  { id: "setlist-saisei", name: "セトリ即再生型", description: "帰り道はもう決まっている。今日のセトリを、そのままの順で聴き直す。", threshold: 3 },
  { id: "dousen-saiyusen", name: "現場導線最優先型", description: "観光より会場までの最短導線。遠征は旅行ではなく作戦行動である。", threshold: 3 },
  { id: "fukyo-jozai", name: "布教素材常備型", description: "相手に合わせた最適な入口動画を、いつでも即座に提示できる。", threshold: 3 },
  { id: "tokuten-shiyo", name: "特典仕様完全把握型", description: "会場限定も店舗限定も別物。仕様の違いは、あなたにとって世界の違い。", threshold: 3 },
  { id: "doutan-repo", name: "同担レポ巡回型", description: "現場後は答え合わせの時間。同担のレポを巡回し、記憶の解像度を上げる。", threshold: 3 },
  { id: "kinenbi", name: "記念日全力型", description: "デビュー日も記念日も逃さない。推し活を、人生の暦に刻んでいる。", threshold: 3 },
  { id: "koushiki-tsuchi", name: "公式通知即反応型", description: "通知が鳴った瞬間に反応する。数字も情報も、誰よりも早く掴みにいく。", threshold: 3 },
  { id: "ensei-nizukuri", name: "遠征荷造り熟練型", description: "遠征装備は完成形。必要なものは、考える前に鞄に入っている。", threshold: 3 },
  { id: "fukusu-meigi", name: "複数名義管理型", description: "応募も購入も、静かに複数ルートを走らせる。届けばそれでいい。", threshold: 3 },
  { id: "gentei-yowai", name: "限定という言葉に弱い型", description: "「限定」の二文字で理性が溶ける。今しか、ここしか、が効いてしまう。", threshold: 3 },
  { id: "kotoba-hozon", name: "推しの言葉永久保存型", description: "昔の発言もブログも保存済み。言葉は、あなたの中で風化しない。", threshold: 3 },
  { id: "oriru-sagi", name: "降りる詐欺常習型", description: "降りようとした直後の供給を、運命と受け取ってしまう常習犯。", threshold: 3 },
];

export const tagMap: Record<string, OtakuTag> = Object.fromEntries(
  tags.map((t) => [t.id, t]),
);

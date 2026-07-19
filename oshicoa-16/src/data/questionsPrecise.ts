import type { DiagnosisQuestion } from "@/types";
import { standardQuestions } from "@/data/questions";

/**
 * 精密48問版で追加される24問（q25〜q48）。
 * 標準24問と同じ設計思想。連帯(T)・交換・記録・遠征・布教など、標準版では手薄だった
 * 極やタグの解像度を上げる設問を中心に構成している。
 * weights/chartWeights/tagWeights/phaseWeights の意味は questions.ts と同じ。
 */
export const additionalQuestions: DiagnosisQuestion[] = [
  {
    id: "q25",
    text: "配信のアーカイブは、生で見られなくても必ず後から追いかける。",
    weights: { C: 1, E: 1 },
    chartWeights: { yoin: 1 },
    tagWeights: { "koushiki-tsuchi": 1 },
  },
  {
    id: "q26",
    text: "遠征の新幹線やホテルは、気づけば誰かと連番・相部屋になっている。",
    weights: { T: 2, E: 1 },
    chartWeights: { genba: 1, rentai: 1 },
    tagWeights: { "ensei-nizukuri": 1 },
  },
  {
    id: "q27",
    text: "感想は、ひとりで書くより誰かと通話で語り合いたい。",
    weights: { T: 2 },
    chartWeights: { rentai: 2 },
    tagWeights: { "doutan-repo": 1 },
  },
  {
    id: "q28",
    text: "自分の解釈は、あえて誰とも共有せず胸にしまっておきたい。",
    weights: { S: 2, R: 1 },
    chartWeights: { kaishaku: 1, rentai: -1 },
    tagWeights: { "shinya-choubun": 1 },
  },
  {
    id: "q29",
    text: "円盤やフォトブックは、何度も見返して細部まで確認する。",
    weights: { P: 2, R: 1 },
    chartWeights: { kiroku: 2 },
    tagWeights: { "kotoba-hozon": 1 },
  },
  {
    id: "q30",
    text: "ライブ本編より、物販列に並ぶ時間のほうが気合いが入る。",
    weights: { P: 2 },
    chartWeights: { tsumi: 1 },
    tagWeights: { "gentei-yowai": 1, "tokuten-shiyo": 1 },
  },
  {
    id: "q31",
    text: "デビュー当時から見届けているという自負が、静かにある。",
    weights: { M: 1, S: 1 },
    chartWeights: { kiroku: 1 },
    tagWeights: { "kosan-kioku": 2 },
    phaseWeights: { eikyu: 1 },
  },
  {
    id: "q32",
    text: "新規向けのまとめや入門ガイドを、つい自分で作ってしまう。",
    weights: { G: 2, T: 1 },
    chartWeights: { fukyo: 2 },
    tagWeights: { "fukyo-jozai": 2 },
  },
  {
    id: "q33",
    text: "認知されたとき用に、覚えてもらえる自分の特徴を用意している。",
    weights: { C: 2 },
    chartWeights: { ninchi: 2 },
    tagWeights: { "res-kensho": 1 },
  },
  {
    id: "q34",
    text: "供給が来たら、感情より先にスクショと録画の指が動く。",
    weights: { P: 1 },
    chartWeights: { kiroku: 1 },
    tagWeights: { screenshot: 2, "kyokyu-hozon": 1 },
  },
  {
    id: "q35",
    text: "目標数字のために、複数のアカウントや名義を使い分けている。",
    weights: { G: 2 },
    tagWeights: { "fukusu-meigi": 2, "koushiki-tsuchi": 1 },
    phaseWeights: { zenryoku: 1 },
  },
  {
    id: "q36",
    text: "現場のあとより、次の遠征の計画を立てているときが一番楽しい。",
    weights: { E: 2, S: 1 },
    chartWeights: { genba: 2 },
    tagWeights: { zentsu: 1, "ensei-nizukuri": 1 },
    phaseWeights: { zenryoku: 1 },
  },
  {
    id: "q37",
    text: "トレカやランダムは、交換前提で多めに確保しておく。",
    weights: { P: 2, T: 1 },
    chartWeights: { tsumi: 1 },
    tagWeights: { "koukan-bakusoku": 2, "random-haiboku": 1 },
  },
  {
    id: "q38",
    text: "同担の輪に入るより、単独で静かに推していたい。",
    weights: { S: 2 },
    chartWeights: { rentai: -1 },
    tagWeights: { "doutan-kansoku": 1 },
  },
  {
    id: "q39",
    text: "推しの言葉やMCを、あとで見返せるようにメモに残している。",
    weights: { R: 2 },
    chartWeights: { kiroku: 1, kaishaku: 1 },
    tagWeights: { "kotoba-hozon": 2, "shinya-choubun": 1 },
  },
  {
    id: "q40",
    text: "会場の一体感より、推しのひとつの表情をじっくり見たい。",
    weights: { S: 1, C: 1 },
    chartWeights: { yoin: 2 },
    tagWeights: { "kyokyu-hansu": 1 },
  },
  {
    id: "q41",
    text: "記念日やデビュー日には、必ず何か形に残す。",
    weights: { P: 1, M: 1 },
    chartWeights: { kiroku: 1 },
    tagWeights: { kinenbi: 2 },
  },
  {
    id: "q42",
    text: "推しの数字が伸びると、自分の努力が報われた気がする。",
    weights: { G: 2 },
    chartWeights: { fukyo: 1 },
    tagWeights: { "unei-kanshi": 1, "koushiki-tsuchi": 1 },
  },
  {
    id: "q43",
    text: "「もう十分推した」と思っても、新しい供給で引き戻される。",
    weights: { M: 1 },
    chartWeights: { yoin: 1 },
    tagWeights: { "oriru-sagi": 1, "oshigae-hinin": 1 },
    phaseWeights: { kentai: 1, jocho: 1 },
  },
  {
    id: "q44",
    text: "現場では、推し以外のメンバーやファンの動きもよく見ている。",
    weights: { T: 1, C: 1 },
    chartWeights: { rentai: 1 },
    tagWeights: { "doutan-repo": 1 },
  },
  {
    id: "q45",
    text: "グッズは飾るより、開封せず保存しておきたい。",
    weights: { P: 2 },
    chartWeights: { kiroku: 2 },
    tagWeights: { "kyokyu-hozon": 2, "saidan-zochiku": 1 },
  },
  {
    id: "q46",
    text: "推しの過去のライブ映像を、順番に見返す時間が幸せだ。",
    weights: { R: 2, M: 1 },
    chartWeights: { yoin: 1, kiroku: 1 },
    tagWeights: { "kosan-kioku": 1 },
    phaseWeights: { "kaishaku-shinka": 1 },
  },
  {
    id: "q47",
    text: "遠征の荷物の最適化が、年々洗練されてきている。",
    weights: { E: 1, S: 1 },
    chartWeights: { genba: 1 },
    tagWeights: { "ensei-nizukuri": 2, "dousen-saiyusen": 1 },
  },
  {
    id: "q48",
    text: "推し活の予定を最優先に、生活のスケジュールを組んでいる。",
    weights: { E: 1, G: 1 },
    chartWeights: { genba: 1 },
    tagWeights: { zentsu: 1 },
    phaseWeights: { zenryoku: 1 },
  },
];

/** 精密48問（標準24問 + 追加24問）。 */
export const preciseQuestions: DiagnosisQuestion[] = [...standardQuestions, ...additionalQuestions];

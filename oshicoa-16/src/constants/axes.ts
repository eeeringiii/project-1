/** 4軸の表示用データ（診断ロジックの AXIS_PAIRS とは別に、UI説明のために持つ）。 */
export type AxisInfo = {
  index: number;
  title: string;
  question: string;
  positive: { key: string; name: string; description: string };
  negative: { key: string; name: string; description: string };
};

export const axisInfos: AxisInfo[] = [
  {
    index: 1,
    title: "推しから得たいもの",
    question: "作品への没入か、本人との接続か。",
    positive: { key: "R", name: "共鳴 / Resonance", description: "作品・言葉・表現・思想を深く受け取りたい。" },
    negative: { key: "C", name: "接続 / Connection", description: "本人からの認知・反応・ファンサなど双方向性を得たい。" },
  },
  {
    index: 2,
    title: "愛の証明方法",
    question: "その瞬間を共有するか、形に残すか。",
    positive: { key: "E", name: "体験 / Experience", description: "ライブ・舞台・配信など、その瞬間を共有したい。" },
    negative: { key: "P", name: "所有 / Possession", description: "グッズ・写真・記録・円盤など、形として残したい。" },
  },
  {
    index: 3,
    title: "推し愛の向かう先",
    question: "推しの未来を動かすか、自分の心を満たすか。",
    positive: { key: "G", name: "成長支援 / Growth", description: "売上・拡散・順位・新規獲得など、推しの未来を動かしたい。" },
    negative: { key: "M", name: "自己充足 / Memory", description: "推しと過ごした時間・受け取った感情・思い出を大切にしたい。" },
  },
  {
    index: 4,
    title: "ファンダムとの関わり",
    question: "みんなで盛り上がるか、自分の解釈を守るか。",
    positive: { key: "T", name: "連帯 / Tribe", description: "同担・友人・ファンダムと一緒に盛り上がりたい。" },
    negative: { key: "S", name: "単独 / Solo", description: "自分のペース・解釈・思い出を守って推したい。" },
  },
];

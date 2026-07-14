// アーティストマネジメントAIオフィス — 組織データ（正本）
// 部門とAI社員の定義。ダッシュボードのKPI・部門一覧はこのファイルを基に描画する。
// 追加・変更するときはここを編集する（会話で「◯◯担当を稼働中に」等で更新可）。

export type StaffStatus = "active" | "review" | "training" | "planned";

export const STATUS_LABEL: Record<StaffStatus, string> = {
  active: "稼働中",
  review: "レビュー待ち",
  training: "教育中",
  planned: "入社予定",
};

export const STATUS_DOT: Record<StaffStatus, string> = {
  active: "bg-emerald-400",
  review: "bg-amber-400",
  training: "bg-sky-400",
  planned: "bg-zinc-500",
};

export interface Staff {
  id: string;
  name: string; // 役割名（担当）
  role: string; // 英語ロール
  emoji: string;
  status: StaffStatus;
  level: number; // 1〜5
  outputs: number; // 成果物件数
  logs: number; // ログ件数
  note: string; // 直近のひとこと
}

export interface Department {
  id: string;
  name: string;
  emoji: string;
  accent: string; // Tailwind ring/border 色
  staff: Staff[];
}

export const COMPANY = {
  name: "えりんぎ アーティストマネジメント",
  tagline: "AI社員とともにアーティストを世に広げる事務所",
  owner: "えりんぎさん",
  ownerRole: "代表（あなた）",
  chief: "マカミ",
  chiefRole: "AIオフィス長（Claude Code）",
  artist: "福本大成",
  updated: "2026-07-14",
};

export const DEPARTMENTS: Department[] = [
  {
    id: "hq",
    name: "マネジメント本部",
    emoji: "🧭",
    accent: "emerald",
    staff: [
      {
        id: "manager",
        name: "マネージャー担当",
        role: "artist-manager",
        emoji: "🧑‍💼",
        status: "active",
        level: 4,
        outputs: 12,
        logs: 8,
        note: "今週のスケジュール逆算と日報整理を実施。ライブ準備が山場。",
      },
      {
        id: "assistant",
        name: "スケジュール・進行担当",
        role: "scheduler",
        emoji: "🗓️",
        status: "active",
        level: 3,
        outputs: 6,
        logs: 4,
        note: "リリース〜ライブの締切を逆算し、今日やることを提示。",
      },
    ],
  },
  {
    id: "sns",
    name: "SNSマーケティング部",
    emoji: "📣",
    accent: "fuchsia",
    staff: [
      {
        id: "x",
        name: "X（Twitter）運用担当",
        role: "x-operator",
        emoji: "🐦",
        status: "active",
        level: 4,
        outputs: 20,
        logs: 12,
        note: "投稿案のトーン調整と投稿スケジュール案を提案。",
      },
      {
        id: "instagram",
        name: "Instagram運用担当",
        role: "instagram-operator",
        emoji: "📸",
        status: "review",
        level: 3,
        outputs: 9,
        logs: 5,
        note: "アカウント設計5点の下書きを作成、レビュー待ち。",
      },
      {
        id: "shorts",
        name: "TikTok・ショート動画担当",
        role: "shorts-creator",
        emoji: "🎬",
        status: "training",
        level: 2,
        outputs: 3,
        logs: 2,
        note: "縦型動画の構成テンプレを学習中。",
      },
      {
        id: "fan",
        name: "ファンコミュニケーション担当",
        role: "fan-comms",
        emoji: "💌",
        status: "planned",
        level: 1,
        outputs: 0,
        logs: 0,
        note: "コメント・DM対応方針を設計予定。",
      },
    ],
  },
  {
    id: "web",
    name: "Web・オウンドメディア部",
    emoji: "🌐",
    accent: "sky",
    staff: [
      {
        id: "hp",
        name: "HP制作・運用担当",
        role: "web-engineer",
        emoji: "🛠️",
        status: "active",
        level: 4,
        outputs: 9,
        logs: 7,
        note: "taisei-site を全ページ実装・改善。LIVEページ機能追加済み。",
      },
      {
        id: "news",
        name: "NEWS入稿担当",
        role: "news-editor",
        emoji: "📝",
        status: "active",
        level: 3,
        outputs: 5,
        logs: 3,
        note: "/studio から即日入稿できる運用を用意。",
      },
      {
        id: "seo",
        name: "SEO・アクセス解析担当",
        role: "seo-analyst",
        emoji: "📊",
        status: "review",
        level: 2,
        outputs: 4,
        logs: 2,
        note: "OGP・SEO一式・クリック計測を実装、効果検証待ち。",
      },
    ],
  },
  {
    id: "creative",
    name: "クリエイティブ部",
    emoji: "🎨",
    accent: "orange",
    staff: [
      {
        id: "visual",
        name: "ビジュアル・アー写担当",
        role: "art-director",
        emoji: "🖼️",
        status: "planned",
        level: 1,
        outputs: 0,
        logs: 0,
        note: "アー写・キービジュアルの方針を設計予定。",
      },
      {
        id: "thumb",
        name: "サムネ・バナー担当",
        role: "graphic-designer",
        emoji: "🎟️",
        status: "training",
        level: 2,
        outputs: 2,
        logs: 1,
        note: "OGPシェア画像のテンプレを整備中。",
      },
      {
        id: "copy",
        name: "歌詞・コピー担当",
        role: "copywriter",
        emoji: "✍️",
        status: "planned",
        level: 1,
        outputs: 0,
        logs: 0,
        note: "プロフィール・キャッチコピーの草案を担当予定。",
      },
    ],
  },
  {
    id: "live",
    name: "ライブ・リリース部",
    emoji: "🎤",
    accent: "violet",
    staff: [
      {
        id: "live-ops",
        name: "ライブ・イベント管理担当",
        role: "live-manager",
        emoji: "🎫",
        status: "active",
        level: 3,
        outputs: 5,
        logs: 4,
        note: "LIVEページに受付中まとめ・受付期間・種別タブを反映。",
      },
      {
        id: "release",
        name: "楽曲リリース・配信担当",
        role: "release-manager",
        emoji: "🎧",
        status: "review",
        level: 2,
        outputs: 3,
        logs: 2,
        note: "ディスコグラフィ更新とサブスク導線を整理。",
      },
      {
        id: "goods",
        name: "物販・グッズ担当",
        role: "merch-manager",
        emoji: "🛍️",
        status: "planned",
        level: 1,
        outputs: 0,
        logs: 0,
        note: "グッズ・物販の運用設計を予定。",
      },
    ],
  },
];

// 今月のAIコスト台帳（正本）。実額に合わせて更新する。
export interface CostItem {
  name: string;
  tag: string; // サブスク / 従量 / 無料枠
  amount: number; // 円
  note?: string;
}

export const AI_COST: { total: number; items: CostItem[] } = {
  total: 15600,
  items: [
    { name: "Claude（Claude Code）", tag: "サブスク", amount: 15600, note: "オフィス運用の中枢" },
    { name: "ChatGPT（下書き補助）", tag: "サブスク", amount: 0, note: "必要時のみ" },
    { name: "画像生成（アー写・バナー）", tag: "従量", amount: 0, note: "未稼働" },
    { name: "X API", tag: "無料枠", amount: 0 },
  ],
};

// 集計ヘルパー
export function allStaff(): Staff[] {
  return DEPARTMENTS.flatMap((d) => d.staff);
}

export function kpis() {
  const staff = allStaff();
  const total = staff.length;
  const active = staff.filter((s) => s.status === "active").length;
  const review = staff.filter((s) => s.status === "review").length;
  const training = staff.filter((s) => s.status === "training").length;
  const planned = staff.filter((s) => s.status === "planned").length;
  const outputs = staff.reduce((sum, s) => sum + s.outputs, 0);
  const workingBase = total - planned; // 入社予定を除いた稼働母数
  const rate = workingBase === 0 ? 0 : Math.round((active / workingBase) * 100);
  return { total, active, review, training, planned, outputs, rate };
}

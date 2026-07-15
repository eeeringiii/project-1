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
  artist: "アーティスト名",
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
      {
        id: "casting",
        name: "キャスティング・渉外担当",
        role: "casting-liaison",
        emoji: "🤝",
        status: "planned",
        level: 1,
        outputs: 0,
        logs: 0,
        note: "出演オファーの窓口整理・条件確認フローを設計予定。",
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
        id: "sns-lead",
        name: "SNS運用統括担当",
        role: "sns-lead",
        emoji: "📣",
        status: "active",
        level: 4,
        outputs: 14,
        logs: 9,
        note: "X・Instagram・ショートを横断し、投稿方針とスケジュールを統括。",
      },
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
        id: "youtube",
        name: "YouTube運用担当",
        role: "youtube-operator",
        emoji: "▶️",
        status: "training",
        level: 2,
        outputs: 0,
        logs: 1,
        note: "公式チャンネルの企画テンプレ・投稿頻度・サムネ規格を設計中。",
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
    id: "media",
    name: "メディア・PR部",
    emoji: "📺",
    accent: "rose",
    staff: [
      {
        id: "tv",
        name: "TV・ドラマ/映画出演管理担当",
        role: "media-appearance",
        emoji: "🎥",
        status: "planned",
        level: 1,
        outputs: 0,
        logs: 0,
        note: "出演情報の一元管理と告知スケジュール化を担当予定。",
      },
      {
        id: "radio-mag",
        name: "ラジオ・雑誌・インタビュー担当",
        role: "press-interview",
        emoji: "🎙️",
        status: "planned",
        level: 1,
        outputs: 0,
        logs: 0,
        note: "インタビュー対応履歴と掲載アーカイブを整備予定。",
      },
      {
        id: "pr",
        name: "広報・プレスリリース担当",
        role: "pr-officer",
        emoji: "📰",
        status: "active",
        level: 2,
        outputs: 1,
        logs: 2,
        note: "入社初日に解禁告知テンプレ一式を納品（秘書用/アイデア/2026-07-14_広報_解禁告知テンプレ.md）。",
      },
      {
        id: "tieup",
        name: "タイアップ・広告案件担当",
        role: "brand-partnerships",
        emoji: "🤳",
        status: "planned",
        level: 1,
        outputs: 0,
        logs: 0,
        note: "ブランド案件の管理表と投稿ルール（PR表記等）を設計予定。",
      },
    ],
  },
  {
    id: "fanclub",
    name: "ファンクラブ部",
    emoji: "💖",
    accent: "pink",
    staff: [
      {
        id: "fc-ops",
        name: "FC運営・会員管理担当",
        role: "fanclub-ops",
        emoji: "🪪",
        status: "active",
        level: 2,
        outputs: 1,
        logs: 2,
        note: "入社初日にFC運営設計の初版を納品（秘書用/アイデア/2026-07-14_FC運営設計_初版.md）。",
      },
      {
        id: "fc-content",
        name: "FC限定コンテンツ担当",
        role: "fc-content",
        emoji: "🔒",
        status: "planned",
        level: 1,
        outputs: 0,
        logs: 0,
        note: "会員限定ブログ・動画・ボイスの企画を担当予定。",
      },
      {
        id: "fan-event",
        name: "ファンイベント・生誕企画担当",
        role: "fan-event",
        emoji: "🎂",
        status: "planned",
        level: 1,
        outputs: 0,
        logs: 0,
        note: "FCイベント・バースデー企画・記念日施策を担当予定。",
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
      {
        id: "mv",
        name: "MV・映像企画担当",
        role: "video-director",
        emoji: "🎞️",
        status: "planned",
        level: 1,
        outputs: 0,
        logs: 0,
        note: "MV・ビジュアルコンテンツの企画構成を担当予定。",
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
        status: "active",
        level: 3,
        outputs: 5,
        logs: 3,
        note: "グッズ企画・在庫・物販導線を管理。ライブ・EC販売の運用を担当。",
      },
      {
        id: "ticketing",
        name: "チケッティング・FC先行担当",
        role: "ticketing",
        emoji: "🧾",
        status: "training",
        level: 2,
        outputs: 0,
        logs: 1,
        note: "FC先行→一般発売の受付スケジュール管理を設計中。",
      },
    ],
  },
  {
    id: "admin",
    name: "バックオフィス部",
    emoji: "📁",
    accent: "teal",
    staff: [
      {
        id: "legal",
        name: "権利・契約管理担当",
        role: "rights-legal",
        emoji: "⚖️",
        status: "planned",
        level: 1,
        outputs: 0,
        logs: 0,
        note: "出演契約・楽曲権利・肖像利用の管理台帳を設計予定。",
      },
      {
        id: "finance",
        name: "経理・コスト管理担当",
        role: "finance",
        emoji: "🧮",
        status: "planned",
        level: 1,
        outputs: 0,
        logs: 0,
        note: "AIコスト台帳と案件収支の月次まとめを担当予定。",
      },
      {
        id: "affairs",
        name: "総務・手配担当",
        role: "general-affairs",
        emoji: "🚄",
        status: "planned",
        level: 1,
        outputs: 0,
        logs: 0,
        note: "移動・宿泊・現場備品の手配リストとチェックフローを設計予定。",
      },
      {
        id: "inquiry",
        name: "問い合わせ窓口担当",
        role: "inquiry-desk",
        emoji: "📮",
        status: "planned",
        level: 1,
        outputs: 0,
        logs: 0,
        note: "出演依頼・取材依頼・ファンからの連絡の振り分けルールを設計予定。",
      },
      {
        id: "archive",
        name: "データ・アーカイブ管理担当",
        role: "data-archivist",
        emoji: "🗄️",
        status: "planned",
        level: 1,
        outputs: 0,
        logs: 0,
        note: "素材・出演履歴・成果物のフォルダ規約とバックアップを設計予定。",
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

// スケジュール（正本）。今週・今月・四半期のロードマップ。
export interface ScheduleItem {
  title: string;
  owner: string;
}

export const SCHEDULE: {
  id: string;
  label: string;
  sub: string;
  items: ScheduleItem[];
}[] = [
  {
    id: "week",
    label: "🗓 今週（7/14〜）",
    sub: "直近の山場",
    items: [
      { title: "HP実素材（写真・本文・SNSリンク）の受け渡し", owner: "えりんぎさん → HP担当" },
      { title: "インスタのアカウント設計5点のレビュー・確定", owner: "Instagram担当" },
      { title: "解禁告知テンプレの運用開始（次の解禁から適用）", owner: "広報担当" },
      { title: "載せたい項目の確定（NEWS/PROFILE/LIVE 等）", owner: "えりんぎさん" },
    ],
  },
  {
    id: "month",
    label: "📆 今月（2026年7月）",
    sub: "仕込み",
    items: [
      { title: "FCプラットフォーム比較表（4案）と会費試算", owner: "FC運営担当" },
      { title: "YouTube企画テンプレ・投稿頻度の確定", owner: "YouTube担当" },
      { title: "ドメイン方針の決定（taiseifukumoto.net 継続か）", owner: "えりんぎさん" },
      { title: "AIオフィスのVercel常設URL化", owner: "マカミ" },
    ],
  },
  {
    id: "quarter",
    label: "🎯 四半期（〜9月）",
    sub: "ゴール",
    items: [
      { title: "HPフルリニューアル公開（現行Wix廃止）", owner: "Web部" },
      { title: "FC開設（プラットフォーム決定 → 開設）", owner: "ファンクラブ部" },
      { title: "グッズ・EC販売導線の設計", owner: "物販担当" },
      { title: "SNS→HP→FC/サブスクの導線計測を開始", owner: "SEO・解析担当" },
    ],
  },
];

// 収益の柱（正本）。設計状況と次の一手。
export const REVENUE_PILLARS: {
  name: string;
  status: string;
  next: string;
  owner: string;
}[] = [
  { name: "FC会費", status: "設計中", next: "プラットフォーム比較表 → 会費3案で試算", owner: "FC運営担当" },
  { name: "ライブ・チケット", status: "設計中", next: "FC先行 → 一般発売の受付フロー確定", owner: "チケッティング担当" },
  { name: "グッズ・EC", status: "稼働中", next: "ライブ物販とEC導線の設計", owner: "物販・グッズ担当" },
  { name: "配信・サブスク", status: "整理中", next: "ディスコグラフィからの導線改善", owner: "楽曲リリース担当" },
  { name: "タイアップ・広告", status: "準備前", next: "案件管理表とPR表記ルールの整備", owner: "タイアップ担当" },
];

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

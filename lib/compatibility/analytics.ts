import { CompatibilityScene, OshicoaCode } from './types';

/**
 * 相性診断の計測フック。
 * このサイトにはまだアクセス解析が入っていないため、既定では何もしません。
 * gtag / dataLayer を後から入れた場合は、このファイルを触らなくても自動で送信されます。
 * ※ 推し名などの自由入力値は絶対に渡さないでください。
 */
export type CompatibilityEventName =
  | 'compatibility_view'
  | 'compatibility_type_select'
  | 'compatibility_start'
  | 'compatibility_complete'
  | 'compatibility_share'
  | 'compatibility_copy_url'
  | 'compatibility_retry'
  | 'compatibility_swap'
  | 'compatibility_diagnosis_cta';

export type CompatibilityEventParams = {
  first_type?: OshicoaCode;
  second_type?: OshicoaCode;
  score_range?: string;
  best_scene?: CompatibilityScene;
  slot?: 'me' | 'partner';
  method?: string;
};

type GtagWindow = Window & {
  gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
  dataLayer?: unknown[];
};

/** 80 → "80-89" のような粗いレンジに丸める（個別スコアは送りません） */
export function toScoreRange(score: number): string {
  const floor = Math.floor(score / 10) * 10;
  return `${floor}-${floor + 9}`;
}

export function trackCompatibilityEvent(
  name: CompatibilityEventName,
  params: CompatibilityEventParams = {},
): void {
  if (typeof window === 'undefined') return;
  try {
    const scope = window as GtagWindow;
    if (typeof scope.gtag === 'function') {
      scope.gtag('event', name, params);
      return;
    }
    if (Array.isArray(scope.dataLayer)) {
      scope.dataLayer.push({ event: name, ...params });
    }
  } catch {
    // 計測でアプリを壊さない
  }
}

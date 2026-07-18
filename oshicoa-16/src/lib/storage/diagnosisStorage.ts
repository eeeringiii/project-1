import type { DiagnosisResult, OshiProfile, DiagnosisAnswer } from "@/types";

/**
 * localStorage 永続化ユーティリティ。
 * - バージョンを持たせ、構造変更時は安全に破棄して初期化する。
 * - localStorage が使えない環境（プライベートモード等）でも例外を投げず動作継続する。
 */
export const STORAGE_VERSION = 1;
const STORAGE_KEY = "oshicoa16:v1";

export type PersistedState = {
  version: number;
  state: {
    oshiProfile?: OshiProfile;
    answers?: DiagnosisAnswer[];
    result?: DiagnosisResult;
  };
};

function isStorageAvailable(): boolean {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    const testKey = "__oshicoa_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function loadPersisted(): PersistedState["state"] {
  if (!isStorageAvailable()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed || parsed.version !== STORAGE_VERSION) {
      // バージョン不一致は破棄して初期化。
      window.localStorage.removeItem(STORAGE_KEY);
      return {};
    }
    return parsed.state ?? {};
  } catch {
    return {};
  }
}

export function savePersisted(state: PersistedState["state"]): void {
  if (!isStorageAvailable()) return;
  try {
    const payload: PersistedState = { version: STORAGE_VERSION, state };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // 保存できなくても診断自体は継続できるため握りつぶす。
  }
}

export function clearPersisted(): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}

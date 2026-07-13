import type { Reservation } from "@/lib/reservation";

// 予約データの保管層。既定はプロセス内メモリ実装。
//
// ⚠️ Vercel等のサーバーレス環境ではインスタンスをまたいで揮発するため、
//    本番運用では Vercel KV / Redis / RDB 等の永続ストアに差し替えること。
//    ReservationStore インターフェースを満たす実装を用意し、
//    getStore() を差し替えれば呼び出し側の変更は不要。

export interface ReservationStore {
  upsert(reservation: Reservation): Promise<void>;
  list(): Promise<Reservation[]>;
  get(id: string): Promise<Reservation | undefined>;
}

class MemoryStore implements ReservationStore {
  private map = new Map<string, Reservation>();

  async upsert(reservation: Reservation): Promise<void> {
    this.map.set(reservation.id, reservation);
  }

  async list(): Promise<Reservation[]> {
    // 開始日時の昇順で返す。
    return [...this.map.values()].sort((a, b) => a.startAt.localeCompare(b.startAt));
  }

  async get(id: string): Promise<Reservation | undefined> {
    return this.map.get(id);
  }
}

// 開発時の HMR で複数インスタンスが生成されないよう globalThis に保持する。
const globalForStore = globalThis as unknown as { __lmeStore?: ReservationStore };

export function getStore(): ReservationStore {
  if (!globalForStore.__lmeStore) {
    globalForStore.__lmeStore = new MemoryStore();
  }
  return globalForStore.__lmeStore;
}

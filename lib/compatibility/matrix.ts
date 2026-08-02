import { calculateCompatibility } from './calculateCompatibility';
import { CompatibilityResult, OshicoaCode } from './types';
import { OSHICOA_CODES } from './validation';

export type CompatibilityMatrixStats = {
  min: number;
  max: number;
  average: number;
  median: number;
  /** 「60」「70」…のような10点刻みの件数 */
  buckets: { label: string; count: number }[];
  total: number;
};

/** 16×16の全組み合わせ（開発用の確認とテストで使用） */
export function buildCompatibilityMatrix(): CompatibilityResult[][] {
  return OSHICOA_CODES.map(first =>
    OSHICOA_CODES.map(second => calculateCompatibility(first as OshicoaCode, second as OshicoaCode)),
  );
}

export function summarizeScores(scores: number[]): CompatibilityMatrixStats {
  const sorted = [...scores].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
  const bucketMap = new Map<number, number>();
  sorted.forEach(score => {
    const bucket = Math.floor(score / 10) * 10;
    bucketMap.set(bucket, (bucketMap.get(bucket) ?? 0) + 1);
  });

  return {
    min: sorted[0] ?? 0,
    max: sorted[sorted.length - 1] ?? 0,
    average: Math.round((sorted.reduce((sum, score) => sum + score, 0) / sorted.length) * 10) / 10,
    median,
    buckets: [...bucketMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([bucket, count]) => ({ label: `${bucket}点台`, count })),
    total: sorted.length,
  };
}

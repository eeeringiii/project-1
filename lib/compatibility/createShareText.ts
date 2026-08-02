import { SCENE_LABELS, SCENE_ORDER } from '@/data/compatibility/sceneFit';
import { CompatibilityResult, CompatibilityScene } from './types';

/** Xの目安（日本語は1文字2カウント、URLは23カウントで計算） */
const X_LIMIT = 280;
const URL_WEIGHT = 23;

function weightedLength(text: string): number {
  let total = 0;
  for (const character of text) {
    total += character.charCodeAt(0) > 0x7f ? 2 : 1;
  }
  return total;
}

/** シェア文に載せるシーン（連番→遠征→感想会の順） */
const SHARE_SCENES: CompatibilityScene[] = ['renban', 'expedition', 'afterTalk'];

type ShareTextInput = {
  result: CompatibilityResult;
  /** 相手のタイプ名（既存のタイプデータから渡します） */
  partnerTypeName: string;
  /** 結果URL。空でも組み立てできます */
  url?: string;
};

/**
 * Xシェア用の本文を作る。
 * 長い場合は「シーン3件 → 1件 → 削除 → 改行を減らす」の順に短くしますが、
 * 総合相性・ペア名・#OSHICOA16・結果URLは必ず残します。
 */
export function createShareText({ result, partnerTypeName, url = '' }: ShareTextInput): string {
  const head = `私と「${partnerTypeName}」の推し活相性は${result.overallScore}％！`;
  const pair = `相性タイプは\n「${result.pairTitle}」でした。`;
  const hashTags = '#OSHICOA16\n#推し活相性診断';

  const sceneLine = (scene: CompatibilityScene) => {
    const found = result.scenes.find(item => item.scene === scene);
    return found ? `${SCENE_LABELS[scene]}：${found.score}％` : '';
  };
  const scenesFor = (count: number) =>
    SHARE_SCENES.slice(0, count)
      .map(sceneLine)
      .filter(Boolean)
      .join('\n');

  const urlCost = url ? URL_WEIGHT + 1 : 0;
  const fits = (text: string) => weightedLength(text) + urlCost <= X_LIMIT;

  const candidates = [
    `${head}\n\n${pair}\n\n${scenesFor(3)}\n\n${hashTags}`,
    `${head}\n\n${pair}\n\n${scenesFor(1)}\n\n${hashTags}`,
    `${head}\n\n${pair}\n\n${hashTags}`,
    `${head}\n${pair.replace('\n', '')}\n${hashTags.replace('\n', ' ')}`,
  ];

  return candidates.find(fits) ?? candidates[candidates.length - 1];
}

/** Web Share API / コピー用の短い説明文 */
export const SHARE_TITLE = 'OSHICOA 16 相性診断';

/** 結果URLを組み立てる（個人情報は絶対に含めません） */
export function createShareUrl(origin: string, result: CompatibilityResult): string {
  const base = origin ? `${origin}/compatibility` : '/compatibility';
  return `${base}?me=${result.firstType}&partner=${result.secondType}`;
}

/** 開発用：シェア文に載るシーンの並び */
export const SHARE_SCENE_ORDER = SCENE_ORDER;

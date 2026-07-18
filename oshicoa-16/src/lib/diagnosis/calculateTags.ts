import type { DiagnosisAnswer, OtakuTag, TagId } from "@/types";
import { questionMap } from "@/data/questions";
import { tags, tagMap } from "@/data/tags";

type TagScore = { id: TagId; score: number; strong: number };

/**
 * 回答傾向から業タグのスコアを算出し、上位1〜2件を返す。
 * - 単一質問ではなく複数回答の組み合わせで加点する（positiveな回答のみタグに加算）。
 * - threshold 以上のタグを候補にし、同点は強い回答(±3)の寄与が多い方を優先。
 * - 候補が無い場合でも、必ず上位2件を返すフォールバックを備える。
 */
export function calculateTags(answers: DiagnosisAnswer[]): OtakuTag[] {
  const scores = new Map<TagId, TagScore>();

  for (const answer of answers) {
    const question = questionMap[answer.questionId];
    if (!question?.tagWeights) continue;
    // 「当てはまる」方向（正の回答）のみタグへ加点する。
    if (answer.value <= 0) continue;
    for (const [tagId, weight] of Object.entries(question.tagWeights)) {
      if (!weight) continue;
      const current = scores.get(tagId) ?? { id: tagId, score: 0, strong: 0 };
      current.score += weight * answer.value;
      if (answer.value === 3) current.strong += weight;
      scores.set(tagId, current);
    }
  }

  const ranked = [...scores.values()].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.strong !== a.strong) return b.strong - a.strong;
    return a.id.localeCompare(b.id); // 完全同点は決定的に
  });

  const overThreshold = ranked.filter((t) => {
    const tag = tagMap[t.id];
    return tag && t.score >= tag.threshold;
  });

  const chosen = (overThreshold.length > 0 ? overThreshold : ranked).slice(0, 2);

  const result = chosen
    .map((t) => tagMap[t.id])
    .filter((t): t is OtakuTag => Boolean(t));

  // フォールバック: どのタグも付かない場合はデータ先頭から補完し、必ず提示する。
  if (result.length === 0) return tags.slice(0, 2);
  return result;
}

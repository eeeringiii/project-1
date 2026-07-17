"use client";

/**
 * AI生成 API のクライアント。
 * サーバー(/api/generate)へ元情報とブランドルールを送り、生成結果を受け取る。
 * APIキーはサーバー側でのみ扱うため、ここには一切含まれない。
 */
import type { BrandRule, ContentSource, Platform } from "@/types/domain";
import type { GeneratedDraft } from "./ai-generation";

export interface GenerateMeta {
  model: string | null;
  usedMock: boolean;
  durationMs: number;
}

export interface GenerateResult {
  posts: GeneratedDraft[];
  meta: GenerateMeta;
}

interface GenerateOptions {
  platforms?: Platform[];
  only?: { platform: Platform; postType: string };
}

export async function generateDrafts(
  source: ContentSource,
  rules: BrandRule[],
  opts: GenerateOptions = {},
): Promise<GenerateResult> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: {
        id: source.id,
        artistId: source.artistId,
        campaignId: source.campaignId,
        title: source.title,
        sourceText: source.sourceText,
        purpose: source.purpose,
        relatedUrl: source.relatedUrl,
        embargoAt: source.embargoAt,
        eventAt: source.eventAt,
        venueName: source.venueName,
        productName: source.productName,
        productPrice: source.productPrice,
        notes: source.notes,
        aiInstruction: source.aiInstruction,
        requiresArtistApproval: source.requiresArtistApproval,
        targetPlatforms: source.targetPlatforms,
      },
      rules: rules
        .filter((r) => r.isActive)
        .map((r) => ({
          id: r.id,
          artistId: r.artistId,
          ruleType: r.ruleType,
          ruleName: r.ruleName,
          ruleValue: r.ruleValue,
          platform: r.platform,
          isActive: r.isActive,
        })),
      platforms: opts.platforms,
      only: opts.only,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `生成に失敗しました (HTTP ${res.status})`);
  }
  return (await res.json()) as GenerateResult;
}

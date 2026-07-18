"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ChartMetricId, OshicoaType, OtakuTag, RelationshipPhase, TypeCode } from "@/types";
import { useDiagnosisStore } from "@/stores/diagnosisStore";
import { getBestMatch } from "@/data/compatibility";
import { phases } from "@/data/phases";
import { trackEvent } from "@/lib/analytics";
import ResultHero from "@/components/result/ResultHero";
import ResultSummary from "@/components/result/ResultSummary";
import RadarChart from "@/components/charts/RadarChart";
import OtakuTagList from "@/components/result/OtakuTagList";
import RelationshipPhaseCard from "@/components/result/RelationshipPhaseCard";
import CompatibilityCard from "@/components/result/CompatibilityCard";
import PremiumCta from "@/components/result/PremiumCta";
import ShareButtons from "@/components/share/ShareButtons";

export default function ResultView({ type }: { type: OshicoaType }) {
  const router = useRouter();
  const hydrate = useDiagnosisStore((s) => s.hydrate);
  const hasHydrated = useDiagnosisStore((s) => s.hasHydrated);
  const storeResult = useDiagnosisStore((s) => s.result);
  const restartSameOshi = useDiagnosisStore((s) => s.restartSameOshi);
  const restartNewOshi = useDiagnosisStore((s) => s.restartNewOshi);
  const resetAll = useDiagnosisStore((s) => s.resetAll);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    trackEvent("result_viewed", { typeCode: type.code });
  }, [type.code]);

  const diagnosed = Boolean(storeResult && storeResult.typeCode === (type.code as TypeCode));

  const tags: OtakuTag[] = diagnosed ? storeResult!.tags : [];
  const chartScores: Record<ChartMetricId, number> = diagnosed
    ? storeResult!.chartScores
    : type.chartBaseValues;
  const phase: RelationshipPhase = diagnosed ? storeResult!.phase : phases[0];
  const oshiName = diagnosed ? storeResult!.oshiProfile?.oshiName : undefined;

  const best = useMemo(() => getBestMatch(type.code), [type.code]);

  const restart = (mode: "same" | "new" | "reset") => {
    trackEvent("diagnosis_restarted", { mode });
    if (mode === "same") {
      restartSameOshi();
      router.push("/diagnosis/questions");
    } else if (mode === "new") {
      restartNewOshi();
      router.push("/diagnosis");
    } else {
      resetAll();
      router.push("/");
    }
  };

  return (
    <div className="container-x py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        {hasHydrated && !diagnosed && (
          <div className="panel-hair flex flex-col gap-3 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-text-sub">
              これは <span className="text-text">{type.name}</span> の基本結果です。24問の診断で、あなた自身の業タグ・関係フェーズ・能力値が分かります。
            </p>
            <Link href="/diagnosis" className="btn btn-primary shrink-0 !py-2 !px-4 text-sm">
              自分を診断する
            </Link>
          </div>
        )}

        <ResultHero type={type} tags={tags} oshiName={oshiName} undiagnosed={!diagnosed} />

        <ShareButtons type={type} tags={tags} chartScores={chartScores} oshiName={oshiName} />

        {/* レーダーチャート */}
        <section className="panel p-6">
          <p className="type-code text-xs text-violet mb-4">ABILITY</p>
          <div className="mx-auto max-w-sm">
            <RadarChart values={chartScores} size={340} />
          </div>
          {!diagnosed && (
            <p className="mt-3 text-center text-xs text-text-muted">
              ※ 診断前はタイプの基準値を表示しています。回答するとあなた個人の値になります。
            </p>
          )}
        </section>

        {/* 業タグ */}
        <section className="panel p-6">
          <p className="type-code text-xs text-magenta mb-4">OTAKU KARMA</p>
          {diagnosed ? (
            <OtakuTagList tags={tags} showDescription />
          ) : (
            <p className="text-sm text-text-muted">
              あなたの業タグは、24問の診断で判定されます。
            </p>
          )}
        </section>

        <ResultSummary type={type} />

        <RelationshipPhaseCard phase={phase} undiagnosed={!diagnosed} />

        <CompatibilityCard bestType={best.type} description={best.description} />

        <PremiumCta type={type} oshiName={oshiName} />

        {/* 再診断・導線 */}
        <section className="panel p-6">
          <p className="type-code text-xs text-violet mb-4">AGAIN</p>
          <div className="flex flex-col gap-3">
            <button type="button" onClick={() => restart("same")} className="btn btn-ghost text-sm">
              同じ推しでもう一度診断する
            </button>
            <button type="button" onClick={() => restart("new")} className="btn btn-ghost text-sm">
              別の推しで診断する
            </button>
            <button type="button" onClick={() => restart("reset")} className="btn btn-ghost text-sm">
              すべてリセットする
            </button>
          </div>
        </section>

        <div className="text-center">
          <Link href="/types" className="text-sm text-violet hover:underline">
            16タイプの一覧を見る →
          </Link>
        </div>
      </div>
    </div>
  );
}

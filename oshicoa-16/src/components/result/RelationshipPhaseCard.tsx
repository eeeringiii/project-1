import type { RelationshipPhase } from "@/types";

export default function RelationshipPhaseCard({
  phase,
  undiagnosed = false,
}: {
  phase: RelationshipPhase;
  undiagnosed?: boolean;
}) {
  return (
    <div className="panel edge-glow p-6">
      <p className="type-code text-xs text-violet mb-2">RELATIONSHIP PHASE</p>
      {undiagnosed ? (
        <p className="text-sm text-text-muted">
          現在の関係フェーズは、診断（24問への回答）で判定されます。
        </p>
      ) : (
        <>
          <p className="text-sm text-text-sub">現在のあなたは、このフェーズに近いようです。</p>
          <h3 className="mt-2 font-display text-xl font-bold text-gradient">{phase.name}</h3>
          <p className="mt-3 text-sm text-text-sub leading-relaxed">{phase.description}</p>
          <p className="mt-4 rounded-lg border border-line bg-[rgba(139,92,246,0.06)] p-3 text-sm text-text-sub leading-relaxed">
            {phase.advice}
          </p>
        </>
      )}
    </div>
  );
}

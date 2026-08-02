'use client';

import { AXIS_DESCRIPTIONS, AXIS_LABELS } from '@/data/compatibility/pairFit';
import { CompatibilityResult as CompatibilityResultData } from '@/lib/compatibility/types';
import { CompatibilityScore } from './CompatibilityScore';
import { CompatibilityShare } from './CompatibilityShare';
import { FrictionCard, StrengthCard } from './NoteCards';
import { PairTypeHeader } from './PairTypeHeader';
import { SceneScoreCard } from './SceneScoreCard';

export function CompatibilityResultView({
  result,
  onSwap,
  onRetry,
  onShare,
  onCopy,
}: {
  result: CompatibilityResultData;
  onSwap: () => void;
  onRetry: () => void;
  onShare: (method: string) => void;
  onCopy: () => void;
}) {
  return (
    <div className="compatResult">
      <PairTypeHeader meCode={result.firstType} partnerCode={result.secondType} />

      <CompatibilityScore score={result.overallScore} rank={result.rank} pairTitle={result.pairTitle} />

      <section className="compatBlock" aria-labelledby="compat-summary-heading">
        <h2 id="compat-summary-heading" className="compatBlockTitle">
          2人の総評
        </h2>
        <p className="compatSummary">{result.summary}</p>
        <ul className="compatAxisList">
          {result.axisResults.map(axis => (
            <li key={axis.axis} className={axis.isMatch ? 'isMatch' : ''}>
              <b>{AXIS_LABELS[axis.axis]}</b>
              <span className="compatAxisPair">
                {axis.firstLetter} × {axis.secondLetter}
              </span>
              <span className="compatAxisState">{axis.isMatch ? '同じ' : '違う'}</span>
              <span className="srOnly">{AXIS_DESCRIPTIONS[axis.axis]}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="compatBlock" aria-labelledby="compat-strength-heading">
        <h2 id="compat-strength-heading" className="compatBlockTitle">
          2人の強み
        </h2>
        <div className="compatNoteGrid">
          {result.strengths.map((note, index) => (
            <StrengthCard key={note.axis} note={note} index={index} />
          ))}
        </div>
      </section>

      <section className="compatBlock" aria-labelledby="compat-friction-heading">
        <h2 id="compat-friction-heading" className="compatBlockTitle">
          ここだけ要すり合わせ
        </h2>
        <FrictionCard note={result.friction} />
      </section>

      <section className="compatBlock" aria-labelledby="compat-tips-heading">
        <h2 id="compat-tips-heading" className="compatBlockTitle">
          この2人の取扱説明書
        </h2>
        <ul className="compatTips">
          {result.tips.map(tip => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <section className="compatBlock" aria-labelledby="compat-scene-heading">
        <h2 id="compat-scene-heading" className="compatBlockTitle">
          シーン別の相性
        </h2>
        <p className="lead compatBlockLead">
          連番相性・遠征相性・感想会相性・グッズ交換相性・応援企画相性を、それぞれ別の基準で解析しています。
        </p>
        <div className="compatSceneGrid">
          {result.scenes.map(scene => (
            <SceneScoreCard key={scene.scene} scene={scene} isBest={scene.scene === result.bestScene} />
          ))}
        </div>
      </section>

      <section className="compatBlock" aria-labelledby="compat-share-heading">
        <h2 id="compat-share-heading" className="compatBlockTitle">
          結果をシェアする
        </h2>
        <CompatibilityShare result={result} onShare={onShare} onCopy={onCopy} />
        <div className="shareRow compatActions">
          <button type="button" className="button ghost" onClick={onSwap}>
            2人を入れ替える
          </button>
          <button type="button" className="button ghost" onClick={onRetry}>
            別の2人で診断する
          </button>
        </div>
      </section>
    </div>
  );
}

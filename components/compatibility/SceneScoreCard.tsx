'use client';

import { SCENE_ICONS, SCENE_LABELS } from '@/data/compatibility/sceneFit';
import { SceneCompatibilityResult } from '@/lib/compatibility/types';

/** シーン別相性カード。星は色ではなく数と文言でも意味が伝わるようにしています */
export function SceneScoreCard({
  scene,
  isBest,
}: {
  scene: SceneCompatibilityResult;
  isBest: boolean;
}) {
  const label = SCENE_LABELS[scene.scene];

  return (
    <article className={`compatScene ${isBest ? 'isBest' : ''}`}>
      {isBest && <span className="compatBestBadge">BEST MATCH</span>}
      <p className="compatSceneHead">
        <span className="compatSceneIcon" aria-hidden>
          {SCENE_ICONS[scene.scene]}
        </span>
        <span className="compatSceneName">{label}</span>
      </p>
      <p className="compatSceneScore">
        {scene.score}
        <i>%</i>
      </p>
      <p className="compatSceneStars">
        <span aria-hidden>
          {'★'.repeat(scene.level.stars)}
          {'☆'.repeat(5 - scene.level.stars)}
        </span>
        <b>{scene.level.label}</b>
      </p>
      <p className="srOnly">
        {label}の相性は{scene.score}パーセント、5段階中{scene.level.stars}、{scene.level.label}です。
      </p>
      <p className="compatSceneComment">{scene.comment}</p>
    </article>
  );
}

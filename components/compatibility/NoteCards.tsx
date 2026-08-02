'use client';

import { AXIS_LABELS } from '@/data/compatibility/pairFit';
import { CompatibilityNote } from '@/lib/compatibility/types';

/** 2人の強み（相性値が高い2軸から） */
export function StrengthCard({ note, index }: { note: CompatibilityNote; index: number }) {
  return (
    <article className="compatNote strength">
      <span className="compatNoteNum" aria-hidden>
        {index + 1}
      </span>
      <p className="compatNoteAxis">{AXIS_LABELS[note.axis]}</p>
      <h3 className="compatNoteTitle">{note.title}</h3>
      <p className="compatNoteText">{note.description}</p>
    </article>
  );
}

/** すれ違いやすいポイント（否定ではなく「すり合わせ」として見せる） */
export function FrictionCard({ note }: { note: CompatibilityNote }) {
  return (
    <article className="compatNote friction">
      <span className="compatNoteNum" aria-hidden>
        ⚖️
      </span>
      <p className="compatNoteAxis">{AXIS_LABELS[note.axis]}</p>
      <h3 className="compatNoteTitle">{note.title}</h3>
      <p className="compatNoteText">{note.description}</p>
    </article>
  );
}

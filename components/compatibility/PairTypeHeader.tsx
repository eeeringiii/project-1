'use client';

import Link from 'next/link';
import { getType } from '@/data/types';
import { TypeCode } from '@/types';
import { TypeAvatar } from './TypeAvatar';

function PairSide({ code, label }: { code: TypeCode; label: string }) {
  const type = getType(code);
  if (!type) return null;

  return (
    <div className="compatPairSide">
      <span className="compatSlotLabel">{label}</span>
      <TypeAvatar code={type.code} />
      <span className="compatSlotCode">{type.code}</span>
      <h2 className="compatPairName">{type.name}</h2>
      <p className="compatSlotCatch">{type.catchphrase}</p>
      <Link className="compatPairLink" href={`/types/${type.code}`}>
        タイプ詳細を見る →
      </Link>
    </div>
  );
}

export function PairTypeHeader({ meCode, partnerCode }: { meCode: TypeCode; partnerCode: TypeCode }) {
  return (
    <section className="compatPairHeader" aria-label="診断した2人のタイプ">
      <PairSide code={meCode} label="あなた" />
      <span className="compatCross big" aria-hidden>
        ×
      </span>
      <PairSide code={partnerCode} label="相手" />
    </section>
  );
}

'use client';

import Link from 'next/link';
import { getType } from '@/data/types';
import { TypeCode } from '@/types';
import { TypeAvatar } from './TypeAvatar';

type SlotKey = 'me' | 'partner';

function TypeSlot({
  label,
  code,
  onOpen,
  buttonRef,
}: {
  label: string;
  code?: TypeCode;
  onOpen: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const type = code ? getType(code) : undefined;

  return (
    <button type="button" className={`compatSlot ${type ? '' : 'isEmpty'}`} onClick={onOpen} ref={buttonRef}>
      <span className="compatSlotLabel">{label}</span>
      {type ? (
        <>
          <TypeAvatar code={type.code} />
          <span className="compatSlotCode">{type.code}</span>
          <span className="compatSlotName">{type.name}</span>
          <span className="compatSlotCatch">{type.catchphrase}</span>
          <span className="compatSlotAction">タイプを変更する</span>
        </>
      ) : (
        <>
          <span className="compatSlotPlus" aria-hidden>
            ＋
          </span>
          <span className="compatSlotName">タイプを選ぶ</span>
          <span className="compatSlotCatch">16タイプから選択できます</span>
        </>
      )}
    </button>
  );
}

export function CompatibilitySelector({
  meCode,
  partnerCode,
  onOpenSlot,
  onAnalyze,
  hasSavedType,
  meButtonRef,
  partnerButtonRef,
  onDiagnosisCta,
}: {
  meCode?: TypeCode;
  partnerCode?: TypeCode;
  onOpenSlot: (slot: SlotKey) => void;
  onAnalyze: () => void;
  hasSavedType: boolean;
  meButtonRef: React.RefObject<HTMLButtonElement | null>;
  partnerButtonRef: React.RefObject<HTMLButtonElement | null>;
  onDiagnosisCta: () => void;
}) {
  const ready = Boolean(meCode && partnerCode);

  return (
    <div className="compatSelector">
      <div className="compatPickRow">
        <TypeSlot label="あなたのタイプ" code={meCode} onOpen={() => onOpenSlot('me')} buttonRef={meButtonRef} />
        <span className="compatCross" aria-hidden>
          ×
        </span>
        <TypeSlot
          label="相手のタイプ"
          code={partnerCode}
          onOpen={() => onOpenSlot('partner')}
          buttonRef={partnerButtonRef}
        />
      </div>

      <button type="button" className="button compatAnalyze" disabled={!ready} onClick={onAnalyze}>
        2人の相性を解析する
      </button>
      {!ready && (
        <p className="note compatHint">
          <span>2人のタイプを選ぶと解析できます</span>
        </p>
      )}

      {hasSavedType ? (
        <p className="note compatHint">
          <span>💾 前回の診断結果から「あなたのタイプ」を入れています</span>
          <span>🔒 選んだタイプは端末の外に送信しません</span>
        </p>
      ) : (
        <div className="formCard compatCtaCard">
          <p className="compatCtaTitle">自分のタイプがわからない方</p>
          <p className="lead" style={{ margin: '0 0 16px' }}>
            24問・約3分のヲタク生態診断で、あなたの推し方タイプがわかります。診断結果はこの端末に保存され、次からは自動で入ります。
          </p>
          <Link className="button" href="/diagnosis" onClick={onDiagnosisCta}>
            まずは24問の診断を受ける →
          </Link>
        </div>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from '@/app/hooks/useReducedMotion';
import { getType } from '@/data/types';
import {
  calculateCompatibility,
  normalizeCodeParam,
  readTypeCodeFromUnknown,
  toScoreRange,
  trackCompatibilityEvent,
} from '@/lib/compatibility';
import { OshicoaCode } from '@/lib/compatibility/types';
import { useDiagnosisStore } from '@/stores/diagnosis';
import { CompatibilityLoading } from './CompatibilityLoading';
import { CompatibilityResultView } from './CompatibilityResult';
import { CompatibilitySelector } from './CompatibilitySelector';
import { TypeSelectModal } from './TypeSelectModal';

type SlotKey = 'me' | 'partner';

const ANALYZE_DURATION = 720;

const buildHref = (me?: OshicoaCode, partner?: OshicoaCode) => {
  const params = new URLSearchParams();
  if (me) params.set('me', me);
  if (partner) params.set('partner', partner);
  const query = params.toString();
  return query ? `/compatibility?${query}` : '/compatibility';
};

export default function CompatibilityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { result: storedResult } = useDiagnosisStore();

  // 保存済みの診断結果は壊れている可能性もあるので、必ず検証してから使う
  const savedCode = readTypeCodeFromUnknown(storedResult);

  // 同じパラメータが複数ある場合は、最初の有効な値を採用する
  const urlMe = normalizeCodeParam(searchParams.getAll('me'));
  const urlPartner = normalizeCodeParam(searchParams.getAll('partner'));

  // 画面で選んでいるタイプ。URLの値を最優先し、なければ手動選択・保存済みの順で使う
  const [meChoice, setMeChoice] = useState<OshicoaCode | undefined>();
  const [partnerChoice, setPartnerChoice] = useState<OshicoaCode | undefined>();
  const [openSlot, setOpenSlot] = useState<SlotKey | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const reducedMotion = useReducedMotion();

  // URLが変わったら（解析・入れ替え・ブラウザバック）、手動選択と演出をリセットする
  const urlKey = `${urlMe ?? ''}|${urlPartner ?? ''}`;
  const [lastUrlKey, setLastUrlKey] = useState(urlKey);
  if (lastUrlKey !== urlKey) {
    setLastUrlKey(urlKey);
    setMeChoice(undefined);
    setPartnerChoice(undefined);
    setAnalyzing(false);
  }

  // 手動で選び直した値がいちばん優先（URLが変わると上のリセットで消えます）
  const meCode = meChoice ?? urlMe ?? savedCode;
  const partnerCode = partnerChoice ?? urlPartner;

  const meButtonRef = useRef<HTMLButtonElement>(null);
  const partnerButtonRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<number | null>(null);

  // 解析演出のタイマーは、離脱時に必ず解除する
  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const result = useMemo(
    () => (urlMe && urlPartner ? calculateCompatibility(urlMe, urlPartner) : undefined),
    [urlMe, urlPartner],
  );

  useEffect(() => {
    trackCompatibilityEvent('compatibility_view');
  }, []);

  useEffect(() => {
    if (!result) return;
    trackCompatibilityEvent('compatibility_complete', {
      first_type: result.firstType,
      second_type: result.secondType,
      score_range: toScoreRange(result.overallScore),
      best_scene: result.bestScene,
    });
  }, [result]);

  const closeModal = useCallback(() => {
    const slot = openSlot;
    setOpenSlot(null);
    // モーダルを開いたボタンへフォーカスを戻す
    window.setTimeout(() => {
      if (slot === 'me') meButtonRef.current?.focus();
      if (slot === 'partner') partnerButtonRef.current?.focus();
    }, 0);
  }, [openSlot]);

  const selectType = useCallback(
    (code: OshicoaCode) => {
      if (openSlot === 'me') setMeChoice(code);
      if (openSlot === 'partner') setPartnerChoice(code);
      trackCompatibilityEvent('compatibility_type_select', {
        slot: openSlot ?? undefined,
        first_type: code,
      });
      closeModal();
    },
    [closeModal, openSlot],
  );

  const analyze = useCallback(() => {
    if (!meCode || !partnerCode) return;
    trackCompatibilityEvent('compatibility_start', { first_type: meCode, second_type: partnerCode });
    setAnalyzing(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(
      () => {
        router.push(buildHref(meCode, partnerCode));
      },
      reducedMotion ? 0 : ANALYZE_DURATION,
    );
  }, [meCode, partnerCode, reducedMotion, router]);

  const swap = useCallback(() => {
    if (!result) return;
    trackCompatibilityEvent('compatibility_swap', {
      first_type: result.firstType,
      second_type: result.secondType,
    });
    // 履歴が増えすぎないように、入れ替えは replace で行う
    router.replace(buildHref(result.secondType, result.firstType), { scroll: false });
  }, [result, router]);

  const retry = useCallback(() => {
    trackCompatibilityEvent('compatibility_retry', { first_type: meCode, second_type: partnerCode });
    // 自分のタイプは残し、相手だけリセットして選択画面へ戻す
    router.push(buildHref(meCode));
  }, [meCode, partnerCode, router]);

  const onShare = useCallback(
    (method: string) => {
      if (!result) return;
      trackCompatibilityEvent('compatibility_share', {
        method,
        first_type: result.firstType,
        second_type: result.secondType,
        score_range: toScoreRange(result.overallScore),
        best_scene: result.bestScene,
      });
    },
    [result],
  );

  const onCopy = useCallback(() => {
    if (!result) return;
    trackCompatibilityEvent('compatibility_copy_url', {
      first_type: result.firstType,
      second_type: result.secondType,
    });
  }, [result]);

  const modalTitle = openSlot === 'partner' ? '相手のタイプを選ぶ' : 'あなたのタイプを選ぶ';
  const selectedInModal = openSlot === 'partner' ? partnerCode : meCode;

  return (
    <main className="shell compatPage">
      <header className="compatHead">
        <p className="eyebrow">COMPATIBILITY</p>
        {result ? (
          <>
            <h1>
              {getType(result.firstType)?.name} × {getType(result.secondType)?.name}
            </h1>
            <p className="lead">
              2人のOSHICOAタイプから、連番・遠征・感想会・グッズ交換・応援企画の相性を解析しました。
            </p>
          </>
        ) : (
          <>
            <h1>
              あの人と推したら、
              <br />
              どんな関係になる？
            </h1>
            <p className="lead">
              2人のOSHICOAタイプから、
              <br />
              連番・遠征・感想会・交換・応援企画の相性を解析します。
            </p>
          </>
        )}
      </header>

      {analyzing ? (
        <CompatibilityLoading reducedMotion={reducedMotion} />
      ) : result ? (
        <CompatibilityResultView
          result={result}
          onSwap={swap}
          onRetry={retry}
          onShare={onShare}
          onCopy={onCopy}
        />
      ) : (
        <CompatibilitySelector
          meCode={meCode}
          partnerCode={partnerCode}
          onOpenSlot={setOpenSlot}
          onAnalyze={analyze}
          hasSavedType={Boolean(savedCode)}
          meButtonRef={meButtonRef}
          partnerButtonRef={partnerButtonRef}
          onDiagnosisCta={() => trackCompatibilityEvent('compatibility_diagnosis_cta')}
        />
      )}

      <section className="compatAbout">
        <h2>推し活相性診断について</h2>
        <p>
          OSHICOA 16の推し活相性診断は、オタク相性診断としてよくある「相性が良い・悪い」の二択では判定しません。
          同じ推し活タイプ同士の「似ているから分かり合える相性」と、違うタイプ同士の「役割を補い合える相性」の両方を見ています。
        </p>
        <p>
          同担相性はもちろん、連番相性・遠征・感想会・グッズ交換・応援企画まで、場面ごとに得意な組み合わせは変わります。
          スコアが控えめなシーンは、相性が悪いのではなく「先にすり合わせておくと快適になる場面」「別行動もおすすめの場面」として読んでください。
        </p>
        <p className="compatAboutLinks">
          <Link href="/types">16タイプを見る</Link>
          <Link href="/diagnosis">自分のタイプを診断する</Link>
          <Link href="/about">診断について</Link>
        </p>
      </section>

      {openSlot !== null && (
        <TypeSelectModal
          title={modalTitle}
          selectedCode={selectedInModal}
          onSelect={selectType}
          onClose={closeModal}
        />
      )}
    </main>
  );
}

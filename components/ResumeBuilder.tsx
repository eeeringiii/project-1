'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { profileSelects } from '@/data/profile';
import { ResumeInput, resumeFields, resumeFilledCount, resumeTotalFields } from '@/data/resume';
import { getType } from '@/data/types';
import { downloadSvgAsPng } from '@/lib/download-svg';
import { useDiagnosisStore } from '@/stores/diagnosis';
import { RESUME_CARD_HEIGHT, RESUME_CARD_WIDTH, ResumeCard } from '@/components/ResumeCard';

// 共有URLに必要な origin はブラウザでしか分からない。SSRと出し分けるとハイドレーションが
// ズレるため、FortuneShare / BingoCard と同じ useSyncExternalStore で読む。
const subscribe = () => () => {};
const getOrigin = () => location.origin;
const getServerOrigin = () => '';

/**
 * ヲタク履歴書の作成画面。入力するとその場でカードに反映され、PNGで保存できる。
 *
 * 入力内容はサーバーへ送らない。診断済みならこの端末に保存された推しプロフィールを
 * 初期値として引き継ぎ、診断で出たタイプもカードに載せる（診断の「出口」になる）。
 */
export function ResumeBuilder() {
  const { profile, result } = useDiagnosisStore();
  // 保持するのは「ユーザーが実際に触った項目」だけ。診断で入れた推しプロフィールは
  // 下の input で既定値として重ねる。状態を同期するエフェクトを持たずに済むので、
  // ストアが localStorage を読み終えた時点の再描画にも自然に追従する。
  const [edits, setEdits] = useState<ResumeInput>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const cardRef = useRef<SVGSVGElement>(null);

  const origin = useSyncExternalStore(subscribe, getOrigin, getServerOrigin);
  const type = result ? getType(result.typeCode) : undefined;

  const prefilled = Boolean(profile.name || profile.genre || profile.duration || profile.frequency);
  const input: ResumeInput = {
    oshiName: profile.name,
    genre: profile.genre,
    duration: profile.duration,
    frequency: profile.frequency,
    ...edits, // 触った項目だけ上書き（空にした場合も「空のまま」が残る）
  };

  const set = (key: string, value: string) => setEdits(current => ({ ...current, [key]: value }));

  const save = async () => {
    setSaving(true);
    setSaveError(false);
    try {
      await downloadSvgAsPng(cardRef.current, RESUME_CARD_WIDTH, RESUME_CARD_HEIGHT, 'oshicoa16_resume.png');
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  const filled = resumeFilledCount(input);
  const url = origin ? `${origin}/resume` : '';
  const text = `推し活のプロフィールを「ヲタク履歴書」にまとめました。${type ? `\nヲタク生態は「${type.code}｜${type.name}」。` : ''}\n\nあなたも作ってみて。\n#OSHICOA16 #ヲタク履歴書`;

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); alert('URLをコピーしました'); }
    catch { prompt('このURLをコピーしてください', url); }
  };

  return (
    <div className="resumeLayout">
      <div className="resumeForm">
        <p className="eyebrow">INPUT</p>
        <h2>書けるところだけで大丈夫</h2>
        <p className="resumeMeta">
          <span>{filled} / {resumeTotalFields} 項目</span>
          {prefilled && <span>診断の入力を引き継ぎました</span>}
        </p>

        <div className="formCard">
          <div className="field">
            <label htmlFor="resume-displayName">ヲタクネーム</label>
            <input
              id="resume-displayName"
              maxLength={16}
              value={input.displayName ?? ''}
              onChange={e => set('displayName', e.target.value)}
              placeholder="表示名・ハンドルネーム"
            />
          </div>
          <div className="field">
            <label htmlFor="resume-oshiName">推しの名前</label>
            <input
              id="resume-oshiName"
              maxLength={24}
              value={input.oshiName ?? ''}
              onChange={e => set('oshiName', e.target.value)}
              placeholder="〇〇くん、〇〇ちゃん、〇〇さん"
            />
          </div>
          {profileSelects.map(([key, label, values]) => (
            <div className="field" key={key}>
              <label htmlFor={`resume-${key}`}>{label}</label>
              <select id={`resume-${key}`} value={input[key] ?? ''} onChange={e => set(key, e.target.value)}>
                <option value="">選択しない</option>
                {values.map(value => <option key={value}>{value}</option>)}
              </select>
            </div>
          ))}
          {resumeFields.map(field => (
            <div className="field" key={field.key}>
              <label htmlFor={`resume-${field.key}`}>{field.label}</label>
              <textarea
                id={`resume-${field.key}`}
                rows={2}
                maxLength={field.maxLength}
                value={input[field.key] ?? ''}
                onChange={e => set(field.key, e.target.value)}
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </div>

        <p className="resumeHint">
          すべて任意です。入力内容はこの端末の中だけで処理され、サーバーには送りません。
          {!type && <> 先に<Link href="/diagnosis">診断</Link>すると、ヲタク生態もカードに載ります。</>}
        </p>
      </div>

      <div className="resumePreview">
        <p className="eyebrow">PREVIEW</p>
        <h2>できあがり</h2>
        <ResumeCard ref={cardRef} input={input} type={type} className="resumeCardArt" />

        <div className="shareRow resumeActions">
          <button className="button" onClick={save} disabled={saving}>
            {saving ? '書き出し中…' : '画像として保存'}
          </button>
          <a
            className="button ghost"
            target="_blank"
            rel="noreferrer"
            href={`https://x.com/intent/post?text=${encodeURIComponent(`${text} ${url}`)}`}
          >
            Xでシェア
          </a>
          <button className="button ghost" onClick={copy}>URLをコピー</button>
        </div>
        {saveError && <p className="resumeError" role="alert">画像の書き出しに失敗しました。もう一度おためしください。</p>}
      </div>
    </div>
  );
}

'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  BINGO_CENTER, BINGO_FREE_TEXT, bingoRankFor, buildBingoCard, countBingoLines,
} from '@/data/bingo';

// 共有URLには絶対URLが必要だが、origin はブラウザでしか分からない。
// SSRとクライアントで直接出し分けるとハイドレーションがズレるため、
// FortuneShare / stores/diagnosis.ts と同じ useSyncExternalStore で読む。
const subscribe = () => () => {};
const getOrigin = () => location.origin;
const getServerOrigin = () => '';

/**
 * ヲタク業ビンゴ本体。
 *
 * カードはサーバー側で日付から作って `initialCard` で受け取る。こうすると初期表示が
 * サーバーとクライアントで必ず一致し、かつ日替わりになる（毎日開く理由になる）。
 * 「引き直す」を押したときだけ、クライアントでランダムに作り直す。
 */
export function BingoCard({ initialCard }: { initialCard: string[] }) {
  const [card, setCard] = useState(initialCard);
  const [filled, setFilled] = useState<Set<number>>(() => new Set([BINGO_CENTER]));

  const origin = useSyncExternalStore(subscribe, getOrigin, getServerOrigin);
  const { count: bingoCount, cells: litCells } = useMemo(() => countBingoLines(filled), [filled]);
  const rank = bingoRankFor(filled.size);

  const toggle = (index: number) => {
    if (index === BINGO_CENTER) return; // フリーマスは外せない
    setFilled(current => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const redraw = () => {
    setCard(buildBingoCard(Math.floor(Math.random() * 2 ** 31)));
    setFilled(new Set([BINGO_CENTER]));
  };

  const url = origin ? `${origin}/bingo` : '';
  const text = `ヲタク業ビンゴ、${bingoCount}ビンゴでした${rank.emoji}\n25マス中${filled.size}マス当てはまって「${rank.name}」\n\n${rank.comment}\n\n#OSHICOA16 #ヲタク業ビンゴ`;

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); alert('URLをコピーしました'); }
    catch { prompt('このURLをコピーしてください', url); }
  };

  return (
    <>
      <div className="bingoScore">
        <p className="bingoScoreMain">
          <b>{bingoCount}</b><span>ビンゴ</span>
        </p>
        <p className="bingoScoreSub">
          <span>25マス中 <b>{filled.size}</b> マス</span>
          <span>{rank.emoji} {rank.name}</span>
        </p>
      </div>

      <div className="bingoBoard" role="group" aria-label="ヲタク業ビンゴのカード">
        {card.map((item, index) => {
          const isFree = index === BINGO_CENTER;
          const isFilled = filled.has(index);
          return (
            <button
              type="button"
              key={`${index}-${item}`}
              className={`bingoCell${isFilled ? ' isFilled' : ''}${litCells.has(index) ? ' isLit' : ''}${isFree ? ' isFree' : ''}`}
              onClick={() => toggle(index)}
              aria-pressed={isFilled}
              disabled={isFree}
            >
              {isFree
                ? BINGO_FREE_TEXT.split('\n').map(line => <span key={line}>{line}</span>)
                : <span>{item}</span>}
            </button>
          );
        })}
      </div>

      <p className="bingoRankNote">{rank.comment}</p>

      <div className="shareRow bingoActions">
        <a
          className="button"
          target="_blank"
          rel="noreferrer"
          href={`https://x.com/intent/post?text=${encodeURIComponent(`${text} ${url}`)}`}
        >
          結果をXでシェア
        </a>
        <a
          className="button ghost"
          target="_blank"
          rel="noreferrer"
          href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`}
        >
          LINE
        </a>
        <button className="button ghost" onClick={copy}>URLをコピー</button>
        <button className="button ghost" onClick={redraw}>カードを引き直す</button>
      </div>

      <div className="bingoFoot">
        <p className="bingoHint">
          タップした内容はこの端末の中だけで完結します。サーバーには何も送りません。
        </p>
        <Link className="button" href="/diagnosis">16タイプ診断もやってみる →</Link>
      </div>
    </>
  );
}

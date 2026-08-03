'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getType } from '@/data/types';
import { getTypeTheme } from '@/lib/theme';
import { DailyFortune, formatDateKey } from '@/lib/fortune';
import { useDiagnosisStore } from '@/stores/diagnosis';
import { TypeCode } from '@/types';

const Stars = ({ value }: { value: number }) => (
  <span className="fortuneStars">
    <span aria-hidden>{'★'.repeat(value)}{'☆'.repeat(5 - value)}</span>
    <span className="srOnly">5段階中{value}</span>
  </span>
);

export function TodayFortune({ fortunes, dateKey }: { fortunes: DailyFortune[]; dateKey: string }) {
  const { result } = useDiagnosisStore();
  const [selected, setSelected] = useState<TypeCode | null>(null);

  const mine = result?.typeCode;
  const active = selected ?? mine ?? fortunes[0].code;
  const fortune = fortunes.find(item => item.code === active) ?? fortunes[0];
  const type = getType(fortune.code)!;
  const theme = getTypeTheme(fortune.code);
  const isMine = !selected && !!mine;

  return (
    <section className="fortune">
      <div className="fortuneHead">
        <p className="eyebrow fortuneEyebrow">DAILY FORTUNE</p>
        <h2>今日のヲタク運</h2>
        <p className="fortuneDate">{formatDateKey(dateKey)}・毎朝0時（日本時間）に切り替わります</p>
      </div>

      <article className="fortuneCard" style={{ ['--chip' as string]: theme.chip }}>
        <div className="fortuneCardTop">
          <span className="typeMark" aria-hidden>{theme.mark}</span>
          <div className="fortuneWho">
            <p className="code">
              {fortune.code}
              {isMine && <b className="fortuneMine">あなたのタイプ</b>}
            </p>
            <h3>{type.name}</h3>
          </div>
          <div className="fortuneScore">
            <span className="fortuneLevel" style={{ ['--chip' as string]: fortune.level.chip }}>{fortune.level.label}</span>
            <span className="fortuneRank">
              <b>{fortune.rank}</b>
              <small>/ 16位</small>
            </span>
          </div>
        </div>

        <p className="fortuneHeadline">{fortune.headline}</p>

        <ul className="fortuneCats">
          {fortune.categories.map(category => (
            <li key={category.id}>
              <div className="fortuneCatHead">
                <b><span aria-hidden>{category.icon}</span> {category.label}</b>
                <Stars value={category.stars} />
              </div>
              <p>{category.comment}</p>
            </li>
          ))}
        </ul>

        <p className="fortuneLucky">
          <b>ラッキー推し活</b>
          {fortune.luckyAction}
        </p>

        <div className="fortuneActions">
          <label className="fortuneSwitch">
            <span>他のタイプの運勢を見る</span>
            <select value={fortune.code} onChange={event => setSelected(event.target.value as TypeCode)}>
              {fortunes.map(item => (
                <option key={item.code} value={item.code}>
                  {item.rank}位　{item.code}　{getType(item.code)!.name}
                </option>
              ))}
            </select>
          </label>
          {!mine && (
            <Link className="button small ghost" href="/diagnosis">自分のタイプを診断する →</Link>
          )}
        </div>
      </article>

      <details className="fortuneRanking">
        <summary>16タイプの順位をぜんぶ見る</summary>
        <ol>
          {fortunes.map(item => {
            const itemTheme = getTypeTheme(item.code);
            return (
              <li key={item.code}>
                <button
                  type="button"
                  className={item.code === fortune.code ? 'active' : ''}
                  onClick={() => setSelected(item.code)}
                  aria-current={item.code === fortune.code}
                >
                  <span className="fortuneRowRank">{item.rank}</span>
                  <span className="fortuneRowMark" aria-hidden>{itemTheme.mark}</span>
                  <span className="fortuneRowName">
                    <b>{getType(item.code)!.name}</b>
                    <small>{item.code}</small>
                  </span>
                  <span className="fortuneLevel" style={{ ['--chip' as string]: item.level.chip }}>{item.level.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </details>

      <p className="note fortuneNote">
        <span>占いはエンタメです。診断結果や16タイプの内容は変わりません</span>
        <span>入力・結果は端末内のみ。サーバーへは送りません</span>
      </p>
    </section>
  );
}

'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { oshicoaTypes } from '@/data/types';
import { LETTER_LABELS } from '@/data/compatibility/pairFit';
import { TypeCode } from '@/types';
import { TypeAvatar } from './TypeAvatar';

const AXIS_FILTERS: string[] = ['R', 'C', 'E', 'P', 'G', 'M', 'T', 'S'];

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** 開いているときだけマウントしてください（閉じると検索条件はリセットされます） */
export function TypeSelectModal({
  title,
  selectedCode,
  onSelect,
  onClose,
}: {
  title: string;
  selectedCode?: TypeCode;
  onSelect: (code: TypeCode) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [keyword, setKeyword] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const titleId = useId();
  const countId = useId();

  const shown = useMemo(() => {
    const needle = keyword.trim().toLowerCase();
    return oshicoaTypes.filter(type => {
      if (!filters.every(letter => type.code.includes(letter))) return false;
      if (!needle) return true;
      return [type.code, type.name, type.reading, type.catchphrase]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [keyword, filters]);

  const toggleFilter = (letter: string) =>
    setFilters(current =>
      current.includes(letter) ? current.filter(item => item !== letter) : [...current, letter],
    );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      // フォーカストラップ：モーダルの外へタブ移動させない
      if (event.shiftKey && (active === first || !dialogRef.current?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  // 開いている間は背面をスクロールさせない（閉じる・離脱時に必ず戻す）
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className="compatModalBackdrop"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="compatModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={countId}
        ref={dialogRef}
        onKeyDown={handleKeyDown}
      >
        <div className="compatModalHead">
          <div className="compatModalTitleRow">
            <h2 id={titleId}>{title}</h2>
            <button type="button" className="compatModalClose" onClick={onClose} aria-label="タイプ選択を閉じる">
              ×
            </button>
          </div>
          <input
            ref={searchRef}
            className="compatSearch"
            type="search"
            value={keyword}
            onChange={event => setKeyword(event.target.value)}
            placeholder="コード（RCGT）やタイプ名で検索"
            aria-label="4文字コードまたはタイプ名で検索"
          />
          <div className="filters compatFilters">
            {AXIS_FILTERS.map(letter => (
              <button
                type="button"
                key={letter}
                className={`filter ${filters.includes(letter) ? 'active' : ''}`}
                aria-pressed={filters.includes(letter)}
                onClick={() => toggleFilter(letter)}
              >
                {letter} <span style={{ fontWeight: 700, fontSize: 11 }}>{LETTER_LABELS[letter]}</span>
              </button>
            ))}
            {filters.length > 0 && (
              <button type="button" className="filter" onClick={() => setFilters([])}>
                クリア ×
              </button>
            )}
          </div>
          <p className="note" id={countId} style={{ margin: 0 }}>
            <span>{shown.length}タイプを表示中</span>
          </p>
        </div>

        <div className="compatModalBody">
          <ul className="compatTypeGrid">
            {shown.map(type => {
              const isSelected = type.code === selectedCode;
              return (
                <li key={type.code}>
                  <button
                    type="button"
                    className={`compatTypeCard ${isSelected ? 'selected' : ''}`}
                    aria-pressed={isSelected}
                    onClick={() => onSelect(type.code)}
                  >
                    <TypeAvatar code={type.code} size="sm" />
                    <span className="compatTypeCardBody">
                      <span className="compatTypeCode">{type.code}</span>
                      <span className="compatTypeName">{type.name}</span>
                      <span className="compatTypeCatch">{type.catchphrase}</span>
                    </span>
                    <span className="compatCheck" aria-hidden>
                      {isSelected ? '✓' : ''}
                    </span>
                    {isSelected && <span className="srOnly">選択中</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          {shown.length === 0 && (
            <p className="lead" style={{ margin: '18px auto', textAlign: 'center' }}>
              条件に合うタイプが見つかりませんでした。検索や絞り込みを減らしてみてください。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { oshicoaTypes } from '@/data/types';
import { getTypeTheme } from '@/lib/theme';

const keys: [string, string][] = [
  ['R', '共鳴'], ['C', '接続'], ['E', '体験'], ['P', '所有'],
  ['G', '成長支援'], ['M', '自己充足'], ['T', '連帯'], ['S', '単独'],
];

export default function Types() {
  const [filters, setFilters] = useState<string[]>([]);
  const shown = oshicoaTypes.filter(type => filters.every(key => type.code.includes(key)));
  const toggle = (key: string) => setFilters(current => current.includes(key) ? current.filter(item => item !== key) : [...current, key]);

  return (
    <main className="shell section">
      <p className="eyebrow">ECOLOGY INDEX</p>
      <h1 style={{ fontSize: 'clamp(30px,7vw,50px)', margin: '4px 0 12px' }}>16のヲタク生態</h1>
      <p className="lead">コードは入口。主役は、あなたが何を守り、何に熱くなるかです。</p>

      <div className="filters" style={{ marginTop: 22 }}>
        {keys.map(([key, label]) => (
          <button className={`filter ${filters.includes(key) ? 'active' : ''}`} key={key} onClick={() => toggle(key)}>
            {key} <span style={{ fontWeight: 700, fontSize: 11 }}>{label}</span>
          </button>
        ))}
        {filters.length > 0 && <button className="filter" onClick={() => setFilters([])}>クリア ×</button>}
      </div>

      <p className="note" style={{ marginBottom: 20 }}><span>{shown.length}タイプを表示中</span></p>

      <div className="grid">
        {shown.map(type => {
          const theme = getTypeTheme(type.code);
          return (
            <Link className="type" href={`/types/${type.code}`} key={type.code} style={{ ['--chip' as string]: theme.chip }}>
              <span className="typeMark" aria-hidden>{theme.mark}</span>
              <span className="code">{type.code}</span>
              <h3>{type.name}</h3>
              <p>{type.catchphrase}</p>
              <small>くわしく見る →</small>
            </Link>
          );
        })}
      </div>

      {shown.length === 0 && <p className="lead" style={{ marginTop: 24 }}>その組み合わせのタイプはありません。フィルターを減らしてみてください。</p>}
    </main>
  );
}

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// 共有URLを組み立てる画面が、origin をレンダー中に直接読んでいないことを固定する。
//
// `typeof window === 'undefined' ? '' : location.origin` のように書くと、
// サーバーは空文字・クライアントは実URLを返す。本番ビルドの React は
// ハイドレーション時に属性の不一致を直さないため、href がサーバー側の値
// （URLなし）のまま固定され、シェアが壊れる。警告も出ないので気づけない。
//
// 実際に結果ページのシェアが、LINEはURL空・Xは本文にURLなし・コピーは空文字、
// という状態になっていた。lib/use-origin.ts の useOrigin を使えば防げる。

const root = join(import.meta.dirname, '..');

const shareComponents = [
  'components/Share.tsx',
  'components/FortuneShare.tsx',
  'components/BingoCard.tsx',
  'components/ResumeBuilder.tsx',
];

describe('共有URLの組み立て', () => {
  it.each(shareComponents)('%s はレンダー中に location を直接読まない', file => {
    const source = readFileSync(join(root, file), 'utf8');

    expect(source).not.toMatch(/typeof window === ['"]undefined['"]\s*\?/);
    expect(source).toContain('useOrigin');
  });

  it.each(shareComponents)('%s は origin の読み取りを自前で複製していない', file => {
    const source = readFileSync(join(root, file), 'utf8');

    // useSyncExternalStore を各所で書き直すと、サーバー用スナップショットの
    // 渡し忘れが起きる。読み取りは lib/use-origin.ts の1箇所に集約する。
    expect(source).not.toContain('useSyncExternalStore');
  });

  it('useOrigin がサーバー用のスナップショットを渡している', () => {
    const source = readFileSync(join(root, 'lib/use-origin.ts'), 'utf8');

    expect(source).toContain('useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)');
    expect(source).toMatch(/getServerSnapshot\s*=\s*\(\)\s*=>\s*['"]{2}/);
  });
});

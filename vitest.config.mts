import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// テストは診断ロジック（lib/）とデータ（data/）だけを対象にする。
// UIコンポーネントは対象外なので、DOM環境は不要（node 環境で動く）。
export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts', 'data/**/*.test.ts'],
  },
  resolve: {
    // アプリ本体と同じ `@/` エイリアスを使えるようにする（tsconfig.json の paths と揃える）。
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
});

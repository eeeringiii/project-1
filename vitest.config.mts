import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// 相性ロジック（純粋関数）のテスト用。ブラウザ環境は不要なので node で実行します。
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});

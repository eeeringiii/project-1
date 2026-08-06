import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 独立したサブプロジェクト。それぞれ自前の eslint.config.mjs / tsconfig.json を持ち、
    // 各ディレクトリ内で lint する。ルートの lint 対象からは外す。
    "sns-manager/**",
    "taisei-site/**",
  ]),
]);

export default eslintConfig;

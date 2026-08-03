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
    // 別プロジェクト。それぞれ自前の eslint.config.mjs / package.json を持つため、
    // ルートの `npm run lint` の対象からは外す。
    "sns-manager/**",
    "taisei-site/**",
    "oshicoa-16/**",
  ]),
]);

export default eslintConfig;

import type { NextConfig } from "next";

/**
 * 旧タイプコード → 現行コード。
 * 2文字目は E/P 軸なので RC** は診断からは生成されない誤ったコードだった。
 * すでに共有されたURLを 404 にしないため恒久リダイレクトする。
 */
const renamedTypeCodes: Record<string, string> = {
  RCGT: "REGT",
  RCGS: "REGS",
  RCMT: "REMT",
  RCMS: "REMS",
};

const nextConfig: NextConfig = {
  async redirects() {
    return Object.entries(renamedTypeCodes).flatMap(([from, to]) => [
      { source: `/types/${from}`, destination: `/types/${to}`, permanent: true },
      { source: `/result/${from}`, destination: `/result/${to}`, permanent: true },
    ]);
  },
};

export default nextConfig;

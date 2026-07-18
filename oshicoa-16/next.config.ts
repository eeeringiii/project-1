import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // このアプリはリポジトリ内のサブディレクトリに同居しているため、
  // トレースの起点をリポジトリ直下に固定する（Vercelのモノレポ推奨設定）。
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;

import { redirect } from "next/navigation";
import type { Metadata } from "next";

// Development environment check
function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

export const metadata: Metadata = {
  title: "Data Manager - samuido | データ管理",
  description:
    "開発サーバー専用のコンテンツデータ管理ツール。動画、画像、Markdownファイルなどを管理し、JSON出力とプレビュー機能を提供します。",
  robots: "noindex, nofollow",
};

export default function DataManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirect if not in development environment
  if (!isDevelopment()) {
    redirect("/");
  }

  return <>{children}</>;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s - Tools | samuido",
    default: "Tools - samuido | 実用的なWebツール集",
  },
  description: "実用的なWebツールのコレクション。すべて無償で提供。",
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

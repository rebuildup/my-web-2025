import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Metadata } from "next";
import PomodoroTimer from "./components/PomodoroTimer";

export const metadata: Metadata = {
  title: "Pomodoro Timer - samuido | ポモドーロタイマー",
  description:
    "シンプルなポモドーロタイマー。25分作業・5分休憩のサイクルで効率的な作業時間管理を実現。",
  keywords: [
    "ポモドーロ",
    "タイマー",
    "時間管理",
    "集中力",
    "作業効率",
    "25分作業",
  ],
  robots: "index, follow",
  openGraph: {
    title: "Pomodoro Timer - samuido | ポモドーロタイマー",
    description:
      "シンプルなポモドーロタイマー。25分作業・5分休憩のサイクルで効率的な作業時間管理を実現。",
    type: "website",
    url: "https://yusuke-kim.com/tools/pomodoro",
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pomodoro Timer - samuido | ポモドーロタイマー",
    description:
      "シンプルなポモドーロタイマー。25分作業・5分休憩のサイクルで効率的な作業時間管理を実現。",
    creator: "@361do_sleep",
  },
};

export default function PomodoroPage() {
  return (
    <>
      <div className="container-system pt-10 pb-4">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "Pomodoro Timer", isCurrent: true },
          ]}
        />
      </div>
      <div className="container-system">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-primary">Pomodoro Timer</h1>
            <p className="text-lg text-foreground max-w-2xl mx-auto">
              シンプルなポモドーロタイマー。25分作業・5分休憩のサイクルで効率的な作業時間管理を実現。
            </p>
          </div>

          <PomodoroTimer />
        </div>
      </div>
    </>
  );
}

import { loadFromCache, saveToCache } from "../SiteInterface";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  hidden?: boolean;
};

export type AchievementWithState = Achievement & { unlocked: boolean; unlockedAt?: number };

export type AchievementContext = {
  accuracy: number; // 0-1
  avgKpm: number;
  maxCombo: number;
  miss: number;
  totalHit: number;
  totalKeyHit: number;
  playCount: number;
  gameMode: string;
  longCompleted: boolean;
  longNoMiss?: boolean;
};

const STORAGE_KEY = "achievements_unlocked";

const ACHIEVEMENTS: Achievement[] = [
  { id: "first_play", title: "はじめの一歩", description: "初めてゲームを完走する" },
  { id: "no_miss", title: "完璧主義", description: "ミスなしで完走する" },
  { id: "acc_95", title: "高精度", description: "精度95% 以上で完走する" },
  { id: "acc_98", title: "神業精度", description: "精度98% 以上で完走する" },
  { id: "kpm_240", title: "高速入力", description: "平均KPM 240 以上で完走する" },
  { id: "kpm_300", title: "爆速入力", description: "平均KPM 300 以上で完走する" },
  { id: "combo_50", title: "連鎖の達人", description: "最大コンボ 50 以上を達成" },
  { id: "combo_100", title: "無限連鎖", description: "最大コンボ 100 以上を達成" },
  { id: "long_clear", title: "長文クリア", description: "長文モードを完走する" },
  { id: "long_nomiss", title: "長文無欠", description: "長文モードをミスなしで完走する" },
  { id: "keys_1000", title: "積み上げ", description: "累計キー入力 1000 回" },
  { id: "keys_10000", title: "積み上げ職人", description: "累計キー入力 10000 回" },
  { id: "plays_5", title: "習慣化", description: "5 回プレイを完走する" },
  { id: "plays_20", title: "日課", description: "20 回プレイを完走する" },
  { id: "focus_clear", title: "集中勝利", description: "フォーカスモードを完走する" },
];

function loadUnlocked(): Record<string, number> {
  return loadFromCache<Record<string, number>>(STORAGE_KEY, {});
}

export function getAchievements(): AchievementWithState[] {
  const unlocked = loadUnlocked();
  return ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: Boolean(unlocked[a.id]),
    unlockedAt: unlocked[a.id],
  }));
}

export function evaluateAchievements(ctx: AchievementContext): AchievementWithState[] {
  const unlocked = loadUnlocked();
  const newlyUnlocked: AchievementWithState[] = [];

  const tryUnlock = (id: string, condition: boolean) => {
    if (!condition) return;
    if (!unlocked[id]) {
      unlocked[id] = Date.now();
      const base = ACHIEVEMENTS.find((a) => a.id === id)!;
      newlyUnlocked.push({ ...base, unlocked: true, unlockedAt: unlocked[id] });
    }
  };

  tryUnlock("first_play", ctx.totalHit > 0);
  tryUnlock("no_miss", ctx.miss === 0 && ctx.totalHit > 0);
  tryUnlock("acc_95", ctx.accuracy >= 0.95);
  tryUnlock("acc_98", ctx.accuracy >= 0.98);
  tryUnlock("kpm_240", ctx.avgKpm >= 240);
  tryUnlock("kpm_300", ctx.avgKpm >= 300);
  tryUnlock("combo_50", ctx.maxCombo >= 50);
  tryUnlock("combo_100", ctx.maxCombo >= 100);
  tryUnlock("long_clear", ctx.longCompleted && ctx.totalHit > 0);
  tryUnlock("long_nomiss", ctx.longCompleted && ctx.miss === 0 && ctx.totalHit > 0);
  tryUnlock("keys_1000", ctx.totalKeyHit >= 1000);
  tryUnlock("keys_10000", ctx.totalKeyHit >= 10000);
  tryUnlock("plays_5", ctx.playCount >= 5);
  tryUnlock("plays_20", ctx.playCount >= 20);
  tryUnlock("focus_clear", ctx.gameMode === "focus" && ctx.totalHit > 0);

  if (newlyUnlocked.length > 0) {
    saveToCache(STORAGE_KEY, unlocked);
  }
  return newlyUnlocked;
}

import { gameData } from "./002_gameConfig";
import { settings } from "../SiteInterface";
import { fetchPlayerData } from "./022_Login";
export interface RankingPlayer {
  player_name: string;
  player_id: number;
  player_score: number;
  player_accracy: number;
  player_avg_kpm: number;
  player_max_kpm: number;
  player_play_date: number;
}
export async function loadcache_localranking() {
  let defaultR: RankingPlayer = {
    player_name: "nodata",
    player_id: 0,
    player_score: 0,
    player_accracy: 0,
    player_avg_kpm: 0,
    player_max_kpm: 0,
    player_play_date: 0,
  };
  let output: RankingPlayer[] = loadFromCache<typeof output>("localRanking", [
    defaultR,
  ]);
  if (settings.user.isLoggedin) {
    await fetchPlayerData(settings.user.id.toString())
      .then((data) => {
        output = [];
        for (let data_l = 0; data_l < data.length; data_l++) {
          const online_d: RankingPlayer = {
            player_id: data[data_l][0],
            player_name: data[data_l][1],
            player_score: data[data_l][2],
            player_accracy: data[data_l][3],
            player_avg_kpm: data[data_l][4],
            player_max_kpm: data[data_l][5],
            player_play_date: data[data_l][6],
          };
          output[data_l] = online_d;
        }
      })
      .catch((error) => {
        console.error("Failed to fetch player data:", error);
      });
  }

  while (output.length <= 100) {
    output.push(defaultR);
  }
  gameData.localRanking = output;
}
export function savecache_localranking() {
  saveToCache("localRanking", gameData.localRanking);
}
export const saveToCache = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};
export const loadFromCache = <T>(key: string, defaultValue: T): T => {
  const cachedData = localStorage.getItem(key);
  return cachedData ? JSON.parse(cachedData) : defaultValue;
};
export function insertLocalRanking(newPlayer: RankingPlayer): number {
  const ranking = gameData.localRanking;

  let index = ranking.findIndex(
    (player) => newPlayer.player_score > player.player_score,
  );

  if (index === -1) {
    index = ranking.length;
  } else {
    while (
      index < ranking.length &&
      ranking[index].player_score === newPlayer.player_score
    ) {
      index++;
    }
  }

  if (index < 100) {
    ranking.splice(index, 0, newPlayer);
    ranking.pop();

    saveToCache("localRanking", ranking);
    return index;
  }

  return -1;
}
export function insertOnlineRanking(newPlayer: RankingPlayer): number {
  const ranking = gameData.onlineRanking;

  let index = ranking.findIndex(
    (player) => newPlayer.player_score > player.player_score,
  );

  if (index === -1) {
    index = ranking.length;
  } else {
    while (
      index < ranking.length &&
      ranking[index].player_score === newPlayer.player_score
    ) {
      index++;
    }
  }

  if (index < 100) {
    ranking.splice(index, 0, newPlayer);
    ranking.pop();
    return index;
  }

  return -1;
}
export async function deleteCache(cacheName: string): Promise<boolean> {
  try {
    const result = await caches.delete(cacheName);
    if (result) {
      console.log(`Cache '${cacheName}' deleted successfully.`);
    } else {
      console.log(`Cache '${cacheName}' not found or deletion failed.`);
    }
    return result;
  } catch (error) {
    console.error(`Error deleting cache '${cacheName}':`, error);
    return false;
  }
}

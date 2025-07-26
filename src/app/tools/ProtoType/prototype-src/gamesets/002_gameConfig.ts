export interface Issue {
  text: string;
  romaji: string;
}
import { ConversionTendencies } from "./008_generate_pattern";
import { RankingPlayer } from "./020_cacheControl";
export interface GameData {
  CurrentSceneName: string;
  FontFamily: string;
  KeyLayout: string;
  Score: number;
  MaxScore: number;
  MaxKPM: number;
  score_extra: number;
  Miss: number;
  GameMode: string;
  textsData: Issue[][];
  Issues: Issue[];
  Issues_num: number;
  current_Issue: number;
  current_inputed: string;
  IsStarted: boolean;
  StartTime: number;
  EndTime: number;
  Conversion: ConversionTendencies;
  combo_cnt: number;
  max_combo: number;
  total_hit_cnt: number;
  game_failure: boolean;
  instant_key_n: number;
  App_Filters: any[];
  IsLoggedin: boolean;
  current_Player_name: string;
  localRanking: RankingPlayer[];
  missKeys: string[];
  current_Player_id: number;
  acc_keys: number[];
  total_keyhit: number;
  online_player: { name: string; id: number };
  onlineRanking: RankingPlayer[];
  onlinedata: RankingPlayer[];
  gameselect_open: number;
  flashType: number;
}

export const gameData: GameData = {
  CurrentSceneName: "Opening",
  FontFamily: "Noto Sans JP",
  KeyLayout: "QUERTY",
  Score: 0,
  MaxScore: 0,
  MaxKPM: 0,
  score_extra: 0,
  Miss: 0,
  GameMode: "nomal",
  textsData: [],
  Issues: [],
  Issues_num: 15,
  current_Issue: 0,
  current_inputed: "",
  IsStarted: false,
  StartTime: Date.now(),
  EndTime: Date.now(),
  Conversion: [],
  combo_cnt: 0,
  max_combo: 0,
  total_hit_cnt: 0,
  game_failure: false,
  instant_key_n: 20,
  App_Filters: [],
  IsLoggedin: false,
  current_Player_name: "",
  localRanking: [],
  missKeys: [],
  current_Player_id: 100000,
  acc_keys: [],
  total_keyhit: 0,
  online_player: { name: "", id: -1 },
  onlineRanking: [],
  onlinedata: [],
  gameselect_open: 0,
  flashType: 0,
};

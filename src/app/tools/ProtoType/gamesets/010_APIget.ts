import { getLocalTexts } from "./028_local_texts";

const WEB_APP_URL = (process.env.NEXT_PUBLIC_WEB_APP_URL ??
  process.env.NEXT_PUBLIC_PROTO_WEB_APP_URL ??
  "") as string;

// ローカル定義を返すだけのダミー.APIは呼ばない.
export async function fetchTexts(): Promise<any> {
  return getLocalTexts();
}
export async function postPlayData(
  playerId: string | number,
  playerName: string,
  score: number,
  accuracy: number,
  avgKpm: number,
  maxKpm: number,
): Promise<any> {
  const params = new URLSearchParams();
  params.append("playerId", playerId.toString());
  params.append("playerName", playerName);
  params.append("score", score.toString());
  params.append("accuracy", accuracy.toString());
  params.append("avgKpm", avgKpm.toString());
  params.append("maxKpm", maxKpm.toString());

  const response = await fetch(WEB_APP_URL, {
    method: "POST",
    body: params,
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  return data;
}
//postPlayData(id,name,score,accuracy,avgkpm,maxkpm)
export async function getRanking_Data(option: number) {
  const response = await fetch(
    WEB_APP_URL +
      `?sheetName=ranking&startRow=2&startCol=${
        8 * option + 1
      }&endRow=102&endCol=${8 * option + 7}`,
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return data;
}

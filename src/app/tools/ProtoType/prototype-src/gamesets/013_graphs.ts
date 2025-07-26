import { Application, Container, Graphics, Text, TextStyle } from "pixi.js";
import { settings } from "../SiteInterface";
import { replaceHash } from "./001_game_master";
import { gameData } from "./002_gameConfig";
import { RankingPlayer } from "./020_cacheControl";

export function score_graph(app: Application, container: Container) {
  const sortedStructs: RankingPlayer[] = gameData.localRanking
    .slice()
    .sort((a, b) => a.player_play_date - b.player_play_date);

  const graphWidth = 800;
  const graphHeight = 400;
  const graphX = app.screen.width / 2 - graphWidth / 2;
  const graphY = app.screen.height / 2 - graphHeight / 2;

  const graphContainer = new Container();
  graphContainer.position.set(graphX, graphY);
  container.addChild(graphContainer);

  const marginLeft = 50;
  const marginRight = 20;
  const marginTop = 20;
  const marginBottom = 50;
  const innerWidth = graphWidth - marginLeft - marginRight;
  const innerHeight = graphHeight - marginTop - marginBottom;

  const filteredData = sortedStructs
    .filter((player) => player.player_score !== 0)
    .slice(-100);
  const data_length = filteredData.length;
  if (data_length === 0) {
    return;
  }

  const scores = filteredData.map((player) => player.player_score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const scoreRange = maxScore - minScore === 0 ? 1 : maxScore - minScore;

  const labelStyle = new TextStyle({
    fontSize: 12,
    fill: replaceHash(settings.colorTheme.colors.MainColor),
    align: "right",
  });

  const numTicks = 5;
  for (let i = 0; i <= numTicks; i++) {
    const yPos = marginTop + (i / numTicks) * innerHeight;

    const tickLine = new Graphics();
    tickLine.moveTo(marginLeft - 5, yPos);
    tickLine.lineTo(marginLeft, yPos);
    tickLine.stroke({
      width: 1,
      color: replaceHash(settings.colorTheme.colors.MainColor),
      alpha: 0.6,
    });
    graphContainer.addChild(tickLine);

    const scoreValue = maxScore - (i / numTicks) * scoreRange;
    const scoreLabel = new Text({
      text: Math.round(scoreValue).toString(),
      style: labelStyle,
    });
    scoreLabel.anchor.set(1, 0.5);
    scoreLabel.position.set(marginLeft - 8, yPos);
    graphContainer.addChild(scoreLabel);
  }

  const accuracyLabelStyle = new TextStyle({
    fontSize: 12,
    fill: replaceHash(settings.colorTheme.colors.MainColor),
    align: "left",
  });

  for (let i = 0; i <= numTicks; i++) {
    const yPos = marginTop + (i / numTicks) * innerHeight;

    const accTickLine = new Graphics();
    accTickLine.moveTo(graphWidth - marginRight, yPos);
    accTickLine.lineTo(graphWidth - marginRight + 5, yPos);
    accTickLine.stroke({
      width: 1,
      color: replaceHash(settings.colorTheme.colors.MainColor),
      alpha: 0.6,
    });
    graphContainer.addChild(accTickLine);

    const accValue = 100 - (i / numTicks) * 100;
    const accLabel = new Text({
      text: Math.round(accValue) + "%",
      style: accuracyLabelStyle,
    });
    accLabel.anchor.set(0, 0.5);
    accLabel.position.set(graphWidth - marginRight + 8, yPos);
    graphContainer.addChild(accLabel);
  }

  const scoreAxisLabel = new Text({
    text: "スコア",
    style: new TextStyle({
      fontSize: 14,
      fill: replaceHash(settings.colorTheme.colors.MainAccent),
      fontWeight: "bold",
    }),
  });
  scoreAxisLabel.anchor.set(1, 0.5);
  scoreAxisLabel.position.set(marginLeft - 2, marginTop / 2 - 10);
  graphContainer.addChild(scoreAxisLabel);

  const accAxisLabel = new Text({
    text: "精度",
    style: new TextStyle({
      fontSize: 14,
      fill: replaceHash(settings.colorTheme.colors.MainColor),
      fontWeight: "bold",
    }),
  });
  accAxisLabel.anchor.set(0, 0.5);
  accAxisLabel.position.set(graphWidth - marginRight + 4, marginTop / 2 - 10);
  graphContainer.addChild(accAxisLabel);

  const axes = new Graphics();
  axes.moveTo(marginLeft, graphHeight - marginBottom);
  axes.lineTo(graphWidth - marginRight, graphHeight - marginBottom);
  axes.moveTo(marginLeft, graphHeight - marginBottom);
  axes.lineTo(marginLeft, marginTop);
  axes.stroke({
    width: 2,
    color: replaceHash(settings.colorTheme.colors.MainColor),
    alpha: 0.6,
  });
  graphContainer.addChild(axes);

  if (data_length <= 1) {
    return;
  }

  const scoreLine = new Graphics();

  const firstPlayer = filteredData[0];
  const firstX = marginLeft;
  const firstScoreY =
    marginTop +
    (1 - (firstPlayer.player_score - minScore) / scoreRange) * innerHeight;
  scoreLine.moveTo(firstX, firstScoreY);

  for (let i = 1; i < data_length; i++) {
    const player = filteredData[i];
    const xPos = marginLeft + (i / (data_length - 1)) * innerWidth;
    const scoreY =
      marginTop +
      (1 - (player.player_score - minScore) / scoreRange) * innerHeight;
    scoreLine.lineTo(xPos, scoreY);
  }

  scoreLine.stroke({
    width: 2,
    color: replaceHash(settings.colorTheme.colors.MainAccent),
    alpha: 0.6,
  });

  graphContainer.addChild(scoreLine);

  const accLine = new Graphics();

  const firstAccY =
    marginTop + (1 - firstPlayer.player_accracy / 100) * innerHeight;
  accLine.moveTo(firstX, firstAccY);

  for (let i = 1; i < data_length; i++) {
    const player = filteredData[i];
    const xPos = marginLeft + (i / (data_length - 1)) * innerWidth;
    const accY = marginTop + (1 - player.player_accracy / 100) * innerHeight;
    accLine.lineTo(xPos, accY);
  }

  accLine.stroke({
    width: 2,
    color: replaceHash(settings.colorTheme.colors.MainColor),
    alpha: 0.6,
  });

  graphContainer.addChild(accLine);

  for (let i = 0; i < data_length; i++) {
    const player = filteredData[i];
    const xPos = marginLeft + (i / (data_length - 1)) * innerWidth;

    const scoreY =
      marginTop +
      (1 - (player.player_score - minScore) / scoreRange) * innerHeight;
    const accY = marginTop + (1 - player.player_accracy / 100) * innerHeight;

    const scorePoint = new Graphics();
    scorePoint.circle(0, 0, 4);
    scorePoint.fill({
      color: replaceHash(settings.colorTheme.colors.MainAccent),
    });
    scorePoint.position.set(xPos, scoreY);
    graphContainer.addChild(scorePoint);

    const accPoint = new Graphics();
    accPoint.circle(0, 0, 4);
    accPoint.fill({ color: replaceHash(settings.colorTheme.colors.MainColor) });
    accPoint.position.set(xPos, accY);
    graphContainer.addChild(accPoint);
  }
}

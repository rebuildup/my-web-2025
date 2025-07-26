import React, { useEffect, useState } from "react";
import { getRanking_Data } from "../gamesets/010_APIget";
import "../styles/011_rankingtable.css";
import "../styles/015_RankingLoad.css";

const Ranking: React.FC = () => {
  const [tableData, setTableData] = useState<any[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getRanking_Data(0);
        const transposed = transposeData(data);
        setTableData(transposed);
      } catch (error) {
        console.error("Failed to fetch ranking data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ zIndex: 1 }}>
      <div>オンラインランキング</div>
      <br />
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">
            オンラインランキングを読み込み中...
          </div>
        </div>
      ) : (
        <table>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <br />
    </div>
  );
};

export default Ranking;

function transposeData(data: any) {
  let output: string[][] = [];
  const head: string[] = [
    " ",
    "プレイヤー名",
    "スコア",
    "正確率",
    "平均kpm",
    "最大kpm",
  ];
  output.push(head);
  for (let i = 0; i < 100; i++) {
    const row: string[] = [
      i + 1,
      data[i][1],
      data[i][2].toFixed(0),
      data[i][3].toFixed(2) + "%",
      data[i][4].toFixed(0),
      data[i][5].toFixed(0),
    ];
    output.push(row);
  }
  return output;
}

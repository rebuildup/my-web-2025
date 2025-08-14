const fs = require("fs");
const path = require("path");

// サンプルタグを既存のポートフォリオアイテムに追加
async function addSampleTags() {
  const portfolioPath = path.join(
    process.cwd(),
    "public",
    "data",
    "portfolio.json",
  );

  try {
    const data = JSON.parse(fs.readFileSync(portfolioPath, "utf-8"));

    // 各アイテムにサンプルタグを追加
    data.forEach((item, index) => {
      if (!item.tags || item.tags.length === 0) {
        // カテゴリに基づいてタグを追加
        const sampleTags = [];

        if (item.categories) {
          if (item.categories.includes("develop")) {
            sampleTags.push("JavaScript", "React", "TypeScript", "Web開発");
          }
          if (item.categories.includes("video")) {
            sampleTags.push(
              "動画制作",
              "After Effects",
              "映像編集",
              "モーショングラフィックス",
            );
          }
          if (item.categories.includes("design")) {
            sampleTags.push(
              "デザイン",
              "UI/UX",
              "グラフィックデザイン",
              "Photoshop",
            );
          }
          if (item.categories.includes("other")) {
            sampleTags.push("その他", "プロジェクト", "実験的");
          }
        }

        // 共通タグも追加
        sampleTags.push("ポートフォリオ", "作品");

        // ランダムに3-5個のタグを選択
        const selectedTags = sampleTags
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 3) + 3);

        item.tags = selectedTags;
        item.updatedAt = new Date().toISOString();

        console.log(`Added tags to item ${item.id}:`, selectedTags);
      }
    });

    // ファイルに書き戻し
    fs.writeFileSync(portfolioPath, JSON.stringify(data, null, 2), "utf-8");
    console.log("Sample tags added successfully!");
  } catch (error) {
    console.error("Error adding sample tags:", error);
  }
}

addSampleTags();

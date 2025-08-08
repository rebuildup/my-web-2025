const fs = require("fs");
const glob = require("glob");

// テストファイルを取得
const testFiles = glob.sync("src/**/__tests__/**/*.test.{ts,tsx}");

testFiles.forEach((filePath) => {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    // screenを使用しているがimportしていない場合
    if (
      content.includes("screen.") &&
      !content.includes("import { render, screen }")
    ) {
      if (content.includes("import { render }")) {
        content = content.replace(
          "import { render }",
          "import { render, screen }",
        );
        modified = true;
      }
    }

    // 構文エラーの修正
    if (content.includes("default: ((props:")) {
      content = content.replace(
        /default: \(\((props:[^)]+)\)\)/g,
        "default: ($1)",
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

console.log("Screen import fixes completed");

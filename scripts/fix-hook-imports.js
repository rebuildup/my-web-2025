const fs = require("fs");
const glob = require("glob");

// Hookテストファイルを取得
const hookTestFiles = glob.sync("src/hooks/__tests__/*.test.ts");

hookTestFiles.forEach((filePath) => {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    // importが不足している場合に追加
    if (
      content.includes("renderHook(") &&
      !content.includes("import { renderHook }")
    ) {
      // jest importの後にrenderHookを追加
      if (content.includes('import { jest } from "@jest/globals";')) {
        content = content.replace(
          'import { jest } from "@jest/globals";',
          'import { jest } from "@jest/globals";\nimport { renderHook } from "@testing-library/react";',
        );
        modified = true;
      } else {
        // jest importがない場合は先頭に追加
        content =
          '/**\n * @jest-environment jsdom\n */\n\nimport { jest } from "@jest/globals";\nimport { renderHook } from "@testing-library/react";\n\n' +
          content;
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed imports: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
});

console.log("Hook import fixes completed");

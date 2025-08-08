const fs = require("fs");
const glob = require("glob");

// Hookテストファイルを取得
const hookTestFiles = glob.sync("src/hooks/__tests__/*.test.ts");

hookTestFiles.forEach((filePath) => {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    // renderHookをテスト外に移動
    if (
      content.includes(
        'const { renderHook } = require("@testing-library/react");',
      )
    ) {
      content = content.replace(
        /import { renderHook } from "@testing-library\/react";/g,
        "",
      );

      content = content.replace(
        /const { renderHook } = require\("@testing-library\/react"\);/g,
        "",
      );

      // ファイルの先頭にimportを追加
      if (!content.includes("import { renderHook }")) {
        content = content.replace(
          /import { jest } from "@jest\/globals";/,
          'import { jest } from "@jest/globals";\nimport { renderHook } from "@testing-library/react";',
        );
      }

      modified = true;
    }

    // matchMediaのモックを追加
    if (
      content.includes("window.matchMedia") &&
      !content.includes('Object.defineProperty(window, "matchMedia"')
    ) {
      const mockSetup = `
// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock navigator
Object.defineProperty(navigator, 'maxTouchPoints', {
  writable: true,
  value: 0,
});
`;

      content = content.replace(/describe\(/, mockSetup + "\ndescribe(");
      modified = true;
    }

    // パラメータが必要なhookのテストを修正
    if (filePath.includes("useOfflinePerformance")) {
      content = content.replace(
        /renderHook\(\(\) => useOfflinePerformance\(\)\);/g,
        'renderHook(() => useOfflinePerformance({ toolName: "test" }));',
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
});

console.log("Hook test fixes completed");

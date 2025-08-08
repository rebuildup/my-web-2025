const fs = require("fs");
const glob = require("glob");

console.log("Fixing remaining test issues...");

// 1. 存在しないモジュールの参照を修正
const moduleReferences = [
  {
    testFile: "src/app/api/__tests__/content.test.ts",
    wrongModule: "../content",
    correctModule: "../content/route",
  },
  {
    testFile: "src/app/api/__tests__/health.test.ts",
    wrongModule: "../health",
    correctModule: "../health/route",
  },
  {
    testFile: "src/app/tools/pi-game/__tests__/piDigits.test.ts",
    wrongModule: "../piDigits",
    correctModule: "../lib/piDigits",
  },
  {
    testFile: "src/app/tools/pi-game/__tests__/useGameState.test.ts",
    wrongModule: "../useGameState",
    correctModule: "../hooks/useGameState",
  },
  {
    testFile: "src/app/tools/text-counter/__tests__/textAnalysis.test.ts",
    wrongModule: "../textAnalysis",
    correctModule: "../lib/textAnalysis",
  },
];

moduleReferences.forEach(({ testFile, wrongModule, correctModule }) => {
  try {
    if (fs.existsSync(testFile)) {
      let content = fs.readFileSync(testFile, "utf8");
      if (content.includes(wrongModule)) {
        content = content.replace(
          new RegExp(wrongModule.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
          correctModule,
        );
        fs.writeFileSync(testFile, content);
        console.log(`Fixed module reference in ${testFile}`);
      }
    }
  } catch (error) {
    console.log(`Could not fix ${testFile}: ${error.message}`);
  }
});

// 2. 全テストファイルにmatchMediaモックを追加
const testFiles = glob.sync("src/**/__tests__/**/*.test.{ts,tsx}");

testFiles.forEach((filePath) => {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    // matchMediaを使用しているがモックがない場合
    if (
      (content.includes("window.matchMedia") ||
        content.includes("useAccessibility") ||
        content.includes("useResponsive")) &&
      !content.includes('Object.defineProperty(window, "matchMedia"')
    ) {
      const mockSetup = `
// Mock Web APIs
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

Object.defineProperty(navigator, 'maxTouchPoints', {
  writable: true,
  value: 0,
});

`;

      // jest-environment jsdomの後に追加
      if (content.includes("* @jest-environment jsdom")) {
        content = content.replace(
          "* @jest-environment jsdom\n */",
          "* @jest-environment jsdom\n */" + mockSetup,
        );
        modified = true;
      } else if (content.includes("import")) {
        // importの前に追加
        const firstImport = content.indexOf("import");
        content =
          content.slice(0, firstImport) +
          mockSetup +
          content.slice(firstImport);
        modified = true;
      }
    }

    // redirectのモックを追加
    if (
      content.includes("redirect(") &&
      !content.includes('jest.mock("next/navigation"')
    ) {
      const navigationMock = `
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => "/",
  redirect: jest.fn(),
}));

`;

      if (content.includes("import")) {
        const firstImport = content.indexOf("import");
        content =
          content.slice(0, firstImport) +
          navigationMock +
          content.slice(firstImport);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Added mocks to: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

// 3. Performance APIのモックを追加
const performanceTestFiles = glob.sync(
  "src/**/__tests__/**/*performance*.test.{ts,tsx}",
);

performanceTestFiles.forEach((filePath) => {
  try {
    let content = fs.readFileSync(filePath, "utf8");

    if (!content.includes("Object.defineProperty(global, 'performance'")) {
      const performanceMock = `
// Mock Performance API
Object.defineProperty(global, 'performance', {
  writable: true,
  value: {
    getEntriesByType: jest.fn().mockReturnValue([]),
    mark: jest.fn(),
    measure: jest.fn(),
    now: jest.fn().mockReturnValue(Date.now()),
    timing: {},
    navigation: {
      type: 0,
      redirectCount: 0,
    },
  },
});

`;

      if (content.includes("describe(")) {
        content = content.replace("describe(", performanceMock + "describe(");
        fs.writeFileSync(filePath, content);
        console.log(`Added performance mock to: ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

console.log("Remaining test fixes completed!");

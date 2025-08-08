const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// 修正対象のテストファイルパターン
const testPatterns = [
  "src/app/__tests__/*.test.tsx",
  "src/app/about/__tests__/*.test.tsx",
  "src/app/about/card/__tests__/*.test.tsx",
  "src/app/about/commission/__tests__/*.test.tsx",
  "src/app/about/profile/__tests__/*.test.tsx",
];

// 共通の修正パターン
const commonFixes = [
  // 未使用のscreen importを削除
  {
    from: /import { render, screen } from "@testing-library\/react";/g,
    to: 'import { render } from "@testing-library/react";',
  },
  // any型の修正
  {
    from: /(props: any)/g,
    to: "(props: Record<string, unknown>)",
  },
  // unoptimized変数の削除
  {
    from: /const { unoptimized, \.\.\.imgProps } = props;/g,
    to: "const imgProps = props;",
  },
  // alt属性の追加
  {
    from: /<img \{\.\.\.imgProps\} \/>/g,
    to: '<img {...imgProps} alt={imgProps.alt || ""} />',
  },
  // require文のeslint-disable追加
  {
    from: /const (\w+) = require\(/g,
    to: "// eslint-disable-next-line @typescript-eslint/no-require-imports\n    const $1 = require(",
  },
  // useEffect mockの修正
  {
    from: /mockUseEffect\.mockImplementation\(\(fn, deps\) => \{/g,
    to: "mockUseEffect.mockImplementation(() => {",
  },
  // 未使用変数の削除
  {
    from: /const { screen } = require\('@testing-library\/react'\);/g,
    to: 'const {} = require("@testing-library/react");',
  },
];

// テストファイルを取得
function getTestFiles() {
  const glob = require("glob");
  let files = [];

  testPatterns.forEach((pattern) => {
    try {
      const matches = glob.sync(pattern);
      files = files.concat(matches);
    } catch (error) {
      console.log(`Pattern ${pattern} not found`);
    }
  });

  return [...new Set(files)]; // 重複を除去
}

// ファイルを修正
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    commonFixes.forEach((fix) => {
      if (content.match(fix.from)) {
        content = content.replace(fix.from, fix.to);
        modified = true;
      }
    });

    // Breadcrumbsモックの修正
    if (content.includes("@/components/ui/Breadcrumbs")) {
      content = content.replace(
        /jest\.mock\("@\/components\/ui\/Breadcrumbs"[^}]+}\);/s,
        'jest.mock("@/components/ui/Breadcrumbs", () => ({\n  Breadcrumbs: () => <nav data-testid="breadcrumbs">Breadcrumbs</nav>,\n}), { virtual: true });',
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// メイン処理
function main() {
  console.log("Starting batch test fixes...");

  const testFiles = getTestFiles();
  console.log(`Found ${testFiles.length} test files`);

  let fixedCount = 0;
  testFiles.forEach((file) => {
    if (fixFile(file)) {
      fixedCount++;
    }
  });

  console.log(`Fixed ${fixedCount} files`);

  // 修正後にテストを実行
  console.log("Running tests...");
  try {
    execSync(
      'npm run test:single -- --testPathPattern="src/app/__tests__" --silent --no-coverage',
      {
        stdio: "inherit",
        timeout: 60000,
      },
    );
  } catch (error) {
    console.log("Some tests failed, but continuing...");
  }
}

main();

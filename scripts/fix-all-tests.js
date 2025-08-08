const fs = require("fs");
const glob = require("glob");
const { execSync } = require("child_process");

// 全テストファイルを取得
const testFiles = glob.sync("src/**/__tests__/**/*.test.{ts,tsx}");

console.log(`Found ${testFiles.length} test files to fix`);

// 共通の修正パターン
const fixes = [
  // screen importの修正
  {
    pattern: /import { render } from "@testing-library\/react";/g,
    replacement: 'import { render, screen } from "@testing-library/react";',
    condition: (content) =>
      content.includes("screen.") &&
      !content.includes("import { render, screen }"),
  },
  // 構文エラーの修正
  {
    pattern: /default: \(\((props:[^)]+)\)\)/g,
    replacement: "default: ($1)",
  },
  // any型の修正
  {
    pattern: /\(props: any\)/g,
    replacement: "(props: Record<string, unknown>)",
  },
  // alt属性の修正
  {
    pattern: /<img \{\.\.\.imgProps\} \/>/g,
    replacement: '<img {...imgProps} alt={imgProps.alt || ""} />',
  },
  // require文のeslint-disable
  {
    pattern: /(\s+)(const \w+ = require\()/g,
    replacement:
      "$1// eslint-disable-next-line @typescript-eslint/no-require-imports\n$1$2",
  },
  // module代入のeslint-disable
  {
    pattern: /(\s+)(module\.exports = )/g,
    replacement:
      "$1// eslint-disable-next-line @next/next/no-assign-module-variable\n$1$2",
  },
  // useEffect mockの修正
  {
    pattern: /mockUseEffect\.mockImplementation\(\(fn, deps\) => \{/g,
    replacement: "mockUseEffect.mockImplementation(() => {",
  },
  // 未使用変数の削除
  {
    pattern: /const { unoptimized, \.\.\.imgProps } = props;/g,
    replacement: "const imgProps = props;",
  },
];

let fixedCount = 0;

testFiles.forEach((filePath) => {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    fixes.forEach((fix) => {
      if (fix.condition) {
        if (fix.condition(content)) {
          content = content.replace(fix.pattern, fix.replacement);
          modified = true;
        }
      } else if (fix.pattern.test(content)) {
        content = content.replace(fix.pattern, fix.replacement);
        modified = true;
      }
    });

    // Breadcrumbsモックの修正
    if (
      content.includes("@/components/ui/Breadcrumbs") &&
      !content.includes("{ virtual: true }")
    ) {
      content = content.replace(
        /jest\.mock\("@\/components\/ui\/Breadcrumbs"[^}]+}\);/s,
        'jest.mock("@/components/ui/Breadcrumbs", () => ({\n  Breadcrumbs: () => <nav data-testid="breadcrumbs">Breadcrumbs</nav>,\n}), { virtual: true });',
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      fixedCount++;
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
});

console.log(`\nFixed ${fixedCount} files out of ${testFiles.length}`);

// 主要なテストディレクトリをテスト
const testDirs = [
  "src/app",
  "src/components/ui",
  "src/components/providers",
  "src/hooks",
  "src/lib",
];

console.log("\nRunning tests for main directories...");

testDirs.forEach((dir) => {
  console.log(`\nTesting ${dir}...`);
  try {
    execSync(
      `npx jest --testPathPatterns="${dir}" --silent --no-coverage --runInBand --passWithNoTests`,
      {
        stdio: "inherit",
        timeout: 120000,
      },
    );
    console.log(`✅ ${dir} tests passed`);
  } catch (error) {
    console.log(`❌ ${dir} tests failed`);
  }
});

console.log("\nBatch test fixes completed!");

#!/usr/bin/env node

/**
 * Markdown Reference Fixer
 *
 * このスクリプトは、markdownファイル内の存在しないインデックス参照を検出し、修正します。
 * - image:X, video:X, link:X の参照をportfolio.jsonのデータと照合
 * - 存在しないインデックスを削除または修正
 * - 修正内容をレポート
 */

const fs = require("fs").promises;
const path = require("path");

// 設定
const PORTFOLIO_JSON_PATH = "public/data/content/portfolio.json";
const MARKDOWN_DIR = "public/data/content/markdown/portfolio";

// 正規表現パターン
const EMBED_PATTERNS = {
  IMAGE: /!\[image:(\d+)(?:\s+"([^"]*)")?(?:\s+class="([^"]*)")?\]/g,
  VIDEO: /!\[video:(\d+)(?:\s+"([^"]*)")?(?:\s+class="([^"]*)")?\]/g,
  LINK: /\[link:(\d+)(?:\s+"([^"]*)")?(?:\s+class="([^"]*)")?\]/g,
};

/**
 * portfolio.jsonを読み込む
 */
async function loadPortfolioData() {
  try {
    const data = await fs.readFile(PORTFOLIO_JSON_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading portfolio.json:", error);
    process.exit(1);
  }
}

/**
 * markdownファイルを読み込む
 */
async function loadMarkdownFile(filePath) {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (error) {
    console.error(`Error loading markdown file ${filePath}:`, error);
    return null;
  }
}

/**
 * markdownファイルを保存する
 */
async function saveMarkdownFile(filePath, content) {
  try {
    await fs.writeFile(filePath, content, "utf-8");
    return true;
  } catch (error) {
    console.error(`Error saving markdown file ${filePath}:`, error);
    return false;
  }
}

/**
 * markdownファイル一覧を取得
 */
async function getMarkdownFiles() {
  try {
    const files = await fs.readdir(MARKDOWN_DIR);
    return files
      .filter((file) => file.endsWith(".md"))
      .map((file) => path.join(MARKDOWN_DIR, file));
  } catch (error) {
    console.error("Error reading markdown directory:", error);
    return [];
  }
}

/**
 * portfolio.jsonからアイテムを検索
 */
function findPortfolioItem(portfolioData, markdownPath) {
  const fileName = path.basename(markdownPath);
  const relativePath = `portfolio/${fileName}`;

  return portfolioData.find((item) => item.markdownPath === relativePath);
}

/**
 * embed参照を検証
 */
function validateEmbedReferences(content, portfolioItem) {
  const issues = [];
  const fixes = [];

  if (!portfolioItem) {
    return { issues: ["Portfolio item not found"], fixes: [] };
  }

  const images = portfolioItem.images || [];
  const videos = portfolioItem.videos || [];
  const externalLinks = portfolioItem.externalLinks || [];

  // 画像参照をチェック
  let match;
  const imagePattern = new RegExp(EMBED_PATTERNS.IMAGE.source, "g");
  while ((match = imagePattern.exec(content)) !== null) {
    const index = parseInt(match[1], 10);
    const altText = match[2] || "";
    const classes = match[3] || "";

    if (index >= images.length) {
      issues.push(
        `Image index ${index} not found (available: 0-${images.length - 1})`,
      );

      if (images.length > 0) {
        // 最後の有効なインデックスに修正
        const newIndex = images.length - 1;
        const newRef = `![image:${newIndex}${altText ? ` "${altText}"` : ""}${classes ? ` class="${classes}"` : ""}]`;
        fixes.push({
          type: "image",
          original: match[0],
          fixed: newRef,
          reason: `Index ${index} → ${newIndex} (最後の有効なインデックス)`,
        });
      } else {
        // 画像がない場合は削除
        fixes.push({
          type: "image",
          original: match[0],
          fixed: `<!-- 画像が利用できません: ${altText || `Image ${index}`} -->`,
          reason: "画像データがないため削除",
        });
      }
    }
  }

  // 動画参照をチェック
  const videoPattern = new RegExp(EMBED_PATTERNS.VIDEO.source, "g");
  while ((match = videoPattern.exec(content)) !== null) {
    const index = parseInt(match[1], 10);
    const title = match[2] || "";
    const classes = match[3] || "";

    if (index >= videos.length) {
      issues.push(
        `Video index ${index} not found (available: 0-${videos.length - 1})`,
      );

      if (videos.length > 0) {
        // 最後の有効なインデックスに修正
        const newIndex = videos.length - 1;
        const newRef = `![video:${newIndex}${title ? ` "${title}"` : ""}${classes ? ` class="${classes}"` : ""}]`;
        fixes.push({
          type: "video",
          original: match[0],
          fixed: newRef,
          reason: `Index ${index} → ${newIndex} (最後の有効なインデックス)`,
        });
      } else {
        // 動画がない場合は削除
        fixes.push({
          type: "video",
          original: match[0],
          fixed: `<!-- 動画が利用できません: ${title || `Video ${index}`} -->`,
          reason: "動画データがないため削除",
        });
      }
    }
  }

  // リンク参照をチェック
  const linkPattern = new RegExp(EMBED_PATTERNS.LINK.source, "g");
  while ((match = linkPattern.exec(content)) !== null) {
    const index = parseInt(match[1], 10);
    const text = match[2] || "";
    const classes = match[3] || "";

    if (index >= externalLinks.length) {
      issues.push(
        `Link index ${index} not found (available: 0-${externalLinks.length - 1})`,
      );

      if (externalLinks.length > 0) {
        // 最後の有効なインデックスに修正
        const newIndex = externalLinks.length - 1;
        const newRef = `[link:${newIndex}${text ? ` "${text}"` : ""}${classes ? ` class="${classes}"` : ""}]`;
        fixes.push({
          type: "link",
          original: match[0],
          fixed: newRef,
          reason: `Index ${index} → ${newIndex} (最後の有効なインデックス)`,
        });
      } else {
        // リンクがない場合は削除
        fixes.push({
          type: "link",
          original: match[0],
          fixed: `<!-- リンクが利用できません: ${text || `Link ${index}`} -->`,
          reason: "リンクデータがないため削除",
        });
      }
    }
  }

  return { issues, fixes };
}

/**
 * 修正を適用
 */
function applyFixes(content, fixes) {
  let fixedContent = content;

  for (const fix of fixes) {
    fixedContent = fixedContent.replace(fix.original, fix.fixed);
  }

  return fixedContent;
}

/**
 * メイン処理
 */
async function main() {
  console.log("🔍 Markdown参照の検証と修正を開始します...\n");

  // portfolio.jsonを読み込み
  const portfolioData = await loadPortfolioData();
  console.log(`📊 Portfolio items loaded: ${portfolioData.length}`);

  // markdownファイル一覧を取得
  const markdownFiles = await getMarkdownFiles();
  console.log(`📝 Markdown files found: ${markdownFiles.length}\n`);

  let totalIssues = 0;
  let totalFixes = 0;
  let processedFiles = 0;

  // 各markdownファイルを処理
  for (const filePath of markdownFiles) {
    const content = await loadMarkdownFile(filePath);
    if (!content) continue;

    const portfolioItem = findPortfolioItem(portfolioData, filePath);
    const fileName = path.basename(filePath);

    console.log(`📄 Processing: ${fileName}`);

    if (!portfolioItem) {
      console.log(`   ⚠️  Portfolio item not found for ${fileName}`);
      continue;
    }

    const { issues, fixes } = validateEmbedReferences(content, portfolioItem);

    if (issues.length > 0) {
      console.log(`   ❌ Issues found: ${issues.length}`);
      issues.forEach((issue) => console.log(`      - ${issue}`));
      totalIssues += issues.length;
    }

    if (fixes.length > 0) {
      console.log(`   🔧 Fixes to apply: ${fixes.length}`);
      fixes.forEach((fix) => {
        console.log(`      - ${fix.type}: ${fix.reason}`);
        console.log(`        ${fix.original} → ${fix.fixed}`);
      });

      // 修正を適用
      const fixedContent = applyFixes(content, fixes);
      const saved = await saveMarkdownFile(filePath, fixedContent);

      if (saved) {
        console.log(`   ✅ Fixed and saved`);
        totalFixes += fixes.length;
      } else {
        console.log(`   ❌ Failed to save fixes`);
      }
    } else if (issues.length === 0) {
      console.log(`   ✅ No issues found`);
    }

    processedFiles++;
    console.log("");
  }

  // 結果サマリー
  console.log("📋 修正完了サマリー:");
  console.log(`   処理したファイル: ${processedFiles}`);
  console.log(`   発見した問題: ${totalIssues}`);
  console.log(`   適用した修正: ${totalFixes}`);

  if (totalFixes > 0) {
    console.log("\n✨ 修正が完了しました。変更内容を確認してください。");
  } else {
    console.log("\n🎉 すべてのmarkdownファイルは正常です！");
  }
}

// スクリプト実行
if (require.main === module) {
  main().catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
}

module.exports = {
  validateEmbedReferences,
  applyFixes,
  loadPortfolioData,
  findPortfolioItem,
};

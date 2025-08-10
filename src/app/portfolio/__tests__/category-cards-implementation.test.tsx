/**
 * Test to verify Browse by Category cards implementation
 * Task 8: Update Browse by Category navigation cards
 * - Left-align project counts in category cards
 * - Remove status tags (Complete, Active, etc.) from category cards
 * - Right-align arrows with consistent design across all cards
 * - Implement unified arrow style for all category navigation cards
 */

import { readFile } from "fs/promises";
import { join } from "path";

describe("Browse by Category Cards Implementation", () => {
  let portfolioPageContent: string;

  beforeAll(async () => {
    // Read the portfolio page source code
    const portfolioPagePath = join(process.cwd(), "src/app/portfolio/page.tsx");
    portfolioPageContent = await readFile(portfolioPagePath, "utf-8");
  });

  it("should not include status badge properties in categories array", () => {
    // Check that badge properties are removed from categories
    expect(portfolioPageContent).not.toMatch(/badge:\s*["']Complete["']/);
    expect(portfolioPageContent).not.toMatch(/badge:\s*["']Active["']/);
    expect(portfolioPageContent).not.toMatch(/badge:\s*["']Creative["']/);
    expect(portfolioPageContent).not.toMatch(/badge:\s*["']Artistic["']/);
  });

  it("should not include trend properties in categories array", () => {
    // Check that trend properties are removed from categories
    expect(portfolioPageContent).not.toMatch(/trend:\s*["']up["']/);
    expect(portfolioPageContent).not.toMatch(/trend:\s*["']stable["']/);
    expect(portfolioPageContent).not.toMatch(
      /trend:\s*portfolioStats\.totalProjects/,
    );
  });

  it("should not render status badges in the JSX", () => {
    // Check that status badge rendering is removed
    expect(portfolioPageContent).not.toMatch(/category\.badge\s*&&/);
    expect(portfolioPageContent).not.toMatch(/\{category\.badge\}/);
  });

  it("should not render trend indicators in the JSX", () => {
    // Check that trend indicator rendering is removed
    expect(portfolioPageContent).not.toMatch(
      /category\.trend\s*===\s*["']up["']/,
    );
    expect(portfolioPageContent).not.toMatch(/<TrendingUp/);
  });

  it("should have simplified layout structure for project counts and arrows", () => {
    // Check that the layout is simplified to just project count and arrow
    expect(portfolioPageContent).toMatch(/\{category\.count\}\s*projects/);
    expect(portfolioPageContent).toMatch(/→/);

    // Check that the layout uses justify-between for left-align count and right-align arrow
    expect(portfolioPageContent).toMatch(/justify-between/);
  });

  it("should not import TrendingUp from lucide-react", () => {
    // Check that TrendingUp is not imported since it's no longer used
    expect(portfolioPageContent).not.toMatch(
      /import.*TrendingUp.*from.*lucide-react/,
    );
  });

  it("should have consistent arrow styling", () => {
    // Check that arrows have consistent styling classes
    expect(portfolioPageContent).toMatch(
      /noto-sans-jp-light.*text-xs.*text-foreground/,
    );
    expect(portfolioPageContent).toMatch(/→/);
  });

  it("should maintain proper accessibility attributes", () => {
    // Check that accessibility attributes are maintained
    expect(portfolioPageContent).toMatch(/data-testid=.*filter-/);
    expect(portfolioPageContent).toMatch(/aria-describedby/);
  });
});

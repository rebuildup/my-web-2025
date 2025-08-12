import { render } from "@testing-library/react";
import { redirect } from "next/navigation";
import DataManagerLayout, { metadata } from "../layout";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

describe("DataManagerLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset NODE_ENV to test
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("metadata", () => {
    it("should have correct metadata", () => {
      expect(metadata.title).toBe("Data Manager - samuido | データ管理");
      expect(metadata.description).toContain(
        "開発サーバー専用のコンテンツデータ管理ツール",
      );
      expect(metadata.robots).toBe("noindex, nofollow");
    });
  });

  describe("component rendering", () => {
    it("should render children in development environment", () => {
      // Set NODE_ENV to development
      process.env.NODE_ENV = "development";

      const { container } = render(
        <DataManagerLayout>
          <div data-testid="child-content">Test Content</div>
        </DataManagerLayout>,
      );

      expect(
        container.querySelector('[data-testid="child-content"]'),
      ).toBeInTheDocument();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("should redirect to home in production environment", () => {
      // Set NODE_ENV to production
      process.env.NODE_ENV = "production";

      render(
        <DataManagerLayout>
          <div data-testid="child-content">Test Content</div>
        </DataManagerLayout>,
      );

      expect(mockRedirect).toHaveBeenCalledWith("/");
    });

    it("should redirect to home in test environment", () => {
      // NODE_ENV is already set to test in beforeEach
      render(
        <DataManagerLayout>
          <div data-testid="child-content">Test Content</div>
        </DataManagerLayout>,
      );

      expect(mockRedirect).toHaveBeenCalledWith("/");
    });

    it("should render fragment wrapper", () => {
      process.env.NODE_ENV = "development";

      const { container } = render(
        <DataManagerLayout>
          <div>Child content</div>
        </DataManagerLayout>,
      );

      // The component renders a React fragment, so we check the child is rendered
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("environment detection", () => {
    it("should handle undefined NODE_ENV", () => {
      delete process.env.NODE_ENV;

      render(
        <DataManagerLayout>
          <div>Test</div>
        </DataManagerLayout>,
      );

      expect(mockRedirect).toHaveBeenCalledWith("/");
    });

    it("should handle empty NODE_ENV", () => {
      process.env.NODE_ENV = "";

      render(
        <DataManagerLayout>
          <div>Test</div>
        </DataManagerLayout>,
      );

      expect(mockRedirect).toHaveBeenCalledWith("/");
    });
  });
});

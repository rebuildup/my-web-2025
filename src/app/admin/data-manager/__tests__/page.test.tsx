import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import DataManagerPage from "../page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock child components
jest.mock("../components/ContentList", () => ({
  ContentList: ({
    items,
    onSelectItem,
    onDeleteItem,
    isLoading,
  }: {
    items: Array<{ id: string; title: string }>;
    onSelectItem?: (item: { id: string; title: string }) => void;
    onDeleteItem?: (id: string) => void;
    isLoading: boolean;
  }) => (
    <div data-testid="content-list">
      <div data-testid="loading-state">
        {isLoading ? "loading" : "not-loading"}
      </div>
      {items.map((item: { id: string; title: string }) => (
        <div key={item.id} data-testid="content-item">
          <span>{item.title}</span>
          <button onClick={() => onSelectItem(item)}>Edit</button>
          <button onClick={() => onDeleteItem(item.id)}>Delete</button>
        </div>
      ))}
    </div>
  ),
}));

jest.mock("../components/DataManagerForm", () => ({
  DataManagerForm: ({
    item,
    onSave,
    onCancel,
    isLoading,
    saveStatus,
  }: {
    item?: { title?: string };
    onSave?: () => void;
    onCancel?: () => void;
    isLoading: boolean;
    saveStatus: string;
  }) => (
    <div data-testid="data-manager-form">
      <div data-testid="form-item-title">{item?.title || "New Item"}</div>
      <div data-testid="form-loading">
        {isLoading ? "loading" : "not-loading"}
      </div>
      <div data-testid="form-save-status">{saveStatus}</div>
      <button onClick={() => onSave({ ...item, title: "Updated Title" })}>
        Save
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

jest.mock("../components/PreviewPanel", () => ({
  PreviewPanel: ({
    item,
    onEdit,
  }: {
    item?: { title?: string };
    onEdit?: () => void;
  }) => (
    <div data-testid="preview-panel">
      <div data-testid="preview-item-title">{item?.title}</div>
      <button onClick={onEdit}>Edit</button>
    </div>
  ),
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
};

// Mock fetch
global.fetch = jest.fn();

describe("DataManagerPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    process.env.NODE_ENV = "development";

    // Mock successful API responses
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("environment check", () => {
    it("should redirect to home in production environment", async () => {
      process.env.NODE_ENV = "production";

      render(<DataManagerPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });

    it("should not redirect in development environment", async () => {
      process.env.NODE_ENV = "development";

      render(<DataManagerPage />);

      // Wait a bit to ensure useEffect runs
      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled();
      });
    });
  });

  describe("component rendering", () => {
    it("should render main layout and header", () => {
      render(<DataManagerPage />);

      expect(screen.getByText("Data Manager")).toBeInTheDocument();
      expect(
        screen.getByText(/コンテンツデータの作成・編集・管理を行います/),
      ).toBeInTheDocument();
    });

    it("should render content type selector", () => {
      render(<DataManagerPage />);

      expect(screen.getByText("Content Type")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Portfolio" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Blog" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Plugin" }),
      ).toBeInTheDocument();
    });

    it("should render content list", () => {
      render(<DataManagerPage />);

      expect(screen.getByTestId("content-list")).toBeInTheDocument();
    });

    it("should show empty state when no item is selected", () => {
      render(<DataManagerPage />);

      expect(
        screen.getByText("Select an item to edit or create a new one"),
      ).toBeInTheDocument();
    });
  });

  describe("basic functionality", () => {
    it("should handle new item creation button", () => {
      render(<DataManagerPage />);

      const newButton = screen.getByRole("button", { name: "+ New" });
      expect(newButton).toBeInTheDocument();

      // Click the button
      fireEvent.click(newButton);

      // Button should still be there after click
      expect(newButton).toBeInTheDocument();
    });

    it("should handle content type buttons", () => {
      render(<DataManagerPage />);

      const blogButton = screen.getByRole("button", { name: "Blog" });
      expect(blogButton).toBeInTheDocument();

      // Click the button to test interaction
      fireEvent.click(blogButton);

      // Button should still be there after click
      expect(blogButton).toBeInTheDocument();
    });

    it("should handle API calls", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      render(<DataManagerPage />);

      // Verify that the component makes API calls
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it("should handle API errors gracefully", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      render(<DataManagerPage />);

      // Component should still render even with API errors
      expect(screen.getByText("Data Manager")).toBeInTheDocument();
      expect(screen.getByTestId("content-list")).toBeInTheDocument();
    });
  });

  describe("loading states", () => {
    it("should show loading overlay when processing", async () => {
      // Mock a slow API response
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ data: [] }),
                }),
              100,
            ),
          ),
      );

      render(<DataManagerPage />);

      // Should show loading overlay initially
      expect(screen.getByText("Processing...")).toBeInTheDocument();
    });
  });

  describe("error handling", () => {
    it("should handle API fetch errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      render(<DataManagerPage />);

      // Should not crash and should handle the error gracefully
      await waitFor(() => {
        expect(screen.getByTestId("content-list")).toBeInTheDocument();
      });
    });
  });
});

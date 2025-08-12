import { render, screen } from "@testing-library/react";
import PluginsPage, { metadata } from "../page";

// Mock the Breadcrumbs component
jest.mock("@/components/ui/Breadcrumbs", () => ({
  Breadcrumbs: ({
    items,
  }: {
    items: Array<{ label: string; href?: string; isCurrent?: boolean }>;
  }) => (
    <nav data-testid="breadcrumbs">
      {items.map(
        (
          item: { label: string; href?: string; isCurrent?: boolean },
          index: number,
        ) => (
          <span key={index} data-testid="breadcrumb-item">
            {item.isCurrent ? item.label : <a href={item.href}>{item.label}</a>}
          </span>
        ),
      )}
    </nav>
  ),
}));

// Mock Next.js Link and Image
jest.mock("next/link", () => {
  const MockLink = ({
    href,
    children,
    className,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => {
    return (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    );
  };
  MockLink.displayName = "MockLink";
  return MockLink;
});

jest.mock("next/image", () => {
  const MockImage = ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => {
    return (
      <div data-testid="mock-image" data-src={src} data-alt={alt} {...props} />
    );
  };
  MockImage.displayName = "MockImage";
  return MockImage;
});

// Mock fetch
global.fetch = jest.fn();

describe("PluginsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
  });

  describe("metadata", () => {
    it("should have correct metadata", () => {
      expect(metadata.title).toBe("Plugins - Workshop | samuido");
      expect(metadata.description).toContain(
        "AfterEffects・Premiere Pro プラグインの配布",
      );
      expect(metadata.keywords).toContain("AfterEffects");
      expect(metadata.keywords).toContain("Premiere Pro");
      expect(metadata.robots).toBe("index, follow");
    });

    it("should have correct OpenGraph metadata", () => {
      expect(metadata.openGraph?.title).toBe("Plugins - Workshop | samuido");
      expect(metadata.openGraph?.type).toBe("website");
      expect(metadata.openGraph?.url).toBe(
        "https://yusuke-kim.com/workshop/plugins",
      );
    });

    it("should have correct Twitter metadata", () => {
      expect(metadata.twitter?.card).toBe("summary_large_image");
      expect(metadata.twitter?.creator).toBe("@361do_sleep");
    });
  });

  describe("component rendering with no plugins", () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: [] }),
      });
    });

    it("should render main layout structure", async () => {
      const page = await PluginsPage();
      render(page);

      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("main")).toHaveClass("py-10");
    });

    it("should render breadcrumbs", async () => {
      const page = await PluginsPage();
      render(page);

      const breadcrumbs = screen.getByTestId("breadcrumbs");
      expect(breadcrumbs).toBeInTheDocument();

      const breadcrumbItems = screen.getAllByTestId("breadcrumb-item");
      expect(breadcrumbItems).toHaveLength(3);
      expect(breadcrumbItems[2]).toHaveTextContent("Plugins");
    });

    it("should render page header", async () => {
      const page = await PluginsPage();
      render(page);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Plugins",
      );
      expect(
        screen.getByText(/AfterEffects・Premiere Pro プラグインを無料で配布/),
      ).toBeInTheDocument();
    });

    it("should render stats section", async () => {
      const page = await PluginsPage();
      render(page);

      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("プラグイン")).toBeInTheDocument();
    });

    it("should render empty state", async () => {
      const page = await PluginsPage();
      render(page);

      expect(
        screen.getByText("プラグインはまだ公開されていません"),
      ).toBeInTheDocument();
    });

    it("should render navigation link", async () => {
      const page = await PluginsPage();
      render(page);

      const workshopLink = screen.getByRole("link", { name: /← Workshop/ });
      expect(workshopLink).toBeInTheDocument();
      expect(workshopLink).toHaveAttribute("href", "/workshop");
    });
  });

  describe("component rendering with plugins", () => {
    const mockPlugins = [
      {
        id: "plugin-1",
        title: "AE Color Enhancer",
        description: "After Effects color enhancement plugin",
        status: "published",
        thumbnail: "/ae-plugin-thumbnail.jpg",
        tags: ["aftereffects", "color"],
        downloadInfo: {
          version: "2.1.0",
          downloadCount: 250,
        },
      },
      {
        id: "plugin-2",
        title: "Premiere Transition Pack",
        description: "Smooth transitions for Premiere Pro",
        status: "published",
        tags: ["premiere", "transitions"],
        downloadInfo: {
          downloadCount: 180,
        },
      },
      {
        id: "plugin-3",
        title: "Beta Plugin",
        description: "This should not appear",
        status: "draft",
        tags: [],
        downloadInfo: {
          version: "0.1.0",
          downloadCount: 5,
        },
      },
    ];

    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockPlugins }),
      });
    });

    it("should render published plugins only", async () => {
      const page = await PluginsPage();
      render(page);

      expect(screen.getByText("AE Color Enhancer")).toBeInTheDocument();
      expect(screen.getByText("Premiere Transition Pack")).toBeInTheDocument();
      expect(screen.queryByText("Beta Plugin")).not.toBeInTheDocument();
    });

    it("should render correct stats count", async () => {
      const page = await PluginsPage();
      render(page);

      expect(screen.getByText("2")).toBeInTheDocument(); // Only published items
    });

    it("should render plugin cards with correct links", async () => {
      const page = await PluginsPage();
      render(page);

      const aePluginLink = screen.getByRole("link", {
        name: /AE Color Enhancer/,
      });
      expect(aePluginLink).toHaveAttribute(
        "href",
        "/workshop/plugins/plugin-1",
      );

      const premierePluginLink = screen.getByRole("link", {
        name: /Premiere Transition Pack/,
      });
      expect(premierePluginLink).toHaveAttribute(
        "href",
        "/workshop/plugins/plugin-2",
      );
    });

    it("should render plugin info with version", async () => {
      const page = await PluginsPage();
      render(page);

      expect(screen.getByText("v2.1.0")).toBeInTheDocument();
      expect(screen.getByText("250 ダウンロード")).toBeInTheDocument();
    });

    it("should render plugin info without version", async () => {
      const page = await PluginsPage();
      render(page);

      expect(screen.getByText("v1.0.0")).toBeInTheDocument(); // Default version
      expect(screen.getByText("180 ダウンロード")).toBeInTheDocument();
    });

    it("should render tags", async () => {
      const page = await PluginsPage();
      render(page);

      expect(screen.getByText("aftereffects")).toBeInTheDocument();
      expect(screen.getByText("color")).toBeInTheDocument();
      expect(screen.getByText("premiere")).toBeInTheDocument();
      expect(screen.getByText("transitions")).toBeInTheDocument();
    });

    it("should render thumbnails", async () => {
      const page = await PluginsPage();
      render(page);

      const thumbnail = screen.getByTestId("mock-image");
      expect(thumbnail).toBeInTheDocument();
      expect(thumbnail).toHaveAttribute("data-alt", "AE Color Enhancer");
      expect(thumbnail).toHaveAttribute("data-src", "/ae-plugin-thumbnail.jpg");
    });

    it("should have proper aria-describedby attributes", async () => {
      const page = await PluginsPage();
      render(page);

      const aePluginLink = screen.getByRole("link", {
        name: /AE Color Enhancer/,
      });
      expect(aePluginLink).toHaveAttribute(
        "aria-describedby",
        "plugin-plugin-1-description",
      );

      const description = screen.getByText(
        "After Effects color enhancement plugin",
      );
      expect(description).toHaveAttribute("id", "plugin-plugin-1-description");
    });
  });

  describe("API error handling", () => {
    it("should handle API fetch errors gracefully", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const page = await PluginsPage();
      render(page);

      expect(
        screen.getByText("プラグインはまだ公開されていません"),
      ).toBeInTheDocument();
    });

    it("should handle API response errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const page = await PluginsPage();
      render(page);

      expect(
        screen.getByText("プラグインはまだ公開されていません"),
      ).toBeInTheDocument();
    });

    it("should skip API calls during build without base URL", async () => {
      delete process.env.NEXT_PUBLIC_BASE_URL;
      process.env.NODE_ENV = "production";

      const page = await PluginsPage();
      render(page);

      expect(global.fetch).not.toHaveBeenCalled();
      expect(
        screen.getByText("プラグインはまだ公開されていません"),
      ).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: [] }),
      });
    });

    it("should have proper heading hierarchy", async () => {
      const page = await PluginsPage();
      render(page);

      const h1 = screen.getByRole("heading", { level: 1 });
      const headings = screen.getAllByRole("heading", { level: 2 });

      expect(h1).toHaveTextContent("Plugins");
      expect(headings.some((h) => h.textContent === "プラグイン一覧")).toBe(
        true,
      );
    });

    it("should have proper section labels", async () => {
      const page = await PluginsPage();
      render(page);

      expect(screen.getByLabelText("統計情報")).toBeInTheDocument();
      expect(screen.getByLabelText("プラグイン一覧")).toBeInTheDocument();
    });

    it("should have proper navigation labels", async () => {
      const page = await PluginsPage();
      render(page);

      expect(
        screen.getByRole("navigation", { name: "Site navigation" }),
      ).toBeInTheDocument();
    });

    it("should have screen reader only headings", async () => {
      const page = await PluginsPage();
      render(page);

      const srOnlyHeading = screen.getByText("統計情報");
      expect(srOnlyHeading).toHaveClass("sr-only");
    });
  });

  describe("styling and layout", () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: [] }),
      });
    });

    it("should have correct container classes", async () => {
      const page = await PluginsPage();
      render(page);

      const container = screen
        .getByRole("main")
        .querySelector(".container-system");
      expect(container).toBeInTheDocument();
    });

    it("should have proper spacing classes", async () => {
      const page = await PluginsPage();
      render(page);

      const mainContent = screen.getByRole("main").querySelector(".space-y-10");
      expect(mainContent).toBeInTheDocument();
    });

    it("should have correct header styling", async () => {
      const page = await PluginsPage();
      render(page);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveClass(
        "neue-haas-grotesk-display",
        "text-4xl",
        "text-primary",
      );
    });

    it("should have responsive grid layout", async () => {
      const mockPlugins = [
        {
          id: "plugin-1",
          title: "Test Plugin",
          description: "Test description",
          status: "published",
          tags: [],
          downloadInfo: { downloadCount: 0 },
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockPlugins }),
      });

      const page = await PluginsPage();
      render(page);

      const headings = screen.getAllByRole("heading", { level: 2 });
      const pluginsHeading = headings.find(
        (h) => h.textContent === "プラグイン一覧",
      );
      const gridContainer =
        pluginsHeading?.parentElement?.querySelector(".grid-system");
      expect(gridContainer).toHaveClass("grid-1", "sm:grid-2");
    });
  });

  describe("plugin card styling", () => {
    const mockPlugins = [
      {
        id: "plugin-1",
        title: "Test Plugin",
        description: "Test description",
        status: "published",
        tags: ["test"],
        downloadInfo: { downloadCount: 100 },
      },
    ];

    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockPlugins }),
      });
    });

    it("should have correct card styling", async () => {
      const page = await PluginsPage();
      render(page);

      const pluginCard = screen.getByRole("link", { name: /Test Plugin/ });
      expect(pluginCard).toHaveClass(
        "bg-base",
        "border",
        "border-foreground",
        "block",
        "p-4",
        "space-y-4",
      );
    });

    it("should have correct focus styles", async () => {
      const page = await PluginsPage();
      render(page);

      const pluginCard = screen.getByRole("link", { name: /Test Plugin/ });
      expect(pluginCard).toHaveClass(
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-foreground",
        "focus:ring-offset-2",
        "focus:ring-offset-background",
      );
    });

    it("should have correct tag styling", async () => {
      const page = await PluginsPage();
      render(page);

      const tag = screen.getByText("test");
      expect(tag).toHaveClass(
        "bg-background",
        "border",
        "border-foreground",
        "px-2",
        "py-1",
        "text-xs",
        "noto-sans-jp-light",
      );
    });
  });
});

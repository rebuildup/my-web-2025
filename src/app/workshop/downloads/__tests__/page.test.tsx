import { render, screen } from "@testing-library/react";
import DownloadsPage, { metadata } from "../page";

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

describe("DownloadsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
  });

  describe("metadata", () => {
    it("should have correct metadata", () => {
      expect(metadata.title).toBe("Downloads - Workshop | samuido");
      expect(metadata.description).toContain(
        "テンプレート・素材集・サンプルファイルの配布",
      );
      expect(metadata.keywords).toContain("テンプレート");
      expect(metadata.robots).toBe("index, follow");
    });

    it("should have correct OpenGraph metadata", () => {
      expect(metadata.openGraph?.title).toBe("Downloads - Workshop | samuido");
      expect(metadata.openGraph?.type).toBe("website");
      expect(metadata.openGraph?.url).toBe(
        "https://yusuke-kim.com/workshop/downloads",
      );
    });

    it("should have correct Twitter metadata", () => {
      expect(metadata.twitter?.card).toBe("summary_large_image");
      expect(metadata.twitter?.creator).toBe("@361do_sleep");
    });
  });

  describe("component rendering with no downloads", () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: [] }),
      });
    });

    it("should render main layout structure", async () => {
      const page = await DownloadsPage();
      render(page);

      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("main")).toHaveClass("py-10");
    });

    it("should render breadcrumbs", async () => {
      const page = await DownloadsPage();
      render(page);

      const breadcrumbs = screen.getByTestId("breadcrumbs");
      expect(breadcrumbs).toBeInTheDocument();

      const breadcrumbItems = screen.getAllByTestId("breadcrumb-item");
      expect(breadcrumbItems).toHaveLength(3);
      expect(breadcrumbItems[2]).toHaveTextContent("Downloads");
    });

    it("should render page header", async () => {
      const page = await DownloadsPage();
      render(page);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Downloads",
      );
      expect(
        screen.getByText(/テンプレート・素材集・サンプルファイルを無料で配布/),
      ).toBeInTheDocument();
    });

    it("should render stats section", async () => {
      const page = await DownloadsPage();
      render(page);

      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("素材")).toBeInTheDocument();
    });

    it("should render empty state", async () => {
      const page = await DownloadsPage();
      render(page);

      expect(
        screen.getByText("素材はまだ公開されていません"),
      ).toBeInTheDocument();
    });

    it("should render navigation link", async () => {
      const page = await DownloadsPage();
      render(page);

      const workshopLink = screen.getByRole("link", { name: /← Workshop/ });
      expect(workshopLink).toBeInTheDocument();
      expect(workshopLink).toHaveAttribute("href", "/workshop");
    });
  });

  describe("component rendering with downloads", () => {
    const mockDownloads = [
      {
        id: "download-1",
        title: "Test Template",
        description: "A test template for download",
        status: "published",
        thumbnail: "/test-thumbnail.jpg",
        tags: ["template", "design"],
        downloadInfo: {
          fileType: "zip",
          fileSize: 1024000,
          downloadCount: 150,
        },
      },
      {
        id: "download-2",
        title: "Sample Assets",
        description: "Sample assets collection",
        status: "published",
        tags: ["assets"],
        downloadInfo: {
          fileType: "rar",
          fileSize: 2048000,
          downloadCount: 75,
        },
      },
      {
        id: "download-3",
        title: "Draft Template",
        description: "This should not appear",
        status: "draft",
        tags: [],
        downloadInfo: {
          fileType: "zip",
          fileSize: 512000,
          downloadCount: 0,
        },
      },
    ];

    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockDownloads }),
      });
    });

    it("should render published downloads only", async () => {
      const page = await DownloadsPage();
      render(page);

      expect(screen.getByText("Test Template")).toBeInTheDocument();
      expect(screen.getByText("Sample Assets")).toBeInTheDocument();
      expect(screen.queryByText("Draft Template")).not.toBeInTheDocument();
    });

    it("should render correct stats count", async () => {
      const page = await DownloadsPage();
      render(page);

      expect(screen.getByText("2")).toBeInTheDocument(); // Only published items
    });

    it("should render download cards with correct links", async () => {
      const page = await DownloadsPage();
      render(page);

      const templateLink = screen.getByRole("link", { name: /Test Template/ });
      expect(templateLink).toHaveAttribute(
        "href",
        "/workshop/downloads/download-1",
      );

      const assetsLink = screen.getByRole("link", { name: /Sample Assets/ });
      expect(assetsLink).toHaveAttribute(
        "href",
        "/workshop/downloads/download-2",
      );
    });

    it("should render download info", async () => {
      const page = await DownloadsPage();
      render(page);

      expect(screen.getByText("ZIP • 1000 KB")).toBeInTheDocument();
      expect(screen.getByText("150 ダウンロード")).toBeInTheDocument();
      expect(screen.getByText("RAR • 1.95 MB")).toBeInTheDocument();
      expect(screen.getByText("75 ダウンロード")).toBeInTheDocument();
    });

    it("should render tags", async () => {
      const page = await DownloadsPage();
      render(page);

      expect(screen.getByText("template")).toBeInTheDocument();
      expect(screen.getByText("design")).toBeInTheDocument();
      expect(screen.getByText("assets")).toBeInTheDocument();
    });

    it("should render thumbnails", async () => {
      const page = await DownloadsPage();
      render(page);

      const thumbnail = screen.getByTestId("mock-image");
      expect(thumbnail).toBeInTheDocument();
      expect(thumbnail).toHaveAttribute("data-alt", "Test Template");
      expect(thumbnail).toHaveAttribute("data-src", "/test-thumbnail.jpg");
    });
  });

  describe("file size formatting", () => {
    it("should format file sizes correctly", async () => {
      const mockDownloads = [
        {
          id: "test-1",
          title: "Test 1",
          description: "Test",
          status: "published",
          tags: [],
          downloadInfo: { fileType: "zip", fileSize: 0, downloadCount: 0 },
        },
        {
          id: "test-2",
          title: "Test 2",
          description: "Test",
          status: "published",
          tags: [],
          downloadInfo: { fileType: "zip", fileSize: 1024, downloadCount: 0 },
        },
        {
          id: "test-3",
          title: "Test 3",
          description: "Test",
          status: "published",
          tags: [],
          downloadInfo: {
            fileType: "zip",
            fileSize: 1048576,
            downloadCount: 0,
          },
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockDownloads }),
      });

      const page = await DownloadsPage();
      render(page);

      expect(screen.getByText("ZIP • 0 Bytes")).toBeInTheDocument();
      expect(screen.getByText("ZIP • 1 KB")).toBeInTheDocument();
      expect(screen.getByText("ZIP • 1 MB")).toBeInTheDocument();
    });
  });

  describe("API error handling", () => {
    it("should handle API fetch errors gracefully", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const page = await DownloadsPage();
      render(page);

      expect(
        screen.getByText("素材はまだ公開されていません"),
      ).toBeInTheDocument();
    });

    it("should handle API response errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const page = await DownloadsPage();
      render(page);

      expect(
        screen.getByText("素材はまだ公開されていません"),
      ).toBeInTheDocument();
    });

    it("should skip API calls during build without base URL", async () => {
      delete process.env.NEXT_PUBLIC_BASE_URL;
      process.env.NODE_ENV = "production";

      const page = await DownloadsPage();
      render(page);

      expect(global.fetch).not.toHaveBeenCalled();
      expect(
        screen.getByText("素材はまだ公開されていません"),
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
      const page = await DownloadsPage();
      render(page);

      const h1 = screen.getByRole("heading", { level: 1 });
      const headings = screen.getAllByRole("heading", { level: 2 });

      expect(h1).toHaveTextContent("Downloads");
      expect(headings.some((h) => h.textContent === "素材一覧")).toBe(true);
    });

    it("should have proper section labels", async () => {
      const page = await DownloadsPage();
      render(page);

      expect(screen.getByLabelText("統計情報")).toBeInTheDocument();
      expect(screen.getByLabelText("素材一覧")).toBeInTheDocument();
    });

    it("should have proper navigation labels", async () => {
      const page = await DownloadsPage();
      render(page);

      expect(
        screen.getByRole("navigation", { name: "Site navigation" }),
      ).toBeInTheDocument();
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
      const page = await DownloadsPage();
      render(page);

      const container = screen
        .getByRole("main")
        .querySelector(".container-system");
      expect(container).toBeInTheDocument();
    });

    it("should have proper spacing classes", async () => {
      const page = await DownloadsPage();
      render(page);

      const mainContent = screen.getByRole("main").querySelector(".space-y-10");
      expect(mainContent).toBeInTheDocument();
    });

    it("should have correct header styling", async () => {
      const page = await DownloadsPage();
      render(page);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveClass(
        "neue-haas-grotesk-display",
        "text-4xl",
        "text-primary",
      );
    });
  });
});

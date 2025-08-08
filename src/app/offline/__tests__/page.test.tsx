import { render, screen } from "@testing-library/react";
import React from "react";
import OfflinePage, { metadata } from "../page";

// Mock the OfflinePageClient component
jest.mock("../components/OfflinePageClient", () => {
  const MockOfflinePageClient = () => (
    <div data-testid="offline-page-client">
      <h1>オフライン</h1>
      <p>インターネット接続を確認してください。</p>
      <p>一部のツールはオフラインでも利用可能です。</p>
    </div>
  );
  MockOfflinePageClient.displayName = "MockOfflinePageClient";
  return MockOfflinePageClient;
});

describe("OfflinePage", () => {
  it("renders the OfflinePageClient component", () => {
    render(<OfflinePage />);

    expect(screen.getByTestId("offline-page-client")).toBeInTheDocument();
    expect(screen.getByText("オフライン")).toBeInTheDocument();
    expect(
      screen.getByText("インターネット接続を確認してください。"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("一部のツールはオフラインでも利用可能です。"),
    ).toBeInTheDocument();
  });

  it("is a server component that renders client component", () => {
    // Test that the component renders without client-side hooks
    const { container } = render(<OfflinePage />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe("OfflinePage Metadata", () => {
  it("exports correct metadata object", () => {
    expect(metadata).toBeDefined();
    expect(metadata.title).toBe("オフライン - samuido");
    expect(metadata.description).toBe(
      "インターネット接続を確認してください。一部のツールはオフラインでも利用可能です。",
    );
    expect(metadata.robots).toBe("noindex, nofollow");
  });

  it("includes noindex, nofollow robots directive", () => {
    // Offline pages should not be indexed by search engines
    expect(metadata.robots).toBe("noindex, nofollow");
  });

  it("has appropriate title for offline state", () => {
    expect(metadata.title).toContain("オフライン");
    expect(metadata.title).toContain("samuido");
  });

  it("has descriptive message about offline functionality", () => {
    expect(metadata.description).toContain("インターネット接続を確認");
    expect(metadata.description).toContain("オフラインでも利用可能");
  });
});

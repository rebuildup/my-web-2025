import { render, screen } from "@testing-library/react";
import Search from "../page";

// Mock useSearchParams
jest.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: jest.fn(() => null),
  }),
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe("Search Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the search page", () => {
    render(<Search />);

    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(
      screen.getByText(/サイト内のコンテンツを検索できます/),
    ).toBeInTheDocument();
  });

  it("renders search form elements", () => {
    render(<Search />);

    expect(
      screen.getByPlaceholderText("検索キーワードを入力..."),
    ).toBeInTheDocument();
    expect(screen.getByText("シンプル")).toBeInTheDocument();
    expect(screen.getByText("詳細")).toBeInTheDocument();
    expect(screen.getByText("フィルター")).toBeInTheDocument();
  });

  it("shows initial empty state", () => {
    render(<Search />);

    expect(
      screen.getByText("検索キーワードを入力してください"),
    ).toBeInTheDocument();
  });
});

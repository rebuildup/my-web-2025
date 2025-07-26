import { render, screen } from "@testing-library/react";
import SequentialPngPreviewPage from "../page";

// Mock the SequentialPngPreview component
jest.mock("../components/SequentialPngPreview", () => {
  return function MockSequentialPngPreview() {
    return (
      <div data-testid="sequential-png-preview">
        Sequential PNG Preview Component
      </div>
    );
  };
});

describe("SequentialPngPreviewPage", () => {
  it("renders the page with correct title and description", () => {
    render(<SequentialPngPreviewPage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Sequential PNG Preview",
    );
    expect(
      screen.getByText(/連番PNGファイルをアニメーションとしてプレビュー/),
    ).toBeInTheDocument();
  });

  it("renders the SequentialPngPreview component", () => {
    render(<SequentialPngPreviewPage />);

    expect(screen.getByTestId("sequential-png-preview")).toBeInTheDocument();
  });

  it("has proper container structure", () => {
    render(<SequentialPngPreviewPage />);

    const container = screen
      .getByRole("heading", { level: 1 })
      .closest(".container-system");
    expect(container).toBeInTheDocument();
  });
});

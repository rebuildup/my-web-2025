import { render, screen } from "@testing-library/react";
import { BreadcrumbWrapper } from "../BreadcrumbWrapper";

// Mock the Breadcrumb component
jest.mock("../Breadcrumb", () => ({
  Breadcrumb: () => <nav data-testid="breadcrumb">Mocked Breadcrumb</nav>,
}));

describe("BreadcrumbWrapper", () => {
  it("should render breadcrumb wrapper", () => {
    render(<BreadcrumbWrapper />);

    expect(screen.getByTestId("breadcrumb")).toBeInTheDocument();
  });

  it("should apply correct container classes", () => {
    render(<BreadcrumbWrapper />);

    const container = screen.getByTestId("breadcrumb").parentElement;
    expect(container).toHaveClass("container-system", "pt-8");
  });
});

import { render, screen } from "@testing-library/react";
import Home from "../page";

describe("Home", () => {
  it("renders the main page content", () => {
    render(<Home />);

    // Check for key elements using partial text matching
    expect(screen.getByText(/Get started by editing/)).toBeInTheDocument();
    expect(
      screen.getByText("Save and see your changes instantly.")
    ).toBeInTheDocument();
    expect(screen.getByText("Deploy now")).toBeInTheDocument();
    expect(screen.getByText("Read our docs")).toBeInTheDocument();
  });

  it("renders the Next.js logo", () => {
    render(<Home />);

    const logo = screen.getByAltText("Next.js logo");
    expect(logo).toBeInTheDocument();
  });
});

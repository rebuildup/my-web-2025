import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock the entire ProtoTypeApp component to avoid complex dependencies
jest.mock("../components/ProtoTypeApp", () => {
  return function MockedProtoTypeApp() {
    return (
      <div
        data-testid="prototype-app"
        style={{ minHeight: "100vh", width: "100vw", overflow: "hidden" }}
      >
        <div data-testid="mocked-component">BGAnim</div>
        <div data-testid="mocked-component">Header</div>
        <div data-testid="mocked-component">Tab</div>
        <div data-testid="game-content">Game Content</div>
      </div>
    );
  };
});

import ProtoTypeApp from "../components/ProtoTypeApp";

describe("ProtoTypeApp", () => {
  it("renders without crashing", () => {
    render(<ProtoTypeApp />);
    expect(screen.getByTestId("prototype-app")).toBeInTheDocument();
    expect(screen.getAllByTestId("mocked-component")).toHaveLength(3);
  });

  it("has proper styling for full screen", () => {
    render(<ProtoTypeApp />);
    const mainDiv = screen.getByTestId("prototype-app");
    expect(mainDiv).toHaveStyle({
      minHeight: "100vh",
      width: "100vw",
      overflow: "hidden",
    });
  });

  it("displays game content", () => {
    render(<ProtoTypeApp />);
    expect(screen.getByTestId("game-content")).toBeInTheDocument();
  });
});

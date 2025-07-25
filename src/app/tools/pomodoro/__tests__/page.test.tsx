import { render, screen } from "@testing-library/react";
import PomodoroPage from "../page";

// Mock the PomodoroTimer component
jest.mock("../components/PomodoroTimer", () => {
  return function MockPomodoroTimer() {
    return <div data-testid="pomodoro-timer">Pomodoro Timer Component</div>;
  };
});

describe("PomodoroPage", () => {
  it("renders the page with correct title and description", () => {
    render(<PomodoroPage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Pomodoro Timer"
    );
    expect(
      screen.getByText(/シンプルなポモドーロタイマー/)
    ).toBeInTheDocument();
  });

  it("renders the PomodoroTimer component", () => {
    render(<PomodoroPage />);

    expect(screen.getByTestId("pomodoro-timer")).toBeInTheDocument();
  });

  it("has proper container structure", () => {
    render(<PomodoroPage />);

    const container = screen
      .getByRole("heading", { level: 1 })
      .closest(".container-system");
    expect(container).toBeInTheDocument();
  });
});

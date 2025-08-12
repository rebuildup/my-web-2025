import { render, screen } from "@testing-library/react";
import { GADebug } from "../ga-debug";

// Mock process.env
const originalEnv = process.env;

describe("GADebug", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should not render in production environment", () => {
    process.env.NODE_ENV = "production";

    const { container } = render(<GADebug />);

    expect(container.firstChild).toBeNull();
  });

  it("should render debug panel in development", () => {
    process.env.NODE_ENV = "development";

    render(<GADebug />);

    expect(screen.getByText(/google analytics debug/i)).toBeInTheDocument();
  });

  it("should display GA ID", () => {
    process.env.NODE_ENV = "development";

    render(<GADebug />);

    expect(screen.getByText(/GA ID:/)).toBeInTheDocument();
  });

  it("should show status indicators", () => {
    process.env.NODE_ENV = "development";

    render(<GADebug />);

    expect(screen.getByText(/Gtag:/)).toBeInTheDocument();
    expect(screen.getByText(/Consent:/)).toBeInTheDocument();
  });

  it("should have proper styling", () => {
    process.env.NODE_ENV = "development";

    const { container } = render(<GADebug />);

    const debugPanel = container.firstChild as HTMLElement;
    expect(debugPanel).toHaveClass("fixed");
    expect(debugPanel).toHaveClass("text-white");
  });
});

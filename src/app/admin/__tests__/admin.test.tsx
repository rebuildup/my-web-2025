import { render, screen } from "@testing-library/react";
import { redirect } from "next/navigation";
import AdminPage from "../page";

// Mock Next.js redirect
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

// Mock environment variables
const mockEnv = (env: string) => {
  const originalEnv = process.env.NODE_ENV;
  Object.defineProperty(process.env, "NODE_ENV", {
    value: env,
    writable: true,
    configurable: true,
  });
  return () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalEnv,
      writable: true,
      configurable: true,
    });
  };
};

describe("Admin Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Development Environment", () => {
    it("should render admin dashboard in development environment", () => {
      const restoreEnv = mockEnv("development");

      render(<AdminPage />);

      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
      expect(
        screen.getByText(/開発環境専用の管理パネルです/),
      ).toBeInTheDocument();
      expect(screen.getAllByText(/Development Mode/)).toHaveLength(2);

      restoreEnv();
    });

    it("should display system status information", () => {
      const restoreEnv = mockEnv("development");

      render(<AdminPage />);

      expect(screen.getByText("System Status")).toBeInTheDocument();
      expect(screen.getByText("Environment")).toBeInTheDocument();
      expect(screen.getByText("Node.js")).toBeInTheDocument();
      expect(screen.getByText("Uptime")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();

      restoreEnv();
    });

    it("should display admin function cards", () => {
      const restoreEnv = mockEnv("development");

      render(<AdminPage />);

      expect(screen.getByText("Data Manager")).toBeInTheDocument();
      expect(screen.getByText("File Management")).toBeInTheDocument();
      expect(screen.getByText("OGP & Favicon")).toBeInTheDocument();
      expect(screen.getByText("Content Processing")).toBeInTheDocument();
      expect(screen.getByText("Analytics")).toBeInTheDocument();
      expect(screen.getByText("System Tools")).toBeInTheDocument();

      restoreEnv();
    });

    it("should have working data manager link", () => {
      const restoreEnv = mockEnv("development");

      render(<AdminPage />);

      const dataManagerLink = screen.getByRole("link", {
        name: /Data Manager/,
      });
      expect(dataManagerLink).toHaveAttribute("href", "/admin/data-manager");

      restoreEnv();
    });

    it("should display security notice", () => {
      const restoreEnv = mockEnv("development");

      render(<AdminPage />);

      expect(screen.getByText("Security Notice")).toBeInTheDocument();
      expect(
        screen.getByText("Development Environment Only"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /This admin panel is only accessible in development mode/,
        ),
      ).toBeInTheDocument();

      restoreEnv();
    });
  });

  describe("Production Environment", () => {
    it("should redirect to home page in production environment", () => {
      const restoreEnv = mockEnv("production");

      render(<AdminPage />);

      expect(redirect).toHaveBeenCalledWith("/");

      restoreEnv();
    });

    it("should redirect to home page in test environment", () => {
      const restoreEnv = mockEnv("test");

      render(<AdminPage />);

      expect(redirect).toHaveBeenCalledWith("/");

      restoreEnv();
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      const restoreEnv = mockEnv("development");

      render(<AdminPage />);

      const mainHeading = screen.getByRole("heading", { level: 1 });
      expect(mainHeading).toHaveTextContent("Admin Dashboard");

      restoreEnv();
    });

    it("should have accessible card titles", () => {
      const restoreEnv = mockEnv("development");

      render(<AdminPage />);

      const cardTitles = screen.getAllByRole("heading", { level: 3 });
      expect(cardTitles.length).toBeGreaterThan(0);

      restoreEnv();
    });

    it("should have proper link accessibility", () => {
      const restoreEnv = mockEnv("development");

      render(<AdminPage />);

      const backLink = screen.getByRole("link", {
        name: "← Back to Main Site",
      });
      expect(backLink).toHaveAttribute("href", "/");

      restoreEnv();
    });
  });

  describe("System Status", () => {
    it("should display current environment", () => {
      render(<AdminPage />);

      // In test environment, it should show "test"
      expect(screen.getByText("test")).toBeInTheDocument();
    });

    it("should display Node.js version", () => {
      const restoreEnv = mockEnv("development");

      render(<AdminPage />);

      expect(screen.getByText(process.version)).toBeInTheDocument();

      restoreEnv();
    });

    it("should display online status", () => {
      const restoreEnv = mockEnv("development");

      render(<AdminPage />);

      expect(screen.getByText("Online")).toBeInTheDocument();

      restoreEnv();
    });
  });
});

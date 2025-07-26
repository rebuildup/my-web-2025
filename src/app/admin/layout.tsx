import { redirect } from "next/navigation";
import type { Metadata } from "next";

// Development environment check
function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

export const metadata: Metadata = {
  title: "Admin Dashboard - samuido",
  description: "Development environment administration panel",
  robots: "noindex, nofollow", // Prevent indexing of admin pages
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirect if not in development environment
  if (!isDevelopment()) {
    redirect("/");
  }

  return (
    <div className="admin-layout">
      {/* Development environment indicator */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-accent text-background text-center py-2 noto-sans-jp-regular text-sm">
        🚧 DEVELOPMENT MODE - Admin Panel
      </div>

      {/* Main content with top padding for the indicator */}
      <div className="pt-12">{children}</div>
    </div>
  );
}

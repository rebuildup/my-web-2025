import "../globals.css";
import type { ReactNode } from "react";
import { MUIThemeProvider } from "@/lib/theme";
import { AdminShell } from "@/components/admin/layout/AdminShell";

export const dynamic = "force-dynamic";

/**
 * Admin layout - nested layout that does not include html/body tags
 * (those are only in the root layout at src/app/layout.tsx)
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <MUIThemeProvider>
            <AdminShell>{children}</AdminShell>
        </MUIThemeProvider>
    );
}

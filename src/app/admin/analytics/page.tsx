"use client";

import { Box, Typography, Paper } from "@mui/material";
import { PageHeader } from "@/components/admin/layout";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
    return (
        <Box sx={{ display: "grid", gap: 4 }}>
            <PageHeader 
                title="アクセス解析" 
                description="コンテンツのパフォーマンスと利用状況を可視化します。" 
                breadcrumbs={[
                    { label: "Admin", href: "/admin" },
                    { label: "アクセス解析", href: "/admin/analytics" },
                ]}
            />
            <Paper sx={{ p: 8, textAlign: "center", borderStyle: "dashed", borderColor: "divider" }} variant="outlined">
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2, color: "text.secondary" }}>
                    <BarChart3 size={48} />
                </Box>
                <Typography variant="h5" gutterBottom fontWeight={600} color="text.secondary">
                    Under Construction
                </Typography>
                <Typography color="text.secondary">
                    この機能は現在開発中です。
                </Typography>
            </Paper>
        </Box>
    );
}

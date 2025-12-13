"use client";

import { Box, Typography, Paper } from "@mui/material";
import { PageHeader } from "@/components/admin/layout";
import { Tags } from "lucide-react";

export default function TagManagementPage() {
    return (
        <Box sx={{ display: "grid", gap: 4 }}>
            <PageHeader 
                title="タグ管理" 
                description="タグの一括編集と整理で分類精度を向上させます。" 
                breadcrumbs={[
                    { label: "Admin", href: "/admin" },
                    { label: "タグ管理", href: "/admin/tag-management" },
                ]}
            />
            <Paper sx={{ p: 8, textAlign: "center", borderStyle: "dashed", borderColor: "divider" }} variant="outlined">
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2, color: "text.secondary" }}>
                    <Tags size={48} />
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

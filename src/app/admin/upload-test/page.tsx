"use client";

import { Box, Typography, Paper } from "@mui/material";
import { PageHeader } from "@/components/admin/layout";
import { UploadCloud } from "lucide-react";

export default function UploadTestPage() {
    return (
        <Box sx={{ display: "grid", gap: 4 }}>
            <PageHeader 
                title="アップロードテスト" 
                description="ファイルアップロード機能の動作確認を行います。" 
                breadcrumbs={[
                    { label: "Admin", href: "/admin" },
                    { label: "アップロードテスト", href: "/admin/upload-test" },
                ]}
            />
            <Paper sx={{ p: 8, textAlign: "center", borderStyle: "dashed", borderColor: "divider" }} variant="outlined">
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2, color: "text.secondary" }}>
                    <UploadCloud size={48} />
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

"use client";

import { Alert, Stack } from "@mui/material";
import { BlockToolbar } from "@/components/admin/page-editor/editor/BlockToolbar";
import type { ToastMessage } from "./types";

export interface EditorToolbarProps {
 onSave: () => void;
 isSaving: boolean;
 lastSaved: Date | null;
 hasUnsavedChanges: boolean;
 toast: ToastMessage | null;
}

export function EditorToolbar({
 onSave,
 isSaving,
 lastSaved,
 hasUnsavedChanges,
 toast,
}: EditorToolbarProps) {
 return (
 <Stack spacing={2}>
 <BlockToolbar
 onSave={onSave}
 isSaving={isSaving}
 lastSaved={lastSaved}
 hasUnsavedChanges={hasUnsavedChanges}
 />
 {toast && (
 <Alert severity={toast.type} variant="outlined">
 {toast.text}
 </Alert>
 )}
 </Stack>
 );
}

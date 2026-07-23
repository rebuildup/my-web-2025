"use client";

import { EditorLayout } from "@/components/admin/page-editor/layout/EditorLayout";
import { BlockLibrary } from "@/components/admin/page-editor/panels/BlockLibrary";
import { EditorCanvas } from "./editor-canvas";
import { EditorSidebar } from "./editor-sidebar";
import { EditorToolbar } from "./editor-toolbar";
import { usePageEditor } from "./use-page-editor";

export default function PageEditorHome() {
 const editor = usePageEditor();

 return (
 <EditorLayout
 sidebar={
 <EditorSidebar
 selectedContentId={editor.selectedContentId}
 onSelectContent={(value) => {
 editor.setSelectedContentId(value);
 editor.resetEditor();
 }}
 pages={editor.pages}
 selectedPage={editor.page}
 pagesLoading={editor.pagesLoading}
 onSelectPage={editor.handleSelectPage}
 onEditMeta={editor.handleEditMeta}
 onCreatePage={editor.handleCreatePage}
 media={editor.media}
 mediaLoading={editor.mediaLoading}
 onRefreshMedia={() => {
 if (editor.selectedContentId) {
 void editor.loadMedia(editor.selectedContentId);
 }
 }}
 onDeletePage={editor.handleDeletePage}
 />
 }
 editor={
 <EditorCanvas
 editorId={editor.editorId}
 blocks={editor.blocks}
 applyBlocks={editor.applyBlocks}
 onSelectBlock={editor.setActiveBlockId}
 contentId={editor.selectedContentId}
 />
 }
 rightPanel={<BlockLibrary onInsertBlock={editor.handleInsertBlock} />}
 toolbar={
 <EditorToolbar
 onSave={editor.handleManualSave}
 isSaving={editor.toolbarState.isSaving}
 lastSaved={editor.toolbarState.lastSaved}
 hasUnsavedChanges={editor.toolbarState.hasUnsavedChanges}
 toast={editor.toast}
 />
 }
 />
 );
}

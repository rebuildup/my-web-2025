"use client";

import { Alert, Button, Stack } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BlockEditor } from "@/components/admin/page-editor/editor/BlockEditor";
import { BlockToolbar } from "@/components/admin/page-editor/editor/BlockToolbar";
import { EditorLayout } from "@/components/admin/page-editor/layout/EditorLayout";
import { Sidebar } from "@/components/admin/page-editor/layout/Sidebar";
import { ArticleList } from "@/components/admin/page-editor/panels/ArticleList";
import { BlockLibrary } from "@/components/admin/page-editor/panels/BlockLibrary";
import { ContentSelector } from "@/components/admin/page-editor/panels/ContentSelector";
import { MediaManager } from "@/components/admin/page-editor/panels/MediaManager";
import {
  createMarkdownPage,
  deleteMarkdownPage,
  fetchMarkdownPage,
  fetchMarkdownPages,
  updateMarkdownPage,
} from "@/cms/page-editor/lib/api/markdown";
import { fetchMediaList } from "@/cms/page-editor/lib/api/media";
import { convertMarkdownToBlocks } from "@/cms/page-editor/lib/conversion";
import { createInitialBlock } from "@/cms/page-editor/lib/editor/factory";
import { useAutoSave, useEditorState } from "@/cms/page-editor/lib/editor/state";
import { normalizeSlug } from "@/cms/page-editor/lib/utils/validation";
import type { Block, BlockType } from "@/cms/types/blocks";
import type { MarkdownPage } from "@/cms/types/markdown";
import type { MediaItem } from "@/cms/types/media";

// SSR/CSR で ID が変わるとハイドレーション不一致が発生するため、
// 初期ブロックは固定 ID で定義して安定化させる
const INITIAL_BLOCKS: Block[] = [
  {
    id: "initial-paragraph",
    type: "paragraph",
    content: "",
    attributes: {},
  },
];

interface ToastMessage {
  type: "success" | "error";
  text: string;
}

export default function PageEditorHome() {
  const [selectedContentId, setSelectedContentId] = useState("");
  const [pages, setPages] = useState<MarkdownPage[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  const {
    editorId,
    page,
    setPage,
    blocks,
    updateBlocks,
    applyBlocks,
    markdown,
    hasChanges,
    setHasChanges,
    reset,
  } = useEditorState({ initialBlocks: INITIAL_BLOCKS });

  const autoSave = useAutoSave({
    contentId: selectedContentId,
    pageId: page?.id ?? "",
    markdown,
    enabled: Boolean(selectedContentId && page?.id),
  });

  const showMessage = useCallback((message: ToastMessage) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadPages = useCallback(
    async (contentId: string) => {
      console.log("[PageEditor] Loading pages for contentId:", contentId);
      setPagesLoading(true);
      const data = await fetchMarkdownPages(contentId).catch((error) => {
        console.error("[PageEditor] Failed to load pages", error);
        showMessage({
          type: "error",
          text: `Failed to load pages: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
        setPagesLoading(false);
        return null;
      });
      if (data === null) return;
      console.log("[PageEditor] Pages loaded:", data);
      setPages(
        data.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        ),
      );
      setPagesLoading(false);
    },
    [showMessage],
  );

  const loadMedia = useCallback(
    async (contentId: string) => {
      if (!contentId) {
        setMedia([]);
        return;
      }
      console.log("[PageEditor] Loading media for contentId:", contentId);
      setMediaLoading(true);
      const items = await fetchMediaList(contentId).catch((error) => {
        console.error("[PageEditor] Failed to load media", error);
        showMessage({
          type: "error",
          text: `Failed to load media: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
        setMediaLoading(false);
        return null;
      });
      if (items === null) return;
      console.log("[PageEditor] Media loaded:", items);
      setMedia(items);
      setMediaLoading(false);
    },
    [showMessage],
  );

  const resetEditor = useCallback(() => {
    setPage(null);
    updateBlocks(INITIAL_BLOCKS);
    setActiveBlockId(null);
    setHasChanges(false);
  }, [setPage, updateBlocks, setHasChanges]);

  useEffect(() => {
    if (!selectedContentId) {
      setPages([]);
      setMedia([]);
      resetEditor();
      return;
    }
    void loadPages(selectedContentId);
    void loadMedia(selectedContentId);
  }, [selectedContentId, loadPages, loadMedia, resetEditor]);

  const handleSelectPage = useCallback(
    async (targetPage: MarkdownPage) => {
      const detail = await fetchMarkdownPage(targetPage.id).catch((error) => {
        console.error("Failed to load page detail", error);
        showMessage({ type: "error", text: "Failed to load the page." });
        return null;
      });
      if (detail === null) return;
      const value = convertMarkdownToBlocks(detail.body ?? "");
      reset(detail, value);
      setActiveBlockId(value[0]?.id ?? null);
    },
    [reset, showMessage],
  );

  const handleManualSave = useCallback(async () => {
    if (!selectedContentId || !page) {
      showMessage({ type: "error", text: "Select a page before saving." });
      return;
    }

    const result = await updateMarkdownPage({
      id: page.id,
      contentId: selectedContentId,
      slug: page.slug,
      frontmatter: page.frontmatter,
      body: markdown,
      updatedAt: new Date().toISOString(),
    }).catch((error) => {
      console.error("Manual save failed", error);
      showMessage({ type: "error", text: "Failed to save changes." });
      return null;
    });
    if (result === null) return;
    setHasChanges(false);
    showMessage({ type: "success", text: "Saved successfully." });
    void loadPages(selectedContentId);
  }, [
    selectedContentId,
    page,
    markdown,
    setHasChanges,
    showMessage,
    loadPages,
  ]);

  const handleCreatePage = useCallback(async () => {
    if (!selectedContentId) {
      showMessage({ type: "error", text: "Select a content space first." });
      return;
    }

    const title = window.prompt("Enter a title for the new page");
    if (!title) {
      return;
    }
    const defaultSlug = normalizeSlug(title);
    const slugInput = window.prompt("Enter a slug", defaultSlug);
    if (slugInput === null) {
      return;
    }
    const slug = normalizeSlug(slugInput) || defaultSlug;

    const now = new Date().toISOString();
    const response = await createMarkdownPage({
      contentId: selectedContentId,
      slug,
      frontmatter: {
        title,
        slug,
        updated: now,
        draft: true,
      },
      body: "",
      createdAt: now,
      updatedAt: now,
    }).catch((error) => {
      console.error("Failed to create page", error);
      showMessage({ type: "error", text: "Failed to create page." });
      return null;
    });
    if (response === null) return;

    await loadPages(selectedContentId);
    const newPageId = response.page?.id ?? response.id;
    if (newPageId) {
      const detail = await fetchMarkdownPage(newPageId).catch(() => null);
      if (detail === null) return;
      const value = convertMarkdownToBlocks(detail.body ?? "");
      reset(detail, value);
      setActiveBlockId(value[0]?.id ?? null);
      showMessage({ type: "success", text: "Created a new page." });
    }
  }, [selectedContentId, loadPages, reset, showMessage]);

  const handleEditMeta = useCallback(
    async (target: MarkdownPage) => {
      const title = window.prompt("Page title", target.frontmatter.title ?? "");
      if (title === null) {
        return;
      }
      const slugInput = window.prompt("Slug", target.slug);
      if (slugInput === null) {
        return;
      }
      const slug = normalizeSlug(slugInput) || target.slug;

      const result = await updateMarkdownPage({
        id: target.id,
        contentId: target.contentId ?? selectedContentId,
        slug,
        frontmatter: {
          ...target.frontmatter,
          title,
          slug,
        },
      }).catch((error) => {
        console.error("Failed to update metadata", error);
        showMessage({ type: "error", text: "Failed to update metadata." });
        return null;
      });
      if (result === null) return;
      await loadPages(selectedContentId);
      if (result.page && page?.id === result.page.id) {
        const value = convertMarkdownToBlocks(result.page.body ?? "");
        reset(result.page, value);
        setActiveBlockId(value[0]?.id ?? null);
      }
      showMessage({ type: "success", text: "Updated page metadata." });
    },
    [selectedContentId, page, loadPages, reset, showMessage],
  );

  const handleDeletePage = useCallback(
    async (target: MarkdownPage) => {
      const label = target.frontmatter.title || target.slug || "this page";
      const confirmDelete = window.confirm(`Delete the page "${label}"?`);
      if (!confirmDelete) {
        return;
      }
      const deleteResult = await deleteMarkdownPage(target.id).catch((error) => {
        console.error("Failed to delete page", error);
        showMessage({ type: "error", text: "Failed to delete page." });
        return null;
      });
      if (deleteResult === null) return;
      showMessage({ type: "success", text: "Deleted page." });
      if (page?.id === target.id) {
        resetEditor();
      }
      await loadPages(selectedContentId);
    },
    [page, resetEditor, showMessage, loadPages, selectedContentId],
  );

  const handleInsertBlock = useCallback(
    (type: BlockType) => {
      let newBlockId: string | null = null;
      applyBlocks((previous) => {
        const next = [...previous];
        const block = createInitialBlock(type);
        newBlockId = block.id;
        // 常にページの最後に追加
        next.push(block);
        return next;
      });
      // 追加したブロックをアクティブにする
      if (newBlockId) {
        setActiveBlockId(newBlockId);
      }
      // 追加したブロックを表示するために、少し遅延してからスクロール
      setTimeout(() => {
        const editorElement = document.querySelector(`[data-editor-id="${editorId}"]`);
        if (editorElement) {
          const blocks = editorElement.querySelectorAll('[data-block-id]');
          const lastBlock = blocks[blocks.length - 1];
          if (lastBlock) {
            lastBlock.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            // ブロック内のエディタ要素にフォーカスを設定
            const editable = lastBlock.querySelector('div[contenteditable="true"], div[role="textbox"]');
            if (editable instanceof HTMLElement) {
              editable.focus();
            }
          }
        }
      }, 100);
    },
    [applyBlocks, editorId],
  );

  const toolbarState = useMemo(
    () => ({
      isSaving: autoSave.isSaving,
      lastSaved: autoSave.lastSaved,
      hasUnsavedChanges: hasChanges || autoSave.hasUnsavedChanges,
    }),
    [
      autoSave.isSaving,
      autoSave.lastSaved,
      autoSave.hasUnsavedChanges,
      hasChanges,
    ],
  );

  return (
    <EditorLayout
      sidebar={
        <Sidebar title="Content">
          <ContentSelector
            selectedContentId={selectedContentId}
            onSelect={(value) => {
              setSelectedContentId(value);
              resetEditor();
            }}
          />
          <ArticleList
            articles={pages}
            selectedId={page?.id}
            isLoading={pagesLoading}
            onSelect={handleSelectPage}
            onEditMeta={handleEditMeta}
            onCreate={handleCreatePage}
          />
          <MediaManager
            contentId={selectedContentId}
            media={media}
            isLoading={mediaLoading}
            onRefresh={() => {
              if (selectedContentId) {
                void loadMedia(selectedContentId);
              }
            }}
          />
          {page && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleDeletePage(page)}
            >
              Delete page
            </Button>
          )}
        </Sidebar>
      }
      editor={
        <BlockEditor
          editorId={editorId}
          blocks={blocks}
          applyBlocks={applyBlocks}
          readOnly={false}
          onSelectBlock={setActiveBlockId}
          contentId={selectedContentId}
        />
      }
      rightPanel={<BlockLibrary onInsertBlock={handleInsertBlock} />}
      toolbar={
        <Stack spacing={2}>
          <BlockToolbar
            onSave={handleManualSave}
            isSaving={toolbarState.isSaving}
            lastSaved={toolbarState.lastSaved}
            hasUnsavedChanges={toolbarState.hasUnsavedChanges}
          />
          {toast && (
            <Alert severity={toast.type} variant="outlined">
              {toast.text}
            </Alert>
          )}
        </Stack>
      }
    />
  );
}

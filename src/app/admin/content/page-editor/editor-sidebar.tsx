"use client";

import { adminColor } from "@/components/admin/ui/tokens";
import { Sidebar } from "@/components/admin/page-editor/layout/Sidebar";
import { ArticleList } from "@/components/admin/page-editor/panels/ArticleList";
import { ContentSelector } from "@/components/admin/page-editor/panels/ContentSelector";
import { MediaManager } from "@/components/admin/page-editor/panels/MediaManager";
import type { MarkdownPage } from "@/cms/types/markdown";
import type { MediaItem } from "@/cms/types/media";

export interface EditorSidebarProps {
 selectedContentId: string;
 onSelectContent: (contentId: string) => void;
 pages: MarkdownPage[];
 selectedPage: MarkdownPage | null;
 pagesLoading: boolean;
 onSelectPage: (page: MarkdownPage) => void;
 onEditMeta: (page: MarkdownPage) => void;
 onCreatePage: () => void;
 media: MediaItem[];
 mediaLoading: boolean;
 onRefreshMedia: () => void;
 onDeletePage: (page: MarkdownPage) => void;
}

export function EditorSidebar({
 selectedContentId,
 onSelectContent,
 pages,
 selectedPage,
 pagesLoading,
 onSelectPage,
 onEditMeta,
 onCreatePage,
 media,
 mediaLoading,
 onRefreshMedia,
 onDeletePage,
}: EditorSidebarProps) {
 return (
 <Sidebar title="Content">
 <ContentSelector
 selectedContentId={selectedContentId}
 onSelect={onSelectContent}
 />
 <ArticleList
 articles={pages}
 selectedId={selectedPage?.id}
 isLoading={pagesLoading}
 onSelect={onSelectPage}
 onEditMeta={onEditMeta}
 onCreate={onCreatePage}
 />
 <MediaManager
 contentId={selectedContentId}
 media={media}
 isLoading={mediaLoading}
 onRefresh={onRefreshMedia}
 />
 {selectedPage && (
 <button
 type="button"
 onClick={() => onDeletePage(selectedPage)}
 style={{
 padding: "8px 18px",
 fontSize: 14,
 fontWeight: 600,
 color: adminColor.error,
 backgroundColor: "transparent",
 border: `1px solid ${adminColor.borderInput}`,
 borderRadius: 6,
 cursor: "pointer",
 }}
 >
 Delete page
 </button>
 )}
 </Sidebar>
 );
}

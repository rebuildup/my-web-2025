"use client";

import { useMemo } from "react";
import { convertMarkdownToBlocks } from "@/cms/page-editor/lib/conversion/markdown-to-blocks";
import { BlockEditor } from "@/components/admin/page-editor/editor/BlockEditor";

export interface BlockContentRendererProps {
	markdown: string;
	contentId?: string;
}

export function BlockContentRenderer({
	markdown,
	contentId,
}: BlockContentRendererProps) {
	const blocks = useMemo(() => {
		if (!markdown || !markdown.trim()) {
			return [];
		}
		return convertMarkdownToBlocks(markdown);
	}, [markdown]);

	const editorId = useMemo(
		() => `renderer-${contentId || "default"}`,
		[contentId],
	);

	return (
		<div className="block-content-renderer w-full">
			<BlockEditor
				editorId={editorId}
				blocks={blocks}
				applyBlocks={() => {
					// readOnly mode - no-op
				}}
				readOnly={true}
				contentId={contentId}
			/>
		</div>
	);
}

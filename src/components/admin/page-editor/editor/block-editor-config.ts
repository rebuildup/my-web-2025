import type { JSX } from "react";
import type { BlockType } from "@/cms/types/blocks";
import { CodeBlock } from "@/components/admin/page-editor/blocks/advanced/CodeBlock";
import { CustomHtmlBlock } from "@/components/admin/page-editor/blocks/advanced/CustomHtmlBlock";
import { MathBlock } from "@/components/admin/page-editor/blocks/advanced/MathBlock";
import { TableOfContentsBlock } from "@/components/admin/page-editor/blocks/advanced/TableOfContentsBlock";
import { ToggleBlock } from "@/components/admin/page-editor/blocks/advanced/ToggleBlock";
import { CalloutBlock } from "@/components/admin/page-editor/blocks/basic/CalloutBlock";
import { DividerBlock } from "@/components/admin/page-editor/blocks/basic/DividerBlock";
import { HeadingBlock } from "@/components/admin/page-editor/blocks/basic/HeadingBlock";
import { ListBlock } from "@/components/admin/page-editor/blocks/basic/ListBlock";
import { QuoteBlock } from "@/components/admin/page-editor/blocks/basic/QuoteBlock";
import { SpacerBlock } from "@/components/admin/page-editor/blocks/basic/SpacerBlock";
import { TextBlock } from "@/components/admin/page-editor/blocks/basic/TextBlock";
import { BoardBlock } from "@/components/admin/page-editor/blocks/database/BoardBlock";
import { CalendarBlock } from "@/components/admin/page-editor/blocks/database/CalendarBlock";
import { TableBlock } from "@/components/admin/page-editor/blocks/database/TableBlock";
import { AudioBlock } from "@/components/admin/page-editor/blocks/media/AudioBlock";
import { FileBlock } from "@/components/admin/page-editor/blocks/media/FileBlock";
import { GalleryBlock } from "@/components/admin/page-editor/blocks/media/GalleryBlock";
import { ImageBlock } from "@/components/admin/page-editor/blocks/media/ImageBlock";
import { VideoBlock } from "@/components/admin/page-editor/blocks/media/VideoBlock";
import { WebBookmarkBlock } from "@/components/admin/page-editor/blocks/media/WebBookmarkBlock";
import type { BlockComponentProps } from "@/components/admin/page-editor/blocks/types";

export type BlockRenderer = (props: BlockComponentProps) => JSX.Element;

export const BLOCK_COMPONENTS: Partial<Record<BlockType, BlockRenderer>> = {
	paragraph: TextBlock,
	heading: HeadingBlock,
	list: ListBlock,
	quote: QuoteBlock,
	callout: CalloutBlock,
	divider: DividerBlock,
	spacer: SpacerBlock,
	image: ImageBlock,
	video: VideoBlock,
	audio: AudioBlock,
	file: FileBlock,
	bookmark: WebBookmarkBlock,
	code: CodeBlock,
	math: MathBlock,
	toggle: ToggleBlock,
	table: TableBlock,
	tableOfContents: TableOfContentsBlock,
	gallery: GalleryBlock,
	board: BoardBlock,
	calendar: CalendarBlock,
	html: CustomHtmlBlock,
};

export const AVAILABLE_INSERT_TYPES: BlockType[] = [
	"paragraph",
	"heading",
	"list",
	"quote",
	"callout",
	"divider",
	"image",
	"html",
];

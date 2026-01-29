import type { MarkdownPage } from "@/cms/types/markdown";

export interface ArticleData {
	page: MarkdownPage;
	title: string;
	description: string | null;
	tags: string[];
	thumbnail: string | null;
	date: string;
	href: string;
	isExternal: boolean;
	isNew: boolean;
}

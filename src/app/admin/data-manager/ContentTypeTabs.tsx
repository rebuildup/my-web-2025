"use client";

import { ContentType } from "@/types/content";
import { ActiveButtonStyle, ButtonStyle } from "./useDataManagerActions";

interface ContentTypeTabsProps {
	selectedContentType: ContentType;
	isLoading: boolean;
	onSelectContentType: (type: ContentType) => void;
}

export function ContentTypeTabs({
	selectedContentType,
	isLoading,
	onSelectContentType,
}: ContentTypeTabsProps) {
	return (
		<section className="space-y-4">
			<h2 className="neue-haas-grotesk-display text-xl leading-snug">
				Content Type
			</h2>
			<div className="flex flex-wrap gap-2">
				{(
					[
						"portfolio",
						"blog",
						"plugin",
						"download",
						"tool",
						"profile",
					] as ContentType[]
				).map((type) => (
					<button type="button"
						key={type}
						onClick={() => onSelectContentType(type)}
						className={
							selectedContentType === type
								? ActiveButtonStyle
								: ButtonStyle
						}
						disabled={isLoading}
					>
						{type.charAt(0).toUpperCase() + type.slice(1)}
					</button>
				))}
			</div>
		</section>
	);
}

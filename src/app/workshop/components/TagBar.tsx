"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface TagBarProps {
	tags: Array<{ tag: string; count: number }>;
	selectedTag: string | null;
}

function TagBarInner({ tags, selectedTag }: TagBarProps) {
	const searchParams = useSearchParams();

	const createUrl = (tag: string | null) => {
		const params = new URLSearchParams(searchParams.toString());
		if (tag) {
			params.set("tag", tag);
		} else {
			params.delete("tag");
		}
		params.delete("page"); // Reset to page 1 when changing tag
		return `?${params.toString()}`;
	};

	return (
		<div className="w-full overflow-x-auto scrollbar-hide-scroll">
			<div className="flex gap-2 px-1 min-w-max">
				<Link
					href={createUrl(null)}
					className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
						selectedTag === null
							? "bg-[#2b57ff] text-white"
							: "bg-[#1a1a1f] text-[#f2f2f2] hover:bg-[#2a2a2f] border border-[#333333]"
					}`}
				>
					全て ({tags.reduce((sum, t) => sum + t.count, 0)})
				</Link>
				{tags.map(({ tag, count }) => (
					<Link
						key={tag}
						href={createUrl(tag)}
						className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
							selectedTag === tag
								? "bg-[#2b57ff] text-white"
								: "bg-[#1a1a1f] text-[#f2f2f2] hover:bg-[#2a2a2f] border border-[#333333]"
						}`}
					>
						{tag} ({count})
					</Link>
				))}
			</div>
		</div>
	);
}

export function TagBar(props: TagBarProps) {
	return (
		<Suspense fallback={<TagBarFallback />}>
			<TagBarInner {...props} />
		</Suspense>
	);
}

function TagBarFallback() {
	return (
		<div className="w-full overflow-x-auto scrollbar-hide-scroll">
			<div className="flex gap-2 px-1 min-w-max">
				<div className="h-8 w-20 bg-[#1a1a1f] rounded animate-pulse" />
				<div className="h-8 w-24 bg-[#1a1a1f] rounded animate-pulse" />
				<div className="h-8 w-20 bg-[#1a1a1f] rounded animate-pulse" />
				<div className="h-8 w-28 bg-[#1a1a1f] rounded animate-pulse" />
			</div>
		</div>
	);
}

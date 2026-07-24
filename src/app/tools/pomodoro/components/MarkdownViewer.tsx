"use client";

import { useMemo } from "react";

export const MarkdownViewer = ({
	content,
	theme,
}: {
	content: string;
	theme: string;
}) => {
	const lines = useMemo(() => (content ? content.split("\n") : []), [content]);
	const lineKeys = useMemo(() => {
		const seen = new Map<string, number>();
		return lines.map((line) => {
			const base = line.length === 0 ? "<empty>" : line;
			const n = seen.get(base) ?? 0;
			seen.set(base, n + 1);
			return `${base}#${n}`;
		});
	}, [lines]);
	if (!content) return <div className="  italic">Empty note...</div>;

	return (
		<div className={`space-y-1 text-sm `}>
			{lines.map((line, i) => {
				const key = lineKeys[i];
				if (line.startsWith("# "))
					return (
						<h1 key={key} className="text-xl font-bold   pb-1 mb-2">
							{line.slice(2)}
						</h1>
					);
				if (line.startsWith("## "))
					return (
						<h2 key={key} className="text-lg font-bold mb-1">
							{line.slice(3)}
						</h2>
					);
				if (line.startsWith("- "))
					return (
						<li key={key} className="ml-4 list-disc">
							{line.slice(2)}
						</li>
					);
				if (line.startsWith("[ ] "))
					return (
						<div key={key} className="flex items-center gap-2">
							<div className="w-3 h-3 border rounded"></div>
							{line.slice(4)}
						</div>
					);
				if (line.startsWith("[x] "))
					return (
						<div key={key} className="flex items-center gap-2">
							<div className="w-3 h-3 border  rounded flex items-center justify-center text-[8px] ">
								✓
							</div>
							<span className="line-through ">{line.slice(4)}</span>
						</div>
					);

				const boldParts = line.split(/\*\*(.*?)\*\*/g);
				if (boldParts.length > 1) {
					return (
						<p key={key}>
							{boldParts.map((part, j) =>
								j % 2 === 1 ? <strong key={j}>{part}</strong> : part,
							)}
						</p>
					);
				}

				return (
					<p key={key} className="min-h-[1em]">
						{line}
					</p>
				);
			})}
		</div>
	);
};

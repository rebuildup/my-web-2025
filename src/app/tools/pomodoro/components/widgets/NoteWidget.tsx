"use client";

import React, { useRef, useState } from "react";
import { MarkdownViewer } from "../MarkdownViewer";

export const NoteWidget = ({
	content,
	theme,
	textClass,
	onChange,
}: {
	content: string;
	theme: string;
	textClass: string;
	onChange: (content: string) => void;
}) => {
	const [isEditing, setIsEditing] = useState(!content);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	if (isEditing) {
		return (
			<textarea
				ref={textareaRef}
				className={`w-full h-full resize-none font-mono text-sm select-text ${textClass} [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]: [&::-webkit-scrollbar-thumb]: [&::-webkit-scrollbar-thumb]: [&::-webkit-scrollbar-track]:`}
				placeholder="# Title&#10;- List item&#10;**Bold text**"
				value={content || ""}
				onChange={(e) => onChange(e.target.value)}
				onBlur={() => setIsEditing(false)}
				autoFocus
			/>
		);
	}

	return (
		<div
			className="h-full cursor-text select-text"
			onClick={() => setIsEditing(true)}
		>
			<MarkdownViewer content={content} theme={theme} />
		</div>
	);
};

interface MarkdownEditorStatusBarProps {
	content: string;
	validationErrorCount: number;
	embedSupport: boolean;
	error: string | null;
	filePath: string | undefined;
}

export function MarkdownEditorStatusBar({
	content,
	validationErrorCount,
	embedSupport,
	error,
	filePath,
}: MarkdownEditorStatusBarProps) {
	const lineCount = content.split("\n").length;
	const charCount = content.length;
	const wordCount = content
		.split(/\s+/)
		.filter((word) => word.length > 0).length;

	return (
		<div className="  px-4 py-2 text-xs  flex justify-between items-center">
			<div className="flex gap-4">
				<span>Lines: {lineCount}</span>
				<span>Characters: {charCount}</span>
				<span>Words: {wordCount}</span>
				{embedSupport && (
					<span className={validationErrorCount > 0 ? "" : ""}>
						Embeds:{" "}
						{validationErrorCount > 0
							? `${validationErrorCount} errors`
							: "Valid"}
					</span>
				)}
			</div>

			<div className="flex gap-4 items-center">
				{error && <div className=" font-medium">Error: {error}</div>}

				{filePath && <div className="">File: {filePath.split("/").pop()}</div>}
			</div>
		</div>
	);
}

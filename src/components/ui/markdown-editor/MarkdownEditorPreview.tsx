interface MarkdownEditorPreviewProps {
	html: { __html: string };
}

export function MarkdownEditorPreview({ html }: MarkdownEditorPreviewProps) {
	return (
		<div className="p-4 min-h-[500px] prose prose-sm max-w-none ">
			<div dangerouslySetInnerHTML={html} />
		</div>
	);
}

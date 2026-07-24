interface MarkdownEditorTextAreaProps {
	textareaRef: any;
	value: string;
	onChange: (value: string) => void;
	onKeyDown: (e: React.KeyboardEvent) => void;
}

export function MarkdownEditorTextArea({
	textareaRef,
	value,
	onChange,
	onKeyDown,
}: MarkdownEditorTextAreaProps) {
	const lineMarkers = value.split("\n").map((line, position) => ({
		id: `${line}-${position + 1}`,
		number: position + 1,
	}));

	return (
		<div className="relative">
			<textarea
				ref={textareaRef}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={onKeyDown}
				className="w-full min-h-[500px] p-4 pl-12 font-mono text-sm resize-none leading-5"
				placeholder="Enter your markdown content here..."
				spellCheck={false}
			/>

			{/* Line numbers */}
			<div className="absolute left-0 top-0 p-4 pr-2  text-sm font-mono pointer-events-none select-none  ">
				{lineMarkers.map((marker) => (
					<div key={marker.id} className="leading-5 text-right">
						{marker.number}
					</div>
				))}
			</div>
		</div>
	);
}

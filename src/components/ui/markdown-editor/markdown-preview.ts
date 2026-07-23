/**
 * Simple markdown to HTML conversion for preview.
 * In a real implementation, you might want to use a library like marked or remark.
 */
export function renderMarkdownPreview(content: string): { __html: string } {
	const lines = content.split("\n");
	let html = "";

	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];

		// Headers
		if (line.startsWith("### ")) {
			html += `<h3>${line.substring(4)}</h3>`;
		} else if (line.startsWith("## ")) {
			html += `<h2>${line.substring(3)}</h2>`;
		} else if (line.startsWith("# ")) {
			html += `<h1>${line.substring(2)}</h1>`;
		} else if (line.trim() === "") {
			html += "<br>";
		} else {
			// Process inline formatting
			line = line
				.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
				.replace(/\*(.*?)\*/g, "<em>$1</em>")
				.replace(/`(.*?)`/g, "<code>$1</code>")
				.replace(
					/!\[([^\]]*)\]\(([^)]+)\)/g,
					'<img alt="$1" src="$2" style="max-width: 100%; height: auto;" />',
				)
				.replace(
					/\[([^\]]+)\]\(([^)]+)\)/g,
					'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
				);

			// Handle video embeds and other HTML content
			if (
				line.includes('<div class="video-embed">') ||
				line.includes("<iframe")
			) {
				html += line;
			} else if (line.trim().startsWith("<") && line.trim().endsWith(">")) {
				// Handle other HTML tags
				html += line;
			} else {
				html += `<p>${line}</p>`;
			}
		}
	}

	return { __html: html };
}

"use client";

import { useState } from "react";
import { MarkdownEditor } from "./MarkdownEditor";

const demoMediaData = {
	images: [
		"/images/portfolio/demo1.jpg",
		"/images/portfolio/demo2.png",
		"/images/portfolio/demo3.webp",
	],
	videos: [
		{
			type: "youtube",
			url: "https://youtu.be/dQw4w9WgXcQ",
			title: "Demo Video 1",
			description: "A demonstration video",
		},
		{
			type: "youtube",
			url: "https://youtu.be/oHg5SJYRHA0",
			title: "Demo Video 2",
			description: "Another demo video",
		},
	],
	externalLinks: [
		{
			type: "website",
			url: "https://example.com",
			title: "Example Website",
			description: "An example external link",
		},
		{
			type: "github",
			url: "https://github.com/example/repo",
			title: "GitHub Repository",
			description: "Example GitHub repository",
		},
	],
};

const demoContent = `# Enhanced Markdown Editor Demo

This is a demonstration of the enhanced markdown editor with embed support.

## Image Embeds

You can embed images using index references:
![image:0]
![image:1 "Demo image with alt text"]

## Video Embeds

Embed videos using the video syntax:
![video:0]
![video:1 "Custom video title"]

## Link Embeds

Reference external links by index:
[link:0]
[link:1 "Custom link text"]

## Regular Markdown

You can still use regular markdown:

- **Bold text**
- *Italic text*
- \`inline code\`
- [Regular links](https://example.com)

### Code Block

\`\`\`javascript
function example() {
  console.log("This is a code block");
}
\`\`\`

## Custom iframes

You can also embed custom content:

<iframe src="https://example.com/embed" title="Custom embed" width="100%" height="400"></iframe>
`;

export function MarkdownEditorDemo() {
	const [content, setContent] = useState(demoContent);

	return (
		<div className="max-w-6xl mx-auto p-6 space-y-6">
			<div className="text-center">
				<h1 className="text-3xl font-bold mb-2">
					Enhanced Markdown Editor Demo
				</h1>
				<p className="text-gray-600">
					Demonstrates embed syntax support, live preview, toolbar helpers, and
					validation
				</p>
			</div>

			<div className="bg-white rounded-lg shadow-lg p-6">
				<h2 className="text-xl font-semibold mb-4">Features Demonstrated:</h2>
				<ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
					<li>
						✅ Embed syntax support for images, videos, and links using index
						references
					</li>
					<li>✅ Live preview functionality that resolves embed references</li>
					<li>✅ Toolbar with embed insertion helpers</li>
					<li>✅ Syntax validation for embed references with error display</li>
					<li>✅ Embed helper panel showing available media</li>
					<li>✅ Real-time validation status in status bar</li>
				</ul>

				<MarkdownEditor
					content={content}
					onChange={setContent}
					preview={true}
					toolbar={true}
					embedSupport={true}
					mediaData={demoMediaData}
				/>
			</div>

			<div className="bg-gray-50 rounded-lg p-6">
				<h2 className="text-xl font-semibold mb-4">
					Available Media for Embedding:
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<h3 className="font-medium mb-2">
							Images ({demoMediaData.images.length})
						</h3>
						<ul className="text-sm space-y-1">
							{demoMediaData.images.map((img, index) => (
								<li key={img} className="font-mono">
									![image:{index}] → {img.split("/").pop()}
								</li>
							))}
						</ul>
					</div>
					<div>
						<h3 className="font-medium mb-2">
							Videos ({demoMediaData.videos.length})
						</h3>
						<ul className="text-sm space-y-1">
							{demoMediaData.videos.map((video, index) => (
								<li
									key={video.url ?? `${video.title}-${index}`}
									className="font-mono"
								>
									![video:{index}] → {video.title}
								</li>
							))}
						</ul>
					</div>
					<div>
						<h3 className="font-medium mb-2">
							Links ({demoMediaData.externalLinks.length})
						</h3>
						<ul className="text-sm space-y-1">
							{demoMediaData.externalLinks.map((link, index) => (
								<li
									key={link.url ?? `${link.title}-${index}`}
									className="font-mono"
								>
									[link:{index}] → {link.title}
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>

			<div className="bg-blue-50 rounded-lg p-6">
				<h2 className="text-xl font-semibold mb-4">How to Use:</h2>
				<ol className="list-decimal list-inside space-y-2 text-gray-700">
					<li>Use the toolbar buttons to insert embed syntax</li>
					<li>Click the &quot;?&quot; button to show the embed helper panel</li>
					<li>Toggle between Edit and Preview modes to see resolved embeds</li>
					<li>Watch the status bar for validation feedback</li>
					<li>Try entering invalid embed references to see error handling</li>
				</ol>
			</div>
		</div>
	);
}

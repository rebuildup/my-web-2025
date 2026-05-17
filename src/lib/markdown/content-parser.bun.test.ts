import { expect, test } from "bun:test";
import { createContentParser } from "./content-parser";

test("content parser renders CMS Image and Html component tags", async () => {
	const parser = createContentParser();

	const rendered = await parser.parseMarkdown(
		[
			"# Title",
			'<Image src="/api/cms/media?contentId=item&id=media_1&raw=1" alt="Preview"></Image>',
			"<Html>",
			'<iframe src="https://www.youtube.com/embed/example"></iframe>',
			"</Html>",
		].join("\n"),
		{ images: [], videos: [], externalLinks: [] },
	);

	expect(rendered).toContain(
		'<img src="/api/cms/media?contentId=item&amp;id=media_1&amp;raw=1" alt="Preview" loading="lazy" />',
	);
	expect(rendered).toContain(
		'<iframe src="https://www.youtube.com/embed/example"',
	);
	expect(rendered).not.toContain("<Image");
	expect(rendered).not.toContain("</Image>");
	expect(rendered).not.toContain("<Html>");
});

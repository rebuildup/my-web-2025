/**
 * Markdown API Routes
 * Server-side API for markdown file operations
 */

import { type NextRequest, NextResponse } from "next/server";
import { markdownFileManager } from "@/lib/markdown";
import type { ContentType } from "@/types/content";

export async function POST(request: NextRequest) {
	try {
		const { action, ...params } = await request.json();

		switch (action) {
			case "generateFilePath": {
				const { contentId, contentType } = params;
				const filePath = markdownFileManager.generateFilePath(
					contentId,
					contentType as ContentType,
				);
				return NextResponse.json({ filePath });
			}

			case "createMarkdownFile": {
				const {
					contentId: createId,
					contentType: createType,
					content: createContent,
				} = params;
				const createdPath = await markdownFileManager.createMarkdownFile(
					createId,
					createType as ContentType,
					createContent,
				);
				return NextResponse.json({ filePath: createdPath });
			}

			case "updateMarkdownFile": {
				const { filePath: updatePath, content: updateContent } = params;
				await markdownFileManager.updateMarkdownFile(updatePath, updateContent);
				return NextResponse.json({ success: true });
			}

			case "fileExists": {
				const { filePath: checkPath } = params;
				const exists = await markdownFileManager.fileExists(checkPath);
				return NextResponse.json({ exists });
			}

			case "getMarkdownContent": {
				const { filePath: getPath } = params;
				const content = await markdownFileManager.getMarkdownContent(getPath);
				return NextResponse.json({ content });
			}

			case "deleteMarkdownFile": {
				const { filePath: deletePath } = params;
				await markdownFileManager.deleteMarkdownFile(deletePath);
				return NextResponse.json({ success: true });
			}

			default:
				return NextResponse.json({ error: "Invalid action" }, { status: 400 });
		}
	} catch (error) {
		console.error("Markdown API error:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 500 },
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const action = searchParams.get("action");
		const filePath = searchParams.get("filePath");

		switch (action) {
			case "getMarkdownContent": {
				if (!filePath) {
					return NextResponse.json(
						{ error: "filePath is required" },
						{ status: 400 },
					);
				}
				const content = await markdownFileManager.getMarkdownContent(filePath);
				return NextResponse.json({ content });
			}

			case "fileExists": {
				if (!filePath) {
					return NextResponse.json(
						{ error: "filePath is required" },
						{ status: 400 },
					);
				}
				const exists = await markdownFileManager.fileExists(filePath);
				return NextResponse.json({ exists });
			}

			default:
				return NextResponse.json({ error: "Invalid action" }, { status: 400 });
		}
	} catch (error) {
		console.error("Markdown API error:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 500 },
		);
	}
}

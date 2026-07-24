/**
 * Effect hook that swaps rendered `.markdown-bookmark-card` HTML nodes
 * for live React `<BookmarkCard />` instances.
 *
 * The markdown pipeline first emits a placeholder HTML structure for each
 * bookmark card. After `dangerouslySetInnerHTML` mounts that HTML, this
 * hook walks the container, extracts the existing data, and replaces each
 * card with a real React root so subsequent interactions behave correctly.
 */

import type { RefObject } from "react";
import { createElement, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BookmarkCard } from "../BookmarkCard";

interface ExtractedBookmarkData {
	url: string;
	title?: string;
	description?: string;
	image?: string;
	linkText?: string;
}

const extractFromCardElement = (
	card: Element,
): ExtractedBookmarkData | null => {
	// Try to find link element
	const link = card.querySelector(".bookmark-card-link");
	let url = link?.getAttribute("href") || "";

	// If no link element, try to extract URL from data attributes or text content
	if (!url) {
		// Check if there's a data-json attribute with URL
		const dataJson = card.getAttribute("data-json");
		if (dataJson) {
			let parsedData: { url?: string } | null = null;
			try {
				parsedData = JSON.parse(decodeURIComponent(dataJson));
			} catch {
				// Ignore parse errors
			}
			if (parsedData) {
				const parsedUrl = parsedData.url;
				url = parsedUrl || "";
			}
		}
	}

	// Extract existing data
	const titleEl = card.querySelector(".bookmark-card-title");
	const descriptionEl = card.querySelector(".bookmark-card-description");
	const imageEl = card.querySelector(".bookmark-card-thumbnail img");
	const linkTextEl = card.querySelector(".bookmark-card-link-text");

	let title = titleEl?.textContent?.trim();
	let description = descriptionEl?.textContent?.trim();
	const image = imageEl?.getAttribute("src") || undefined;
	let linkText = linkTextEl?.textContent?.trim();

	// If no structured data found, try to extract from text content
	if (!title && !description) {
		// Get all text nodes, excluding nested elements
		const textContent = Array.from(card.childNodes)
			.filter((node) => node.nodeType === Node.TEXT_NODE)
			.map((node) => node.textContent?.trim())
			.filter((text) => text && text.length > 0)
			.join(" ")
			.trim();

		if (textContent) {
			// Try to parse the text content
			// Split by common separators (|, -, etc.)
			const parts = textContent
				.split(/[|・\-]/)
				.map((p) => p.trim())
				.filter((p) => p);
			if (parts.length > 0) {
				title = parts[0];
				if (parts.length > 1) {
					description = parts.slice(1).join(" ").trim();
				}
			} else {
				// Use the whole text as title if no structure found
				title = textContent;
			}
		}

		// Also check if there's text directly in the link element
		if (!title && link) {
			const linkTextContent = link.textContent?.trim();
			if (linkTextContent && linkTextContent !== url) {
				const parts = linkTextContent
					.split(/[|・\-]/)
					.map((p) => p.trim())
					.filter((p) => p);
				if (parts.length > 0) {
					title = parts[0];
					if (parts.length > 1) {
						description = parts.slice(1).join(" ").trim();
					}
				}
			}
		}
	}

	// Skip if no URL and no meaningful content
	if (!url && !title && !description) {
		return null;
	}

	return {
		url: url || "#",
		title,
		description,
		image,
		linkText,
	};
};

export const useBookmarkCardReplacer = (
	containerRef: RefObject<HTMLDivElement | null>,
	parsedContent: string,
): void => {
	useEffect(() => {
		if (!containerRef.current || !parsedContent) return;

		// Use requestAnimationFrame to ensure DOM is ready
		const frameId = requestAnimationFrame(() => {
			if (!containerRef.current) return;

			const bookmarkCards = Array.from(
				containerRef.current.querySelectorAll(".markdown-bookmark-card"),
			);

			bookmarkCards.forEach((card) => {
				// Check if already properly rendered (has proper structure)
				const hasProperStructure =
					card.querySelector(".bookmark-card-link") ||
					card.querySelector(".bookmark-card-layout");

				// If already properly rendered and marked, skip
				if (
					hasProperStructure &&
					card.getAttribute("data-react-rendered") === "true"
				) {
					return;
				}

				// If marked but not properly rendered, remove the mark to retry
				if (
					card.getAttribute("data-react-rendered") === "true" &&
					!hasProperStructure
				) {
					card.removeAttribute("data-react-rendered");
				}

				// Mark as processed immediately to prevent duplicate processing
				card.setAttribute("data-react-rendered", "true");

				const data = extractFromCardElement(card);
				if (!data) {
					return;
				}

				// Create a container for React component
				const reactContainer = document.createElement("div");
				reactContainer.className = card.className;
				// Preserve any other attributes except data-react-rendered
				Array.from(card.attributes).forEach((attr) => {
					if (attr.name !== "class" && attr.name !== "data-react-rendered") {
						reactContainer.setAttribute(attr.name, attr.value);
					}
				});

				// Replace the card with the new container
				if (card.parentNode) {
					card.parentNode.replaceChild(reactContainer, card);
				}

				// Render React component
				const root = createRoot(reactContainer);
				root.render(
					createElement(BookmarkCard, {
						url: data.url,
						title: data.title,
						description: data.description,
						image: data.image,
						linkText: data.linkText,
					}),
				);
			});
		});

		return () => cancelAnimationFrame(frameId);
	}, [containerRef, parsedContent]);
};

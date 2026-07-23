import { CATEGORY_NAMES } from "./constants";
import type { ComposedBlock, ValidationResult } from "./types";

// Email validation and professional guidelines
export const validateEmail = (
	blocks: ComposedBlock[],
	variables: Record<string, string>,
): ValidationResult => {
	const errors: string[] = [];
	const warnings: string[] = [];
	const suggestions: string[] = [];

	// Check for required categories
	const categories = blocks.map((b) => b.category);
	if (!categories.includes("greeting")) {
		errors.push("挨拶ブロックが必要です");
	}
	if (!categories.includes("body")) {
		errors.push("本文ブロックが必要です");
	}
	if (!categories.includes("closing")) {
		warnings.push("締めのブロックを追加することをお勧めします");
	}
	if (!categories.includes("signature")) {
		warnings.push("署名ブロックを追加することをお勧めします");
	}

	// Check for proper order
	const expectedOrder = ["greeting", "body", "closing", "signature"];
	let lastValidIndex = -1;
	for (const block of blocks) {
		const currentIndex = expectedOrder.indexOf(block.category);
		if (currentIndex < lastValidIndex) {
			warnings.push(
				`${CATEGORY_NAMES[block.category]}の順序を確認してください`,
			);
		}
		lastValidIndex = Math.max(lastValidIndex, currentIndex);
	}

	// Check for missing variables
	const allVariables = new Set(blocks.flatMap((b) => b.variables || []));
	for (const variable of allVariables) {
		if (!variables[variable] || variables[variable].trim() === "") {
			errors.push(`変数「${variable}」が設定されていません`);
		}
	}

	// Check for professional tone
	const emailContent = blocks.map((b) => b.content).join(" ");
	if (
		!emailContent.includes("お世話になっております") &&
		!emailContent.includes("はじめまして")
	) {
		suggestions.push("適切な挨拶を含めることをお勧めします");
	}
	if (!emailContent.includes("よろしくお願い")) {
		suggestions.push("締めの挨拶を含めることをお勧めします");
	}

	// Check email length
	const totalLength = emailContent.length;
	if (totalLength < 50) {
		warnings.push("メールが短すぎる可能性があります");
	} else if (totalLength > 1000) {
		warnings.push("メールが長すぎる可能性があります");
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
		suggestions,
	};
};

import type { AEExpression, ValidationResult } from "./ae-expression-types";

export function filterExpressions(
	expressions: AEExpression[],
	searchTerm: string,
	selectedCategory: string,
	selectedDifficulty: string,
	showFavoritesOnly: boolean,
) {
	const searchLower = searchTerm.toLowerCase();
	return expressions.filter((expr) => {
		const matchesSearch =
			!searchTerm ||
			expr.name.toLowerCase().includes(searchLower) ||
			expr.description.toLowerCase().includes(searchLower) ||
			expr.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) ||
			expr.template.toLowerCase().includes(searchLower);
		return (
			matchesSearch &&
			(selectedCategory === "all" || expr.category === selectedCategory) &&
			(selectedDifficulty === "all" ||
				expr.difficulty === selectedDifficulty) &&
			(!showFavoritesOnly || expr.isFavorite)
		);
	});
}

export function validateExpression(code: string): ValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];
	if (!code.trim())
		return { isValid: false, errors: ["エクスプレッションが空です"], warnings };
	if ((code.match(/\(/g) || []).length !== (code.match(/\)/g) || []).length)
		errors.push("括弧の数が一致しません");
	if ((code.match(/\[/g) || []).length !== (code.match(/\]/g) || []).length)
		errors.push("角括弧の数が一致しません");
	if ((code.match(/\{/g) || []).length !== (code.match(/\}/g) || []).length)
		errors.push("波括弧の数が一致しません");
	const undefinedVars = code.match(/\{[^}]+\}/g);
	if (undefinedVars)
		warnings.push(
			`未定義の変数が含まれている可能性があります: ${undefinedVars.join(", ")}`,
		);
	for (const func of ["eval", "with"])
		if (code.includes(func))
			warnings.push(`非推奨の関数が使用されています: ${func}`);
	if (code.includes("for") || code.includes("while"))
		warnings.push("ループ処理はパフォーマンスに影響する可能性があります");
	return { isValid: errors.length === 0, errors, warnings };
}

export function generateExpressionCode(
	expression: AEExpression | null,
	values: Record<string, string | number | boolean>,
) {
	if (!expression) return "";
	let code = expression.template;
	for (const param of expression.parameters) {
		code = code.replace(
			new RegExp(`{${param.name}}`, "g"),
			String(values[param.name] ?? param.defaultValue),
		);
	}
	return code;
}

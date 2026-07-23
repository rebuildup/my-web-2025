import { AlertCircle, CheckCircle } from "lucide-react";
import type { ValidationResult } from "./types";

interface EmailValidationProps {
	validationResult: ValidationResult;
}

export default function EmailValidation({
	validationResult,
}: EmailValidationProps) {
	return (
		<div className="space-y-4">
			<h3 className="neue-haas-grotesk-display text-lg ">
				メールバリデーション
			</h3>

			<div className="grid-system grid-1 sm:grid-3 gap-4">
				{/* Errors */}
				{validationResult.errors.length > 0 && (
					<div className="   p-3">
						<div className="flex items-center gap-2 mb-2">
							<AlertCircle className="w-4 h-4 " />
							<h4 className="text-sm neue-haas-grotesk-display ">
								エラー ({validationResult.errors.length})
							</h4>
						</div>
						<ul className="space-y-1">
							{validationResult.errors.map((error) => (
								<li
									key={`error-${error}`}
									className="text-xs  noto-sans-jp-light"
								>
									• {error}
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Warnings */}
				{validationResult.warnings.length > 0 && (
					<div className="   p-3">
						<div className="flex items-center gap-2 mb-2">
							<AlertCircle className="w-4 h-4 " />
							<h4 className="text-sm neue-haas-grotesk-display ">
								警告 ({validationResult.warnings.length})
							</h4>
						</div>
						<ul className="space-y-1">
							{validationResult.warnings.map((warning) => (
								<li
									key={`warning-${warning}`}
									className="text-xs  noto-sans-jp-light"
								>
									• {warning}
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Suggestions */}
				{validationResult.suggestions.length > 0 && (
					<div className="   p-3">
						<div className="flex items-center gap-2 mb-2">
							<CheckCircle className="w-4 h-4 " />
							<h4 className="text-sm neue-haas-grotesk-display ">
								提案 ({validationResult.suggestions.length})
							</h4>
						</div>
						<ul className="space-y-1">
							{validationResult.suggestions.map((suggestion) => (
								<li
									key={`suggestion-${suggestion}`}
									className="text-xs  noto-sans-jp-light"
								>
									• {suggestion}
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Success */}
				{validationResult.isValid &&
					validationResult.warnings.length === 0 &&
					validationResult.suggestions.length === 0 && (
						<div className="   p-3">
							<div className="flex items-center gap-2">
								<CheckCircle className="w-4 h-4 " />
								<h4 className="text-sm neue-haas-grotesk-display ">
									メールは適切に構成されています
								</h4>
							</div>
						</div>
					)}
			</div>
		</div>
	);
}

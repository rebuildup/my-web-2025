import type { EmbedValidationError } from "./types";

interface ValidationErrorsPanelProps {
	errors: EmbedValidationError[];
}

export function ValidationErrorsPanel({ errors }: ValidationErrorsPanelProps) {
	if (errors.length === 0) return null;

	return (
		<div className="   p-3">
			<div className="flex items-center gap-2 mb-2">
				<span className="">⚠</span>
				<h4 className="font-medium ">Embed Syntax Errors</h4>
			</div>
			<div className="space-y-1 text-sm">
				{errors.map((error) => {
					const errorKey = `${error.type}-${error.line}-${error.column}-${error.message}`;
					return (
						<div key={errorKey} className="">
							<span className="font-mono text-xs  px-1 rounded">
								Line {error.line}:{error.column}
							</span>{" "}
							{error.message}
							{error.suggestion && (
								<div className=" text-xs mt-1 ml-4">💡 {error.suggestion}</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

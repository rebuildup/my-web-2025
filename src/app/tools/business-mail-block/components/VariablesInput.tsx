interface VariablesInputProps {
	allVariables: string[];
	variables: Record<string, string>;
	updateVariable: (key: string, value: string) => void;
}

export default function VariablesInput({
	allVariables,
	variables,
	updateVariable,
}: VariablesInputProps) {
	return (
		<div className="space-y-4">
			<h3 className="neue-haas-grotesk-display text-lg ">変数設定</h3>
			<div className="grid-system grid-1 sm:grid-2 lg:grid-3 gap-4">
				{allVariables.map((variable: string) => (
					<div key={variable} className="space-y-1">
						<label
							htmlFor={`var-${variable}`}
							className="text-sm noto-sans-jp-regular"
						>
							{variable}
						</label>
						<input
							id={`var-${variable}`}
							type="text"
							value={variables[variable] || ""}
							onChange={(e) => updateVariable(variable, e.target.value)}
							placeholder={`${variable}を入力...`}
							className="w-full px-3 py-2"
						/>
					</div>
				))}
			</div>
		</div>
	);
}

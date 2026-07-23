import type { ChangeEvent } from "react";

type ColorFieldProps = {
	label: string;
	value: string;
	ariaLabel: string;
	onChange: (value: string) => void;
};

export function ColorField({
	label,
	value,
	ariaLabel,
	onChange,
}: ColorFieldProps) {
	return (
		<div>
			<label
				style={{
					display: "block",
					fontSize: 14,
					marginBottom: 4,
				}}
			>
				{label}
			</label>
			<input
				type="color"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				style={{
					width: "100%",
					height: 40,
					border: "1px solid #ddd",
					borderRadius: 4,
				}}
				aria-label={ariaLabel}
			/>
		</div>
	);
}

type RangeFieldProps = {
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	ariaLabel: string;
	onChange: (value: number) => void;
};

export function RangeField({
	label,
	value,
	min,
	max,
	step,
	ariaLabel,
	onChange,
}: RangeFieldProps) {
	return (
		<div>
			<p style={{ marginBottom: 4 }}>
				{label}: {value}px
			</p>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(event) => onChange(Number(event.target.value))}
				aria-label={ariaLabel}
				style={{ width: "100%" }}
			/>
		</div>
	);
}

type BorderStyleSelectProps = {
	value: string;
	onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
};

export function BorderStyleSelect({ value, onChange }: BorderStyleSelectProps) {
	return (
		<div>
			<label
				style={{
					display: "block",
					fontSize: 14,
					marginBottom: 4,
				}}
			>
				線のスタイル
			</label>
			<select
				value={value}
				onChange={onChange}
				aria-label="線のスタイル"
				style={{
					width: "100%",
					padding: "4px 8px",
					fontSize: 14,
				}}
			>
				<option value="solid">実線</option>
				<option value="dashed">破線</option>
				<option value="dotted">点線</option>
				<option value="double">二重線</option>
			</select>
		</div>
	);
}

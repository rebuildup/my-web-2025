import { contentFormStyles as s } from "./ContentForm.styles";

interface ContentFormInputFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	type?: string;
	required?: boolean;
	disabled?: boolean;
	multiline?: boolean;
	minRows?: number;
	placeholder?: string;
	helperText?: string;
}

export function ContentFormInputField({
	label,
	value,
	onChange,
	type,
	required,
	disabled,
	multiline,
	minRows,
	placeholder,
	helperText,
}: ContentFormInputFieldProps) {
	return (
		<div>
			<div style={s.label}>
				{label}
				{required && " *"}
			</div>
			{multiline ? (
				<textarea
					style={s.textarea}
					value={value}
					onChange={(event) => onChange(event.target.value)}
					disabled={disabled}
					placeholder={placeholder}
					rows={minRows || 3}
				/>
			) : (
				<input
					style={s.input}
					type={type || "text"}
					value={value}
					onChange={(event) => onChange(event.target.value)}
					required={required}
					disabled={disabled}
					placeholder={placeholder}
				/>
			)}
			{helperText && <div style={s.helper}>{helperText}</div>}
		</div>
	);
}

"use client";

import { useCallback } from "react";

interface TextInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	fontSize: "small" | "medium" | "large";
}

const fontSizeClasses = {
	small: "text-sm",
	medium: "",
	large: "text-lg",
};

export default function TextInput({
	value,
	onChange,
	placeholder = "ここにテキストを入力してください...",
	fontSize,
}: TextInputProps) {
	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			onChange(e.target.value);
		},
		[onChange],
	);

	return (
		<div className="space-y-2">
			<label
				htmlFor="text-input"
				className="block text-sm font-medium "
			>
				テキスト入力
			</label>
			<textarea
				id="text-input"
				value={value}
				onChange={handleChange}
				placeholder={placeholder}
				className={`
 w-full h-96 p-4 rounded-xl
 /75  shadow-[0_8px_24px_rgba(0,0,0,0.25)]
   focus:ring-accent focus:border-accent
 resize-none
 ${fontSizeClasses[fontSize]}
 `}
				aria-label="テキスト入力エリア"
				aria-describedby="text-input-help"
			/>
			<p id="text-input-help" className="text-xs ">
				テキストを入力すると、リアルタイムで文字数や統計情報が更新されます.
			</p>
		</div>
	);
}

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
	medium: "text-base",
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
				className="block text-sm font-medium text-main"
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
          bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)]
          focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base
          resize-none
          ${fontSizeClasses[fontSize]}
        `}
				aria-label="テキスト入力エリア"
				aria-describedby="text-input-help"
			/>
			<p id="text-input-help" className="text-xs text-main opacity-70">
				テキストを入力すると、リアルタイムで文字数や統計情報が更新されます。
			</p>
		</div>
	);
}

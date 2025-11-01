import { useState } from "react";
import { settings, updateSetting } from "../SiteInterface";

export const fonts = [
	{ name: "Noto Sans JP", value: "'Noto Sans JP',serif" },
	{ name: "Zen Kaku Gothic New", value: "'Zen Kaku Gothic New',serif" },
	{ name: "Zen Maru Gothic", value: "'Zen Maru Gothic',serif" },
	{ name: "Shippori Antique B1", value: "'Shippori Antique B1',serif" },
	{
		name: "hiragino-kaku-gothic-pron",
		value: "'hiragino-kaku-gothic-pron',sans-serif",
	},
	{ name: "fot-cezanne-pron", value: "'fot-cezanne-pron',sans-serif" },
	{ name: "klee-one", value: "'klee-one',sans-serif" },
	{
		name: "source-han-sans-japanese",
		value: "'source-han-sans-japanese',sans-serif",
	},
	{ name: "shippori-mincho-b1", value: "'shippori-mincho-b1',sans-serif" },
];

export default function FontSelector() {
	const [selectedFont, setSelectedFont] = useState(
		settings.fontTheme.fontFamily,
	);

	const changeFont = (font: string) => {
		setSelectedFont(font);
		document.documentElement.style.setProperty("--First-font", font);
		updateSetting("fontTheme", {
			fontFamily: font,
			fontSize: 16,
		});
	};

	return (
		<div style={{ zIndex: 1 }}>
			<h1>フォント</h1>
			<label className="selectbox-5">
				<select
					value={selectedFont}
					onChange={(e) => changeFont(e.target.value)}
				>
					{fonts.map((font) => (
						<option key={font.value} value={font.value}>
							{font.name}
						</option>
					))}
				</select>
			</label>
		</div>
	);
}

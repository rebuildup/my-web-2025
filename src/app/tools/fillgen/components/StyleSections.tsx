import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { StyleSettings } from "./types";
import { BorderStyleSelect, ColorField, RangeField } from "./StyleFields";

type SectionProps = {
	settings: StyleSettings;
	setSettings: Dispatch<SetStateAction<StyleSettings>>;
};

const sectionStyle = {
	fontWeight: 600,
	fontSize: 16,
	cursor: "pointer",
	padding: "4px 0",
} as const;

const contentStyle = {
	display: "flex",
	flexDirection: "column",
	gap: 16,
	marginTop: 12,
} as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<details>
			<summary style={sectionStyle}>{title}</summary>
			<div style={contentStyle}>{children}</div>
		</details>
	);
}

export function ColorSettingsSection({ settings, setSettings }: SectionProps) {
	const updateColor = (key: keyof StyleSettings["colors"]) => (value: string) =>
		setSettings({ ...settings, colors: { ...settings.colors, [key]: value } });

	return (
		<details open>
			<summary style={sectionStyle}>色設定</summary>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
					gap: 16,
					marginTop: 12,
				}}
			>
				<ColorField
					label="背景色"
					ariaLabel="背景色"
					value={settings.colors.bgColor}
					onChange={updateColor("bgColor")}
				/>
				<ColorField
					label="テキスト色"
					ariaLabel="テキスト色"
					value={settings.colors.textColor}
					onChange={updateColor("textColor")}
				/>
				<ColorField
					label="アクセント色"
					ariaLabel="アクセント色"
					value={settings.colors.accentColor}
					onChange={updateColor("accentColor")}
				/>
				<ColorField
					label="正解色"
					ariaLabel="正解色"
					value={settings.colors.correctColor}
					onChange={updateColor("correctColor")}
				/>
				<ColorField
					label="不正解色"
					ariaLabel="不正解色"
					value={settings.colors.incorrectColor}
					onChange={updateColor("incorrectColor")}
				/>
				<ColorField
					label="ブロック背景色"
					ariaLabel="ブロック背景色"
					value={settings.colors.blockBg}
					onChange={updateColor("blockBg")}
				/>
			</div>
		</details>
	);
}

export function TextSizeSection({ settings, setSettings }: SectionProps) {
	const updateTextSize =
		(key: keyof StyleSettings["textSize"]) => (value: number) =>
			setSettings({
				...settings,
				textSize: { ...settings.textSize, [key]: value },
			});

	return (
		<Section title="テキストサイズ">
			<RangeField
				label="基本サイズ"
				ariaLabel="基本テキストサイズ"
				value={settings.textSize.base}
				min={12}
				max={24}
				step={1}
				onChange={updateTextSize("base")}
			/>
			<RangeField
				label="タイトルサイズ"
				ariaLabel="タイトルサイズ"
				value={settings.textSize.title}
				min={18}
				max={36}
				step={1}
				onChange={updateTextSize("title")}
			/>
			<RangeField
				label="見出しサイズ"
				ariaLabel="見出しサイズ"
				value={settings.textSize.header}
				min={14}
				max={28}
				step={1}
				onChange={updateTextSize("header")}
			/>
			<RangeField
				label="セクションサイズ"
				ariaLabel="セクションサイズ"
				value={settings.textSize.section}
				min={12}
				max={24}
				step={1}
				onChange={updateTextSize("section")}
			/>
			<RangeField
				label="空欄サイズ"
				ariaLabel="空欄サイズ"
				value={settings.textSize.blank}
				min={12}
				max={24}
				step={1}
				onChange={updateTextSize("blank")}
			/>
		</Section>
	);
}

export function ButtonStyleSection({ settings, setSettings }: SectionProps) {
	const updateButton =
		(key: keyof StyleSettings["button"]) => (value: number) =>
			setSettings({
				...settings,
				button: { ...settings.button, [key]: value },
			});

	return (
		<Section title="ボタンスタイル">
			<RangeField
				label="角丸"
				ariaLabel="ボタンの角丸"
				value={settings.button.borderRadius}
				min={0}
				max={20}
				step={1}
				onChange={updateButton("borderRadius")}
			/>
			<RangeField
				label="フォントサイズ"
				ariaLabel="ボタンのフォントサイズ"
				value={settings.button.fontSize}
				min={10}
				max={20}
				step={1}
				onChange={updateButton("fontSize")}
			/>
		</Section>
	);
}

export function BlankStyleSection({ settings, setSettings }: SectionProps) {
	return (
		<Section title="空欄スタイル">
			<BorderStyleSelect
				value={settings.blank.borderStyle}
				onChange={(event) =>
					setSettings({
						...settings,
						blank: {
							...settings.blank,
							borderStyle: event.target
								.value as StyleSettings["blank"]["borderStyle"],
						},
					})
				}
			/>
			<RangeField
				label="線の太さ"
				ariaLabel="空欄の線の太さ"
				value={settings.blank.borderWidth}
				min={1}
				max={5}
				step={1}
				onChange={(value) =>
					setSettings({
						...settings,
						blank: { ...settings.blank, borderWidth: value },
					})
				}
			/>
			<ColorField
				label="背景色"
				ariaLabel="空欄の背景色"
				value={settings.blank.backgroundColor}
				onChange={(value) =>
					setSettings({
						...settings,
						blank: { ...settings.blank, backgroundColor: value },
					})
				}
			/>
		</Section>
	);
}

export function NavTabStyleSection({ settings, setSettings }: SectionProps) {
	const updateNavTab =
		(key: keyof StyleSettings["navTab"]) => (value: number) =>
			setSettings({
				...settings,
				navTab: { ...settings.navTab, [key]: value },
			});

	return (
		<Section title="ページ切り替えタブスタイル">
			<RangeField
				label="角丸"
				ariaLabel="タブの角丸"
				value={settings.navTab.borderRadius}
				min={0}
				max={30}
				step={1}
				onChange={updateNavTab("borderRadius")}
			/>
			<RangeField
				label="フォントサイズ"
				ariaLabel="タブのフォントサイズ"
				value={settings.navTab.fontSize}
				min={10}
				max={20}
				step={1}
				onChange={updateNavTab("fontSize")}
			/>
		</Section>
	);
}

import type React from "react";
import { useState } from "react";
import "../styles/010_colorpalette.css";
import { updateSetting } from "../SiteInterface";

export const themes = [
	{
		name: "Dark",
		colors: {
			"--ProtoTypeMainBG": "#000000",
			"--ProtoTypeMainColor": "#ffffff",
			"--ProtoTypeMainAccent": "#ff0000",
			"--ProtoTypeSecondAccent": "#ffffff",
		},
	},
	{
		name: "Grey",
		colors: {
			"--ProtoTypeMainBG": "#212121",
			"--ProtoTypeMainColor": "#eeeeee",
			"--ProtoTypeMainAccent": "#007bff",
			"--ProtoTypeSecondAccent": "#ff4081",
		},
	},
	{
		name: "Dark Bule",
		colors: {
			"--ProtoTypeMainBG": "#000011",
			"--ProtoTypeMainColor": "#eeeeee",
			"--ProtoTypeMainAccent": "#EDE84C",
			"--ProtoTypeSecondAccent": "#0000ee",
		},
	},
	{
		name: "Light",
		colors: {
			"--ProtoTypeMainBG": "#eeeeee",
			"--ProtoTypeMainColor": "#333333",
			"--ProtoTypeMainAccent": "#ff0000",
			"--ProtoTypeSecondAccent": "#0000ee",
		},
	},
	{
		name: "SoftLight",
		colors: {
			"--ProtoTypeMainBG": "#333333",
			"--ProtoTypeMainColor": "#F5F5F5",
			"--ProtoTypeMainAccent": "#FF6600",
			"--ProtoTypeSecondAccent": "#33CC99",
		},
	},
	{
		name: "Energy",
		colors: {
			"--ProtoTypeMainBG": "#000000",
			"--ProtoTypeMainColor": "#fefefe",
			"--ProtoTypeMainAccent": "#27ff25",
			"--ProtoTypeSecondAccent": "#ffffff",
		},
	},
	{
		name: "tropical",
		colors: {
			"--ProtoTypeMainBG": "#003366",
			"--ProtoTypeMainColor": "#FFFFFF",
			"--ProtoTypeMainAccent": "#FF9900",
			"--ProtoTypeSecondAccent": "#00CC99",
		},
	},
	{
		name: "white",
		colors: {
			"--ProtoTypeMainBG": "#FFFFFF",
			"--ProtoTypeMainColor": "#1A1A1A",
			"--ProtoTypeMainAccent": "#00AAFF",
			"--ProtoTypeSecondAccent": "#FF6600",
		},
	},
	{
		name: "modern",
		colors: {
			"--ProtoTypeMainBG": "#333333",
			"--ProtoTypeMainColor": "#FFFFFF",
			"--ProtoTypeMainAccent": "#FF3366",
			"--ProtoTypeSecondAccent": "#33CCCC",
		},
	},
	{
		name: "material",
		colors: {
			"--ProtoTypeMainBG": "#EEEEEE",
			"--ProtoTypeMainColor": "#212121",
			"--ProtoTypeMainAccent": "#BB86FC",
			"--ProtoTypeSecondAccent": "#03DAC5",
		},
	},
	{
		name: "spring",
		colors: {
			"--ProtoTypeMainBG": "#333333",
			"--ProtoTypeMainColor": "#F9F9F9",
			"--ProtoTypeMainAccent": "#FF6699",
			"--ProtoTypeSecondAccent": "#99CC33",
		},
	},
	{
		name: "autumn",
		colors: {
			"--ProtoTypeMainBG": "#FFFFFF",
			"--ProtoTypeMainColor": "#663300",
			"--ProtoTypeMainAccent": "#FF6600",
			"--ProtoTypeSecondAccent": "#FFCC00",
		},
	},
	{
		name: "winter",
		colors: {
			"--ProtoTypeMainBG": "#FFFFFF",
			"--ProtoTypeMainColor": "#003366",
			"--ProtoTypeMainAccent": "#66CCFF",
			"--ProtoTypeSecondAccent": "#CCCCCC",
		},
	},
	{
		name: "pastel",
		colors: {
			"--ProtoTypeMainBG": "#333333",
			"--ProtoTypeMainColor": "#F0F0F0",
			"--ProtoTypeMainAccent": "#FFB6C1",
			"--ProtoTypeSecondAccent": "#B0E0E6",
		},
	},
	{
		name: "mono",
		colors: {
			"--ProtoTypeMainBG": "#FFFFFF",
			"--ProtoTypeMainColor": "#001133",
			"--ProtoTypeMainAccent": "#0066CC",
			"--ProtoTypeSecondAccent": "#99CCFF",
		},
	},
	{
		name: "monogr",
		colors: {
			"--ProtoTypeMainBG": "#FFFFFF",
			"--ProtoTypeMainColor": "#003300",
			"--ProtoTypeMainAccent": "#00CC66",
			"--ProtoTypeSecondAccent": "#99FFCC",
		},
	},
	{
		name: "china",
		colors: {
			"--ProtoTypeMainBG": "#5b0619",
			"--ProtoTypeMainColor": "#eeeeee",
			"--ProtoTypeMainAccent": "#edd862",
			"--ProtoTypeSecondAccent": "#eeeeee",
		},
	},
	{
		name: "moon",
		colors: {
			"--ProtoTypeMainBG": "#0a0a3e",
			"--ProtoTypeMainColor": "#eeeeee",
			"--ProtoTypeMainAccent": "#ecd867",
			"--ProtoTypeSecondAccent": "#eeeeee",
		},
	},
	{
		name: "red",
		colors: {
			"--ProtoTypeMainBG": "#bf1e2e",
			"--ProtoTypeMainColor": "#eeeeee",
			"--ProtoTypeMainAccent": "#eeeeee",
			"--ProtoTypeSecondAccent": "#eeeeee",
		},
	},

	{
		name: "white red",
		colors: {
			"--ProtoTypeMainBG": "#eeeeee",
			"--ProtoTypeMainColor": "#bf1e2e",
			"--ProtoTypeMainAccent": "#bf1e2e",
			"--ProtoTypeSecondAccent": "#bf1e2e",
		},
	},
];

const ColorPalette: React.FC = () => {
	const [, setCurrentTheme] = useState(themes[0].name);

	const applyTheme = (theme: (typeof themes)[0]) => {
		Object.entries(theme.colors).forEach(([key, value]) => {
			document.documentElement.style.setProperty(key, value);
		});
		setCurrentTheme(theme.name);
		updateSetting("colorTheme", {
			name: theme.name,
			colors: {
				MainBG: theme.colors["--ProtoTypeMainBG"],
				MainColor: theme.colors["--ProtoTypeMainColor"],
				MainAccent: theme.colors["--ProtoTypeMainAccent"],
				SecondAccent: theme.colors["--ProtoTypeSecondAccent"],
			},
		});
	};

	return (
		<div className="p-4" style={{ zIndex: 1 }}>
			<h1>カラーテーマ</h1>
			<div
				style={{
					overflowX: "auto",
					overflowY: "hidden",
					scrollbarWidth: "thin",
					WebkitOverflowScrolling: "touch",
					paddingBottom: "10px",
					maxWidth: "100%",
				}}
			>
				<div
					className="flex gap-4"
					style={{
						display: "flex",
						flexWrap: "nowrap",
						minWidth: "min-content",
					}}
				>
					{themes.map((theme) => (
						<div key={theme.name} style={{ flexShrink: 0 }}>
							<button type="button" onClick={() => applyTheme(theme)}>
								<svg width="100" height="100" viewBox="-100 -100 200 200">
									<filter id="invert">
										<feColorMatrix
											values="-1 0 0 0 1 
                                0 -1 0 0 1 
                                0 0 -1 0 1 
                                0 0 0 1 0"
										/>
									</filter>

									<circle
										cx="0"
										cy="0"
										r="100"
										fill={theme.colors["--ProtoTypeMainBG"]}
										strokeWidth="2"
										stroke="transparent"
									/>

									<circle
										cx="0"
										cy="0"
										r="100"
										fill="none"
										stroke={theme.colors["--ProtoTypeMainBG"]}
										strokeWidth="2"
										filter="url(#invert)"
									/>

									<circle
										cx="-30"
										cy="-20"
										r="40"
										fill={theme.colors["--ProtoTypeMainColor"]}
									/>
									<circle
										cx="40"
										cy="10"
										r="25"
										fill={theme.colors["--ProtoTypeMainAccent"]}
									/>
									<circle
										cx="0"
										cy="45"
										r="15"
										fill={theme.colors["--ProtoTypeSecondAccent"]}
									/>
								</svg>
								<br />
								<span>{theme.name}</span>
							</button>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default ColorPalette;

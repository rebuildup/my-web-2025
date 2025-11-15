import { QRCodeSVG } from "qrcode.react";
import React from "react";

// Golden ratio constant
const PHI = (1 + Math.sqrt(5)) / 2;

/*
 * This component reproduces the original Illustrator-based business card
 * using explicit golden‑ratio splits in both the horizontal and vertical
 * directions.  The proportions mirror the original SVG closely: the
 * white text area occupies 1/φ of the card’s width; the wide belt,
 * inter‑belt gap, narrow belt and right margin consume the same
 * absolute proportions as measured from the original artwork.  The
 * vertical layout likewise follows the φ‑grid: a top margin of
 * H/φ⁴, a school/department/club block ending at H/φ³, a
 * name/intro block, a 3‑row info block plus QR, and a bottom area
 * reserved for colour codes.  Within the school block the first two
 * lines are left‑aligned while the club is right‑aligned to match the
 * original placement.  The colour codes are centred symmetrically
 * around the wide belt’s left edge by giving the white area equal
 * left and right padding.
 */

// Card dimensions taken from the original Illustrator SVG (mm); these are
// used to compute cross‑proportional margins (vertical → horizontal)
const CARD_W = 258.47;
const CARD_H = 156.43;

/*
 * To simplify the layout and more closely follow the user’s request, we
 * split the card vertically into three golden‑ratio sections instead of
 * the earlier 5‑split φ‑grid.  First we divide the height into a
 * “text” region and a “blank” region with the golden ratio 1.618:1.
 * Then we subdivide the blank region again with the same ratio.  This
 * yields three vertical bands whose heights are proportional to:
 *   topAreaRatio  = φ/(φ+1)    ≈ 0.618 (for all text content)
 *   midAreaRatio  = (1/(φ+1))·(φ/(φ+1)) ≈ 0.236 (for the contact info + QR)
 *   bottomRatio   = (1/(φ+1))² ≈ 0.146 (for margins and colour codes)
 *
 * The bottomRatio governs the cross‑proportional margins: the bottom
 * band’s height (≈14.6% of the card height) serves as the baseline
 * length that determines the top padding within the text area and the
 * horizontal padding inside the white area.  We convert this length
 * into a width fraction via the card’s aspect ratio to compute the
 * left/right padding as a percentage of the white area’s width.
 */
const leftRatio = PHI / (PHI + 1); // ≈0.618 (white area width / total width)
const rightRatio = 1 / (PHI + 1); // ≈0.382 (belt area + margins)
const topAreaRatio = leftRatio; // top section height / total height
const midAreaRatio = rightRatio * leftRatio; // ≈0.236
const bottomRatio = rightRatio * rightRatio; // ≈0.146

// Convert the bottomRatio (a height fraction) to a horizontal padding for
// the left area.  The cross‑proportional left margin is defined as
// bottomRatio × (card height / card width), giving a fraction of the
// card’s width.  To express this padding relative to the white area’s
// width we divide by leftRatio.  The result is used as a percentage.
const leftMarginRatio = bottomRatio * (CARD_H / CARD_W);
const sidePadPercent = (leftMarginRatio / leftRatio) * 100; // ≈14.3%

// The same bottomRatio also defines the vertical top padding within the
// top text area.  This top margin is bottomRatio of the total height;
// relative to the top area’s height it becomes bottomRatio/topAreaRatio.
const topPadPercent = (bottomRatio / topAreaRatio) * 100; // ≈23.6%

// Horizontal ratios measured from the original SVG (approx values)
const TEXT_TOTAL_RATIO = 1 / PHI; // ≈0.618 (white area including margins)
const BIG_BELT_RATIO = 0.24; // wide belt width / total width
const GAP_RATIO = 0.0213; // gap between belts / total width
const SMALL_BELT_RATIO = 0.048; // narrow belt width / total width
const RIGHT_MARGIN_RATIO =
	1 - (TEXT_TOTAL_RATIO + BIG_BELT_RATIO + GAP_RATIO + SMALL_BELT_RATIO);

export interface ImprovedMeishiProps {
	/** Background colour of the card (paper colour) */
	baseColor?: string;
	/** Primary colour used for belts and text */
	mainColor?: string;
	/** Text colour; defaults to mainColor */
	textColor?: string;
	/** URL encoded into the QR code */
	url?: string;
}

export const ImprovedMeishiPhi: React.FC<ImprovedMeishiProps> = ({
	baseColor = "#FFFFFF",
	mainColor = "#231815",
	textColor,
	url = "https://yusuke-kim.com",
}) => {
	const fg = textColor ?? mainColor;
	return (
		<div
			style={{
				width: "min(640px, 100%)",
				aspectRatio: "258.47 / 156.43",
				display: "flex",
				boxShadow: "0 10px 36px rgba(0,0,0,0.12)",
				fontFamily:
					'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans JP", sans-serif',
			}}
		>
			{/* Left white area containing all text and QR */}
			<div
				style={{
					flexBasis: `${leftRatio * 100}%`,
					backgroundColor: baseColor,
					display: "flex",
					flexDirection: "column",
					paddingLeft: `${sidePadPercent}%`,
					paddingRight: `${sidePadPercent}%`,
				}}
			>
				{/* Top text area (school, name, tagline) */}
				<div
					style={{
						flexBasis: `${topAreaRatio * 100}%`,
						display: "flex",
						flexDirection: "column",
					}}
				>
					{/* Top padding within the top area */}
					<div style={{ flexBasis: `${topPadPercent}%`, flexShrink: 0 }} />
					{/* Content area for school, dept/club, name and tagline */}
					<div
						style={{
							flexGrow: 1,
							display: "flex",
							flexDirection: "column",
							justifyContent: "space-between",
							color: fg,
						}}
					>
						{/* School name */}
						<div style={{ fontSize: "0.7rem", lineHeight: 1.4 }}>
							<div>宇部工業高等専門学校</div>
						</div>
						{/* Department and club on the same row, left and right aligned */}
						<div
							style={{
								fontSize: "0.7rem",
								lineHeight: 1.4,
								display: "flex",
								justifyContent: "space-between",
								whiteSpace: "nowrap",
							}}
						>
							<span>制御情報工学科</span>
							<span>コンピューター部</span>
						</div>
						{/* Name */}
						<div
							style={{
								fontSize: "1.8rem",
								fontWeight: 900,
								letterSpacing: "0.06em",
								lineHeight: 1.2,
							}}
						>
							木村友亮
						</div>
						{/* Tagline */}
						<div
							style={{
								fontSize: "0.8rem",
								lineHeight: 1.4,
							}}
						>
							デザイン / 映像 / プログラミング
						</div>
					</div>
				</div>
				{/* Middle area for contact info and QR */}
				<div
					style={{
						flexBasis: `${midAreaRatio * 100}%`,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
					}}
				>
					<div style={{ display: "flex", width: "100%" }}>
						{/* Contact lines */}
						<div
							style={{
								flex: 12,
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
								fontSize: "0.7rem",
								lineHeight: 1.4,
								color: fg,
								whiteSpace: "nowrap",
							}}
						>
							<div>
								<span style={{ fontWeight: 700 }}>mobile</span> 080-8009-0694
							</div>
							<div>
								<span style={{ fontWeight: 700 }}>mail</span>{" "}
								rebuild.up.up@gmail.com
							</div>
							<div>
								<span style={{ fontWeight: 700 }}>web</span>{" "}
								https://yusuke-kim.com
							</div>
						</div>
						{/* QR code */}
						<div
							style={{
								flex: 1,
								display: "flex",
								alignItems: "flex-end",
								justifyContent: "center",
							}}
						>
							<QRCodeSVG
								value={url}
								bgColor={baseColor}
								fgColor={mainColor}
								style={{ width: "100%", height: "auto" }}
							/>
						</div>
					</div>
				</div>
				{/* Bottom area for colour codes and bottom margin */}
				<div
					style={{
						flexBasis: `${bottomRatio * 100}%`,
						display: "flex",
						flexDirection: "column",
						justifyContent: "flex-end",
					}}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							fontSize: "0.7rem",
							fontWeight: 700,
							color: fg,
						}}
					>
						<span>{baseColor.toUpperCase()}</span>
						<span>{mainColor.toUpperCase()}</span>
					</div>
				</div>
			</div>

			{/* Wide belt */}
			<div
				style={{
					flexBasis: `${BIG_BELT_RATIO * 100}%`,
					backgroundColor: mainColor,
				}}
			/>

			{/* Gap between belts */}
			<div
				style={{
					flexBasis: `${GAP_RATIO * 100}%`,
					backgroundColor: baseColor,
				}}
			/>

			{/* Narrow belt */}
			<div
				style={{
					flexBasis: `${SMALL_BELT_RATIO * 100}%`,
					backgroundColor: mainColor,
				}}
			/>

			{/* Right margin matching the original SVG */}
			<div
				style={{
					flexBasis: `${RIGHT_MARGIN_RATIO * 100}%`,
					backgroundColor: baseColor,
				}}
			/>
		</div>
	);
};
export default ImprovedMeishiPhi;

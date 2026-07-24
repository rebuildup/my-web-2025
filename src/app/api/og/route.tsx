export const dynamic = "force-static";

import { readFile } from "node:fs/promises";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { BackgroundImage } from "./BackgroundImage";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { RotatedSlug } from "./RotatedSlug";
import { Thumbnail } from "./Thumbnail";
import { parseOgParams } from "./params";
import { theme } from "./theme";

let notoSansJpFontPromise: Promise<ArrayBuffer | null> | null = null;

async function loadNotoSansJpFont() {
	notoSansJpFontPromise ??= readFile(
		new URL("../../../../public/fonts/noto-sans-jp-700.ttf", import.meta.url),
	)
		.then((buffer) =>
			buffer.buffer.slice(
				buffer.byteOffset,
				buffer.byteOffset + buffer.byteLength,
			),
		)
		.catch(() => null);
	return notoSansJpFontPromise;
}

export async function GET(req: NextRequest) {
	try {
		const params = parseOgParams(req);
		const fontData = await loadNotoSansJpFont();

		return new ImageResponse(
			(
				<div
					style={{
						height: "100%",
						width: "100%",
						display: "flex",
						flexDirection: "row",
						backgroundColor: theme.backgroundColor,
						fontFamily: "Noto Sans JP",
						alignItems: "center",
						position: "relative",
						overflow: "hidden",
					}}
				>
					<BackgroundImage src={params.thumbnailSrc} />
					<RotatedSlug slug={params.slug} side="left" />
					<RotatedSlug slug={params.slug} side="right" />

					<div
						style={{
							display: "flex",
							flexDirection: "row",
							width: "100%",
							height: "100%",
							padding: 80,
							gap: 40,
							alignItems: "center",
						}}
					>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
								height: "100%",
								flexGrow: 1,
								flexShrink: 1,
								paddingTop: 20,
								paddingBottom: 20,
							}}
						>
							<Header title={params.title} summary={params.summary} />
							<Footer
								category={params.category}
								displayTags={params.displayTags}
							/>
						</div>
						<Thumbnail src={params.thumbnailSrc} />
					</div>
				</div>
			),
			{
				width: 1200,
				height: 630,
				fonts: fontData
					? [
							{
								name: "Noto Sans JP",
								data: fontData,
								style: "normal",
								weight: 700,
							},
						]
					: undefined,
			},
		);
	} catch (e: any) {
		console.log(`${e?.message || e}`);
		return new Response(`Failed to generate the image: ${e?.message || e}`, {
			status: 500,
		});
	}
}

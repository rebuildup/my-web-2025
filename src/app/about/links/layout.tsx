import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	title: "Links - samuido",
	description:
		"samuidoの各種SNSアカウントや外部サイトへのリンク集です。X(Twitter)、GitHub、YouTube、Discord、Boothなど。",
	keywords: [
		"samuido",
		"リンク集",
		"SNS",
		"ソーシャルメディア",
		"Twitter",
		"GitHub",
		"YouTube",
		"Discord",
		"Booth",
	],
	authors: [{ name: "samuido", url: "https://yusuke-kim.com/about" }],
	creator: "samuido",
	publisher: "samuido",
	robots: "index, follow",
	metadataBase: new URL("https://links.yusuke-kim.com"),
	alternates: {
		canonical: "https://links.yusuke-kim.com",
	},
	openGraph: {
		title: "Links - samuido",
		description:
			"samuidoの各種SNSアカウントや外部サイトへのリンク集です。X(Twitter)、GitHub、YouTube、Discord、Boothなど。",
		type: "website",
		url: "https://links.yusuke-kim.com",
		siteName: "samuido",
		locale: "ja_JP",
		images: [
			{
				url: "https://yusuke-kim.com/images/og-image.png",
				width: 1200,
				height: 630,
				alt: "samuido Links",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Links - samuido",
		description:
			"samuidoの各種SNSアカウントや外部サイトへのリンク集です。X(Twitter)、GitHub、YouTube、Discord、Boothなど。",
		creator: "@361do_sleep",
		images: ["https://yusuke-kim.com/images/twitter-image.jpg"],
	},
};

export default function LinksLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}

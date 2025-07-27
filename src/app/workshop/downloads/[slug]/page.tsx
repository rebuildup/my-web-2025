import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentItem } from "@/types/content";
import ContentDetail from "../../components/ContentDetail";

interface DownloadDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getDownload(slug: string): Promise<ContentItem | null> {
  try {
    // Skip API calls during build if no base URL is set
    if (
      !process.env.NEXT_PUBLIC_BASE_URL &&
      process.env.NODE_ENV === "production"
    ) {
      return null;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/content/download`,
      {
        cache: "no-store",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch downloads");
    }
    const data = await response.json();
    const downloads: ContentItem[] = data.data || [];
    return (
      downloads.find(
        (download) => download.id === slug && download.status === "published",
      ) || null
    );
  } catch {
    // Silently handle API connection errors during build time
    return null;
  }
}

export async function generateMetadata({
  params,
}: DownloadDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const download = await getDownload(slug);

  if (!download) {
    return {
      title: "素材が見つかりません - Downloads | samuido",
      description: "指定された素材は見つかりませんでした。",
    };
  }

  return {
    title: `${download.title} - Downloads | samuido`,
    description: download.description,
    keywords: [
      ...download.tags,
      "テンプレート",
      "素材",
      "ダウンロード",
      "無料",
    ],
    robots: "index, follow",
    openGraph: {
      title: `${download.title} - Downloads | samuido`,
      description: download.description,
      type: "website",
      url: `https://yusuke-kim.com/workshop/downloads/${download.id}`,
      siteName: "samuido",
      locale: "ja_JP",
      images: download.thumbnail
        ? [{ url: download.thumbnail, alt: download.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${download.title} - Downloads | samuido`,
      description: download.description,
      creator: "@361do_sleep",
      images: download.thumbnail ? [download.thumbnail] : undefined,
    },
    alternates: {
      canonical: `https://yusuke-kim.com/workshop/downloads/${download.id}`,
    },
  };
}

export default async function DownloadDetailPage({
  params,
}: DownloadDetailPageProps) {
  const { slug } = await params;
  const download = await getDownload(slug);

  if (!download) {
    notFound();
  }

  // Track view
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/stats/view`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contentId: download.id }),
        cache: "no-store",
      },
    );
  } catch {
    // Silently handle view tracking errors during build time
  }

  return (
    <ContentDetail
      content={download}
      backUrl="/workshop/downloads"
      backLabel="Downloads"
    />
  );
}

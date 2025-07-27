import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentItem } from "@/types/content";
import ContentDetail from "../../components/ContentDetail";

interface PluginDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getPlugin(slug: string): Promise<ContentItem | null> {
  try {
    // Skip API calls during build if no base URL is set
    if (
      !process.env.NEXT_PUBLIC_BASE_URL &&
      process.env.NODE_ENV === "production"
    ) {
      return null;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/content/plugin`,
      {
        cache: "no-store",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch plugins");
    }
    const data = await response.json();
    const plugins: ContentItem[] = data.data || [];
    return (
      plugins.find(
        (plugin) => plugin.id === slug && plugin.status === "published",
      ) || null
    );
  } catch {
    // Silently handle API connection errors during build time
    return null;
  }
}

export async function generateMetadata({
  params,
}: PluginDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const plugin = await getPlugin(slug);

  if (!plugin) {
    return {
      title: "プラグインが見つかりません - Plugins | samuido",
      description: "指定されたプラグインは見つかりませんでした。",
    };
  }

  return {
    title: `${plugin.title} - Plugins | samuido`,
    description: plugin.description,
    keywords: [
      ...plugin.tags,
      "AfterEffects",
      "Premiere Pro",
      "プラグイン",
      "無料",
    ],
    robots: "index, follow",
    openGraph: {
      title: `${plugin.title} - Plugins | samuido`,
      description: plugin.description,
      type: "website",
      url: `https://yusuke-kim.com/workshop/plugins/${plugin.id}`,
      siteName: "samuido",
      locale: "ja_JP",
      images: plugin.thumbnail
        ? [{ url: plugin.thumbnail, alt: plugin.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${plugin.title} - Plugins | samuido`,
      description: plugin.description,
      creator: "@361do_sleep",
      images: plugin.thumbnail ? [plugin.thumbnail] : undefined,
    },
    alternates: {
      canonical: `https://yusuke-kim.com/workshop/plugins/${plugin.id}`,
    },
  };
}

export default async function PluginDetailPage({
  params,
}: PluginDetailPageProps) {
  const { slug } = await params;
  const plugin = await getPlugin(slug);

  if (!plugin) {
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
        body: JSON.stringify({ contentId: plugin.id }),
        cache: "no-store",
      },
    );
  } catch {
    // Silently handle view tracking errors during build time
  }

  return (
    <ContentDetail
      content={plugin}
      backUrl="/workshop/plugins"
      backLabel="Plugins"
    />
  );
}

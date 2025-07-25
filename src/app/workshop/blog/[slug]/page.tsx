import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentItem } from "@/types/content";
import ContentDetail from "../../components/ContentDetail";

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getBlogPost(slug: string): Promise<ContentItem | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/content/blog`,
      {
        cache: "no-store",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch blog posts");
    }
    const data = await response.json();
    const posts: ContentItem[] = data.data || [];
    return (
      posts.find((post) => post.id === slug && post.status === "published") ||
      null
    );
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: "記事が見つかりません - Blog | samuido",
      description: "指定された記事は見つかりませんでした。",
    };
  }

  return {
    title: `${post.title} - Blog | samuido`,
    description: post.description,
    keywords: post.tags,
    robots: "index, follow",
    openGraph: {
      title: `${post.title} - Blog | samuido`,
      description: post.description,
      type: "article",
      url: `https://yusuke-kim.com/workshop/blog/${post.id}`,
      siteName: "samuido",
      locale: "ja_JP",
      images: post.thumbnail
        ? [{ url: post.thumbnail, alt: post.title }]
        : undefined,
      publishedTime: post.publishedAt || post.createdAt,
      modifiedTime: post.updatedAt,
      authors: ["samuido"],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} - Blog | samuido`,
      description: post.description,
      creator: "@361do_sleep",
      images: post.thumbnail ? [post.thumbnail] : undefined,
    },
    alternates: {
      canonical: `https://yusuke-kim.com/workshop/blog/${post.id}`,
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
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
        body: JSON.stringify({ contentId: post.id }),
        cache: "no-store",
      },
    );
  } catch (error) {
    console.error("Error tracking view:", error);
  }

  return (
    <ContentDetail content={post} backUrl="/workshop/blog" backLabel="Blog" />
  );
}

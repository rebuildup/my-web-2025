import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Tag } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  slug: string;
}

const BlogList: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/data/content/blog.json');
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return <div>Loading blog posts...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="rounded-none bg-gray-800 p-6 text-white">
      <h2 className="neue-haas-grotesk-display mb-4 text-xl font-bold text-blue-500">Blog Posts</h2>
      <div className="space-y-6">
        {posts.map(post => (
          <Link
            href={`/workshop/blog/${post.slug}`}
            key={post.id}
            className="block rounded-none bg-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-blue-400">{post.title}</h3>
            <div className="my-2 flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{formatDate(post.date)}</span>
              </div>
            </div>
            <p className="mb-4 text-sm text-gray-300">{post.excerpt}</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-gray-600 px-2 py-1 text-xs text-gray-300"
                >
                  <Tag size={12} />
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BlogList;

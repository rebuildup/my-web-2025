import React, { useState } from 'react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: number;
  tags: string[];
}

const BlogList: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Building Modern Web Applications with React and TypeScript',
      excerpt:
        'Learn how to create scalable and maintainable web applications using React, TypeScript, and modern development practices.',
      category: 'development',
      date: '2024-01-15',
      readTime: 8,
      tags: ['React', 'TypeScript', 'Web Development'],
    },
    {
      id: '2',
      title: 'Advanced CSS Grid Techniques for Responsive Design',
      excerpt:
        'Master CSS Grid to create complex, responsive layouts that work across all devices and screen sizes.',
      category: 'design',
      date: '2024-01-10',
      readTime: 6,
      tags: ['CSS', 'Grid', 'Responsive Design'],
    },
    {
      id: '3',
      title: 'Performance Optimization in Three.js Applications',
      excerpt:
        'Techniques and best practices for optimizing 3D web applications to ensure smooth performance across devices.',
      category: 'performance',
      date: '2024-01-05',
      readTime: 12,
      tags: ['Three.js', 'Performance', 'WebGL'],
    },
  ];

  const categories = ['all', 'development', 'design', 'performance'];

  const filteredPosts =
    selectedCategory === 'all'
      ? blogPosts
      : blogPosts.filter(post => post.category === selectedCategory);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="rounded-none bg-gray-800 p-6 text-white">
      <h2 className="neue-haas-grotesk-display mb-4 text-xl font-bold text-blue-500">Blog Posts</h2>

      {/* Filter buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`rounded-none px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Blog posts list */}
      <div className="space-y-6">
        {filteredPosts.map(post => (
          <article key={post.id} className="rounded-none bg-gray-700 p-6">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="mb-2 cursor-pointer text-lg font-semibold text-blue-400 hover:text-blue-300">
                  {post.title}
                </h3>
                <p className="mb-3 text-sm text-gray-300">{post.excerpt}</p>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span>{formatDate(post.date)}</span>
              <span>{post.readTime} min read</span>
              <span className="rounded-none bg-gray-600 px-2 py-1 text-gray-300">
                {post.category}
              </span>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="rounded-none bg-gray-600 px-2 py-1 text-xs text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <button className="rounded-none bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-600">
                Read More
              </button>
              <button className="rounded-none bg-gray-600 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700">
                Share
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default BlogList;

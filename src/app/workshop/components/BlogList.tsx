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
      excerpt: 'Learn how to create scalable and maintainable web applications using React, TypeScript, and modern development practices.',
      category: 'development',
      date: '2024-01-15',
      readTime: 8,
      tags: ['React', 'TypeScript', 'Web Development']
    },
    {
      id: '2',
      title: 'Advanced CSS Grid Techniques for Responsive Design',
      excerpt: 'Master CSS Grid to create complex, responsive layouts that work across all devices and screen sizes.',
      category: 'design',
      date: '2024-01-10',
      readTime: 6,
      tags: ['CSS', 'Grid', 'Responsive Design']
    },
    {
      id: '3',
      title: 'Performance Optimization in Three.js Applications',
      excerpt: 'Techniques and best practices for optimizing 3D web applications to ensure smooth performance across devices.',
      category: 'performance',
      date: '2024-01-05',
      readTime: 12,
      tags: ['Three.js', 'Performance', 'WebGL']
    }
  ];

  const categories = ['all', 'development', 'design', 'performance'];

  const filteredPosts = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-none">
      <h2 className="text-blue-500 text-xl font-bold mb-4 neue-haas-grotesk-display">
        Blog Posts
      </h2>
      
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-none text-sm font-medium transition-colors ${
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
          <article key={post.id} className="bg-gray-700 p-6 rounded-none">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 text-blue-400 hover:text-blue-300 cursor-pointer">
                  {post.title}
                </h3>
                <p className="text-gray-300 text-sm mb-3">{post.excerpt}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-3">
              <span>{formatDate(post.date)}</span>
              <span>{post.readTime} min read</span>
              <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded-none">
                {post.category}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded-none"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-none transition-colors">
                Read More
              </button>
              <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-none transition-colors">
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
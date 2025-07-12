'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  Download,
  Image,
  File,
  Settings,
  Database,
  Code,
} from 'lucide-react';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Data Manager',
  description: '開発サーバー専用のコンテンツデータ管理ツール',
  url: 'https://yusuke-kim.com/admin/data-manager',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web Browser',
  author: {
    '@type': 'Person',
    name: '木村友亮',
    alternateName: 'samuido',
  },
  creator: {
    '@type': 'Person',
    name: '木村友亮',
    alternateName: 'samuido',
  },
};

interface ContentItem {
  id: string;
  type: 'portfolio' | 'blog' | 'plugin' | 'download' | 'tool';
  title: string;
  description: string;
  content?: string;
  tags: string[];
  category: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  author: string;
  mediaUrl?: string;
  downloadUrl?: string;
  fileSize?: string;
  downloadCount?: number;
  ogImage?: string;
  markdownContent?: string;
}

export default function AdminDataManagerPage() {
  const [isDevMode, setIsDevMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'list' | 'create' | 'edit' | 'preview'>('list');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [selectedType, setSelectedType] = useState<
    'all' | 'portfolio' | 'blog' | 'plugin' | 'download' | 'tool'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewData, setPreviewData] = useState<ContentItem | null>(null);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    tags: '',
    category: '',
    type: 'blog' as ContentItem['type'],
    status: 'draft' as ContentItem['status'],
    ogImage: '',
    markdownContent: '',
  });

  useEffect(() => {
    setIsDevMode(process.env.NODE_ENV === 'development');
    loadContentItems();
  }, []);

  const loadContentItems = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockItems: ContentItem[] = [
      {
        id: '1',
        type: 'portfolio',
        title: 'React Dashboard Project',
        description: 'A comprehensive dashboard built with React and TypeScript',
        content: '# React Dashboard\n\nThis project showcases...',
        tags: ['React', 'TypeScript', 'Dashboard'],
        category: 'Web Development',
        status: 'published',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
        author: 'Admin',
        mediaUrl: '/images/portfolio/react-dashboard.jpg',
        ogImage: '/images/og-images/react-dashboard-og.jpg',
        markdownContent: '# React Dashboard\n\n## Overview\n\nThis project showcases...',
      },
      {
        id: '2',
        type: 'blog',
        title: 'Modern JavaScript Patterns',
        description: 'Exploring advanced JavaScript patterns and best practices',
        content: '# JavaScript Patterns\n\nIn this article, we explore...',
        tags: ['JavaScript', 'Patterns', 'Best Practices'],
        category: 'Programming',
        status: 'published',
        createdAt: '2024-01-14T09:15:00Z',
        updatedAt: '2024-01-14T16:45:00Z',
        author: 'Admin',
        ogImage: '/images/og-images/javascript-patterns-og.jpg',
        markdownContent:
          '# Modern JavaScript Patterns\n\n## Introduction\n\nIn this article, we explore...',
      },
      {
        id: '3',
        type: 'plugin',
        title: 'Color Palette Generator Plugin',
        description: 'Generate beautiful color palettes for your designs',
        tags: ['Design', 'Colors', 'Tools'],
        category: 'Design Tools',
        status: 'published',
        createdAt: '2024-01-13T11:20:00Z',
        updatedAt: '2024-01-13T11:20:00Z',
        author: 'Admin',
        downloadUrl: '/downloads/color-palette-plugin.zip',
        fileSize: '2.1 MB',
        downloadCount: 847,
        ogImage: '/images/og-images/color-palette-plugin-og.jpg',
        markdownContent:
          '# Color Palette Generator Plugin\n\n## Features\n\n- Generate beautiful color palettes...',
      },
    ];

    setContentItems(mockItems);
    setFilteredItems(mockItems);
  };

  const filterItems = useCallback(() => {
    let filtered = contentItems;

    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredItems(filtered);
  }, [contentItems, selectedType, searchQuery]);

  useEffect(() => {
    filterItems();
  }, [filterItems]);

  const handleCreateNew = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      tags: '',
      category: '',
      type: 'blog',
      status: 'draft',
      ogImage: '',
      markdownContent: '',
    });
    setSelectedTab('create');
  };

  const handleEdit = (item: ContentItem) => {
    setFormData({
      title: item.title,
      description: item.description,
      content: item.content || '',
      tags: item.tags.join(', '),
      category: item.category,
      type: item.type,
      status: item.status,
      ogImage: item.ogImage || '',
      markdownContent: item.markdownContent || '',
    });
    setSelectedTab('edit');
  };

  const handlePreview = (item: ContentItem) => {
    setPreviewData(item);
    setSelectedTab('preview');
  };

  const handleSave = async () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSelectedTab('list');
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setContentItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file upload
      console.log('File uploaded:', file.name);
    }
  };

  const generateJSON = () => {
    const jsonData = {
      items: contentItems,
      generatedAt: new Date().toISOString(),
      totalItems: contentItems.length,
    };

    // Create downloadable JSON
    const dataStr = JSON.stringify(jsonData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'content-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'portfolio':
        return <Image size={16} />;
      case 'blog':
        return <FileText size={16} />;
      case 'plugin':
        return <Code size={16} />;
      case 'download':
        return <Download size={16} />;
      case 'tool':
        return <Settings size={16} />;
      default:
        return <File size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-500';
      case 'draft':
        return 'text-yellow-500';
      case 'archived':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  if (!isDevMode) {
    return (
      <div className="container-grid">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Database size={64} className="mx-auto mb-6 text-red-500" />
            <h1 className="neue-haas-grotesk-display mb-4 text-4xl text-white">Access Denied</h1>
            <p className="noto-sans-jp-regular mb-6 text-gray-300">
              Admin access is only available in development mode.
            </p>
            <Link
              href="/"
              className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-grid">
        {/* Navigation */}
        <nav className="border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <Link
              href="/05_admin"
              className="neue-haas-grotesk-display text-2xl text-blue-400 hover:text-blue-300"
            >
              ← Admin Dashboard
            </Link>
            <div className="text-sm text-gray-400">Development Mode Only</div>
          </div>
        </nav>

        {/* Header */}
        <header className="py-16 text-center">
          <h1 className="neue-haas-grotesk-display mb-4 text-4xl text-white md:text-6xl">
            Data Manager
          </h1>
          <p className="noto-sans-jp-light mb-8 text-xl text-gray-300 md:text-2xl">
            コンテンツデータ管理
          </p>
          <p className="noto-sans-jp-regular mx-auto max-w-3xl text-base md:text-lg">
            開発サーバー専用のコンテンツデータ管理ツール
            <br />
            動画、画像、Markdownファイルなどを管理し、JSON出力とプレビュー機能を提供
          </p>
        </header>

        {/* Main Content */}
        <main className="pb-16">
          {/* Tab Navigation */}
          <div className="mb-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setSelectedTab('list')}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                selectedTab === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Content List
            </button>
            <button
              onClick={handleCreateNew}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                selectedTab === 'create'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Create New
            </button>
            <button
              onClick={generateJSON}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700"
            >
              Export JSON
            </button>
          </div>

          {/* Content List */}
          {selectedTab === 'list' && (
            <section className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search content..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  {(['all', 'portfolio', 'blog', 'plugin', 'download', 'tool'] as const).map(
                    type => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                          selectedType === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Content Items */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredItems.map(item => (
                  <div key={item.id} className="card">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <span className="text-xs text-gray-400">{item.type}</span>
                      </div>
                      <span className={`text-xs ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>

                    <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">
                      {item.title}
                    </h3>
                    <p className="noto-sans-jp-light mb-4 text-sm text-gray-400">
                      {item.description}
                    </p>

                    <div className="mb-4 flex flex-wrap gap-2">
                      {item.tags.map(tag => (
                        <span key={tag} className="bg-gray-600 px-2 py-1 text-xs text-white">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mb-4 text-xs text-gray-400">
                      <div>Created: {formatDate(item.createdAt)}</div>
                      <div>Updated: {formatDate(item.updatedAt)}</div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs text-white transition-colors hover:bg-blue-700"
                      >
                        <Edit size={14} className="mr-1 inline" />
                        Edit
                      </button>
                      <button
                        onClick={() => handlePreview(item)}
                        className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-xs text-white transition-colors hover:bg-green-700"
                      >
                        <Eye size={14} className="mr-1 inline" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg bg-red-600 px-3 py-2 text-xs text-white transition-colors hover:bg-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Create/Edit Form */}
          {(selectedTab === 'create' || selectedTab === 'edit') && (
            <section className="card">
              <h2 className="neue-haas-grotesk-display mb-6 text-2xl text-white">
                {selectedTab === 'create' ? 'Create New Content' : 'Edit Content'}
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="noto-sans-jp-regular mb-2 block text-sm text-gray-300">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="noto-sans-jp-regular mb-2 block text-sm text-gray-300">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="noto-sans-jp-regular mb-2 block text-sm text-gray-300">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="noto-sans-jp-regular mb-2 block text-sm text-gray-300">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={e => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white"
                    />
                  </div>
                </div>

                {/* Type and Status */}
                <div className="space-y-4">
                  <div>
                    <label className="noto-sans-jp-regular mb-2 block text-sm text-gray-300">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={e =>
                        setFormData({ ...formData, type: e.target.value as ContentItem['type'] })
                      }
                      className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white"
                    >
                      <option value="blog">Blog</option>
                      <option value="portfolio">Portfolio</option>
                      <option value="plugin">Plugin</option>
                      <option value="download">Download</option>
                      <option value="tool">Tool</option>
                    </select>
                  </div>

                  <div>
                    <label className="noto-sans-jp-regular mb-2 block text-sm text-gray-300">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          status: e.target.value as ContentItem['status'],
                        })
                      }
                      className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="noto-sans-jp-regular mb-2 block text-sm text-gray-300">
                      OG Image URL
                    </label>
                    <input
                      type="text"
                      value={formData.ogImage}
                      onChange={e => setFormData({ ...formData, ogImage: e.target.value })}
                      className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="noto-sans-jp-regular mb-2 block text-sm text-gray-300">
                      File Upload
                    </label>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Markdown Content */}
              <div className="mt-6">
                <label className="noto-sans-jp-regular mb-2 block text-sm text-gray-300">
                  Markdown Content
                </label>
                <textarea
                  value={formData.markdownContent}
                  onChange={e => setFormData({ ...formData, markdownContent: e.target.value })}
                  rows={10}
                  className="w-full rounded-lg bg-gray-800 px-3 py-2 font-mono text-sm text-white"
                  placeholder="# Title\n\n## Overview\n\nYour content here..."
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleSave}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  <Save size={16} className="mr-2 inline" />
                  Save
                </button>
                <button
                  onClick={() => setSelectedTab('list')}
                  className="rounded-lg bg-gray-700 px-6 py-2 text-white transition-colors hover:bg-gray-600"
                >
                  <X size={16} className="mr-2 inline" />
                  Cancel
                </button>
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-sm text-gray-300">
                    <span>Saving...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-700">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Preview */}
          {selectedTab === 'preview' && previewData && (
            <section className="card">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="neue-haas-grotesk-display text-2xl text-white">Content Preview</h2>
                <button
                  onClick={() => setSelectedTab('list')}
                  className="rounded-lg bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-600"
                >
                  <X size={16} className="mr-2 inline" />
                  Close
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="neue-haas-grotesk-display mb-2 text-xl text-white">
                    {previewData.title}
                  </h3>
                  <p className="noto-sans-jp-light text-gray-300">{previewData.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {previewData.tags.map(tag => (
                    <span key={tag} className="bg-blue-600 px-2 py-1 text-xs text-white">
                      {tag}
                    </span>
                  ))}
                </div>

                {previewData.markdownContent && (
                  <div className="rounded bg-gray-800 p-4">
                    <h4 className="noto-sans-jp-regular mb-2 text-sm text-gray-300">
                      Markdown Preview
                    </h4>
                    <pre className="text-sm whitespace-pre-wrap text-gray-300">
                      {previewData.markdownContent}
                    </pre>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <span className="ml-2 text-white">{previewData.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className={`ml-2 ${getStatusColor(previewData.status)}`}>
                      {previewData.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Category:</span>
                    <span className="ml-2 text-white">{previewData.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Created:</span>
                    <span className="ml-2 text-white">{formatDate(previewData.createdAt)}</span>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>

        {/* Navigation */}
        <section className="py-12">
          <div className="flex items-center justify-between">
            <Link
              href="/05_admin"
              className="neue-haas-grotesk-display text-lg text-blue-400 hover:text-blue-300"
            >
              ← Admin Dashboard
            </Link>
            <div className="flex gap-4">
              <Link href="/05_admin/content" className="text-sm text-blue-400 hover:text-blue-300">
                Content Manager →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

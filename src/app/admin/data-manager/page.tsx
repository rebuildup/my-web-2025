'use client';

import { useState, useEffect } from 'react';
import { ContentItem, ContentType, MediaEmbed, ExternalLink, DownloadInfo } from '@/types/content';
import {
  Upload,
  FileText,
  Image,
  Video,
  Link,
  Save,
  Download,
  Eye,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Database,
  FileCode,
  Palette,
  Settings,
} from 'lucide-react';

interface DataManagerState {
  contentItems: ContentItem[];
  selectedItem: ContentItem | null;
  isEditing: boolean;
  previewMode: 'edit' | 'live' | 'mobile';
  uploadProgress: number;
  isUploading: boolean;
}

export default function DataManagerPage() {
  const [state, setState] = useState<DataManagerState>({
    contentItems: [],
    selectedItem: null,
    isEditing: false,
    previewMode: 'edit',
    uploadProgress: 0,
    isUploading: false,
  });

  const [activeTab, setActiveTab] = useState<'content' | 'media' | 'preview' | 'export'>('content');
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    // Check if running in development mode
    setIsDevMode(process.env.NODE_ENV === 'development');
    
    // Load existing content items
    loadContentItems();
  }, []);

  const loadContentItems = async () => {
    try {
      // Load content from API or local storage
      const response = await fetch('/api/content/all');
      if (response.ok) {
        const items = await response.json();
        setState(prev => ({ ...prev, contentItems: items }));
      }
    } catch (error) {
      console.error('Failed to load content items:', error);
    }
  };

  const createNewItem = () => {
    const newItem: ContentItem = {
      id: crypto.randomUUID(),
      type: 'portfolio',
      title: 'New Content Item',
      description: '',
      category: 'uncategorized',
      tags: [],
      status: 'draft',
      priority: 50,
      createdAt: new Date().toISOString(),
      customFields: {},
    };

    setState(prev => ({
      ...prev,
      selectedItem: newItem,
      isEditing: true,
    }));
  };

  const updateSelectedItem = (field: keyof ContentItem, value: any) => {
    if (!state.selectedItem) return;

    const updatedItem = {
      ...state.selectedItem,
      [field]: value,
      updatedAt: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      selectedItem: updatedItem,
    }));
  };

  const saveItem = async () => {
    if (!state.selectedItem) return;

    try {
      const response = await fetch('/api/content/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(state.selectedItem),
      });

      if (response.ok) {
        // Update the content items list
        const updatedItems = state.contentItems.some(item => item.id === state.selectedItem!.id)
          ? state.contentItems.map(item => 
              item.id === state.selectedItem!.id ? state.selectedItem! : item
            )
          : [...state.contentItems, state.selectedItem];

        setState(prev => ({
          ...prev,
          contentItems: updatedItems,
          isEditing: false,
        }));
      }
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  const exportData = async (format: 'json' | 'csv' | 'markdown') => {
    try {
      const response = await fetch(`/api/content/export?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `content-export.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setState(prev => ({ ...prev, isUploading: true, uploadProgress: 0 }));

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          // Update selected item with new file
          if (state.selectedItem) {
            const updatedImages = state.selectedItem.images || [];
            updatedImages.push(result.url);
            updateSelectedItem('images', updatedImages);
          }
        }

        setState(prev => ({ 
          ...prev, 
          uploadProgress: ((i + 1) / files.length) * 100 
        }));
      }
    } catch (error) {
      console.error('Failed to upload files:', error);
    } finally {
      setState(prev => ({ ...prev, isUploading: false, uploadProgress: 0 }));
    }
  };

  if (!isDevMode) {
    return (
      <div className="bg-gray flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle size={64} className="text-primary mx-auto mb-6" />
          <h1 className="neue-haas-grotesk-display text-primary mb-4 text-4xl">Access Denied</h1>
          <p className="noto-sans-jp text-foreground/70 mb-6">
            Data Manager is only available in development mode.
          </p>
          <a
            href="/admin"
            className="bg-primary hover:bg-primary/90 inline-block px-6 py-3 text-white transition-colors"
          >
            Back to Admin Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray min-h-screen">
      {/* Header */}
      <header className="border-foreground/20 border-b px-4 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="neue-haas-grotesk-display text-primary text-3xl">Data Manager</h1>
            <p className="noto-sans-jp text-foreground/70">Content Management & Publishing</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={createNewItem}
              className="bg-primary hover:bg-primary/90 flex items-center gap-2 px-4 py-2 text-white transition-colors"
            >
              <Plus size={20} />
              New Item
            </button>
            <button
              onClick={loadContentItems}
              className="border-foreground/20 hover:border-primary flex items-center gap-2 border px-4 py-2 transition-colors"
            >
              <RefreshCw size={20} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Content List */}
          <div className="lg:col-span-1">
            <div className="border-foreground/20 bg-gray/50 border">
              <div className="border-foreground/20 border-b p-4">
                <h2 className="neue-haas-grotesk-display text-foreground text-lg">Content Items</h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {state.contentItems.length === 0 ? (
                  <div className="p-8 text-center">
                    <Database size={48} className="text-foreground/30 mx-auto mb-4" />
                    <p className="text-foreground/70">No content items yet</p>
                  </div>
                ) : (
                  state.contentItems.map((item) => (
                    <div
                      key={item.id}
                      className={`border-foreground/20 hover:bg-gray/30 cursor-pointer border-b p-4 transition-colors ${
                        state.selectedItem?.id === item.id ? 'bg-primary/10' : ''
                      }`}
                      onClick={() => setState(prev => ({ ...prev, selectedItem: item }))}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-foreground font-medium">{item.title}</h3>
                          <p className="text-foreground/60 text-sm">{item.type} • {item.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            item.status === 'published' ? 'bg-green-500/20 text-green-600' :
                            item.status === 'draft' ? 'bg-yellow-500/20 text-yellow-600' :
                            'bg-gray-500/20 text-gray-600'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-2">
            {state.selectedItem ? (
              <div className="border-foreground/20 bg-gray/50 border">
                {/* Tab Navigation */}
                <div className="border-foreground/20 border-b">
                  <div className="flex">
                    {(['content', 'media', 'preview', 'export'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`border-foreground/20 px-6 py-3 text-sm font-medium transition-colors ${
                          activeTab === tab
                            ? 'bg-primary text-white'
                            : 'text-foreground/70 hover:text-foreground hover:bg-gray/30'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  {activeTab === 'content' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                          <label className="text-foreground mb-2 block text-sm font-medium">
                            Title
                          </label>
                          <input
                            type="text"
                            value={state.selectedItem.title}
                            onChange={(e) => updateSelectedItem('title', e.target.value)}
                            className="border-foreground/20 bg-gray/30 text-foreground w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="text-foreground mb-2 block text-sm font-medium">
                            Type
                          </label>
                          <select
                            value={state.selectedItem.type}
                            onChange={(e) => updateSelectedItem('type', e.target.value as ContentType)}
                            className="border-foreground/20 bg-gray/30 text-foreground w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="portfolio">Portfolio</option>
                            <option value="plugin">Plugin</option>
                            <option value="blog">Blog</option>
                            <option value="tool">Tool</option>
                            <option value="asset">Asset</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-foreground mb-2 block text-sm font-medium">
                          Description
                        </label>
                        <textarea
                          value={state.selectedItem.description}
                          onChange={(e) => updateSelectedItem('description', e.target.value)}
                          rows={4}
                          className="border-foreground/20 bg-gray/30 text-foreground w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div>
                          <label className="text-foreground mb-2 block text-sm font-medium">
                            Category
                          </label>
                          <input
                            type="text"
                            value={state.selectedItem.category}
                            onChange={(e) => updateSelectedItem('category', e.target.value)}
                            className="border-foreground/20 bg-gray/30 text-foreground w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="text-foreground mb-2 block text-sm font-medium">
                            Status
                          </label>
                          <select
                            value={state.selectedItem.status}
                            onChange={(e) => updateSelectedItem('status', e.target.value)}
                            className="border-foreground/20 bg-gray/30 text-foreground w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                            <option value="scheduled">Scheduled</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-foreground mb-2 block text-sm font-medium">
                            Priority
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={state.selectedItem.priority}
                            onChange={(e) => updateSelectedItem('priority', parseInt(e.target.value))}
                            className="border-foreground/20 bg-gray/30 text-foreground w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-foreground mb-2 block text-sm font-medium">
                          Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          value={state.selectedItem.tags.join(', ')}
                          onChange={(e) => updateSelectedItem('tags', e.target.value.split(',').map(t => t.trim()))}
                          className="border-foreground/20 bg-gray/30 text-foreground w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="text-foreground mb-2 block text-sm font-medium">
                          Content (Markdown)
                        </label>
                        <textarea
                          value={state.selectedItem.content || ''}
                          onChange={(e) => updateSelectedItem('content', e.target.value)}
                          rows={12}
                          className="border-foreground/20 bg-gray/30 text-foreground w-full border px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div className="flex justify-end gap-4">
                        <button
                          onClick={() => setState(prev => ({ ...prev, selectedItem: null }))}
                          className="border-foreground/20 hover:border-primary px-4 py-2 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveItem}
                          className="bg-primary hover:bg-primary/90 flex items-center gap-2 px-4 py-2 text-white transition-colors"
                        >
                          <Save size={20} />
                          Save
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'media' && (
                    <div className="space-y-6">
                      <div>
                        <label className="text-foreground mb-2 block text-sm font-medium">
                          Upload Images
                        </label>
                        <div className="border-foreground/20 border-2 border-dashed p-8 text-center">
                          <Upload size={48} className="text-foreground/30 mx-auto mb-4" />
                          <p className="text-foreground/70 mb-4">
                            Drop files here or click to browse
                          </p>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                          />
                          <label
                            htmlFor="file-upload"
                            className="bg-primary hover:bg-primary/90 cursor-pointer px-4 py-2 text-white transition-colors"
                          >
                            Select Files
                          </label>
                        </div>
                        {state.isUploading && (
                          <div className="mt-4">
                            <div className="bg-gray/30 h-2 overflow-hidden">
                              <div 
                                className="bg-primary h-full transition-all duration-300"
                                style={{ width: `${state.uploadProgress}%` }}
                              />
                            </div>
                            <p className="text-foreground/70 mt-2 text-sm">
                              Uploading... {Math.round(state.uploadProgress)}%
                            </p>
                          </div>
                        )}
                      </div>

                      {state.selectedItem.images && state.selectedItem.images.length > 0 && (
                        <div>
                          <h3 className="text-foreground mb-4 text-sm font-medium">Uploaded Images</h3>
                          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                            {state.selectedItem.images.map((image, index) => (
                              <div key={index} className="border-foreground/20 group relative border">
                                <img
                                  src={image}
                                  alt={`Upload ${index + 1}`}
                                  className="h-32 w-full object-cover"
                                />
                                <button
                                  onClick={() => {
                                    const updatedImages = state.selectedItem!.images!.filter((_, i) => i !== index);
                                    updateSelectedItem('images', updatedImages);
                                  }}
                                  className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'preview' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-foreground text-lg font-medium">Preview</h3>
                        <div className="flex gap-2">
                          {(['edit', 'live', 'mobile'] as const).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => setState(prev => ({ ...prev, previewMode: mode }))}
                              className={`px-3 py-1 text-sm transition-colors ${
                                state.previewMode === mode
                                  ? 'bg-primary text-white'
                                  : 'border-foreground/20 hover:border-primary border'
                              }`}
                            >
                              {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border-foreground/20 bg-white border p-6">
                        <h1 className="text-primary mb-4 text-2xl font-bold">
                          {state.selectedItem.title}
                        </h1>
                        <p className="text-foreground/70 mb-6">{state.selectedItem.description}</p>
                        
                        {state.selectedItem.images && state.selectedItem.images.length > 0 && (
                          <div className="mb-6">
                            <img
                              src={state.selectedItem.images[0]}
                              alt={state.selectedItem.title}
                              className="h-48 w-full object-cover"
                            />
                          </div>
                        )}

                        {state.selectedItem.content && (
                          <div className="prose prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap">{state.selectedItem.content}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'export' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-foreground mb-4 text-lg font-medium">Export Options</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <button
                            onClick={() => exportData('json')}
                            className="border-foreground/20 hover:border-primary flex items-center gap-2 border p-4 transition-colors"
                          >
                            <FileCode size={24} />
                            <div>
                              <div className="font-medium">JSON</div>
                              <div className="text-foreground/70 text-sm">Structured data</div>
                            </div>
                          </button>
                          <button
                            onClick={() => exportData('csv')}
                            className="border-foreground/20 hover:border-primary flex items-center gap-2 border p-4 transition-colors"
                          >
                            <Database size={24} />
                            <div>
                              <div className="font-medium">CSV</div>
                              <div className="text-foreground/70 text-sm">Spreadsheet format</div>
                            </div>
                          </button>
                          <button
                            onClick={() => exportData('markdown')}
                            className="border-foreground/20 hover:border-primary flex items-center gap-2 border p-4 transition-colors"
                          >
                            <FileText size={24} />
                            <div>
                              <div className="font-medium">Markdown</div>
                              <div className="text-foreground/70 text-sm">Text format</div>
                            </div>
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-foreground mb-4 text-lg font-medium">Backup & Restore</h3>
                        <div className="border-foreground/20 bg-yellow-500/10 border p-4">
                          <p className="text-foreground/70 mb-4">
                            Export all content data for backup purposes or to migrate to another system.
                          </p>
                          <button
                            onClick={() => exportData('json')}
                            className="bg-primary hover:bg-primary/90 flex items-center gap-2 px-4 py-2 text-white transition-colors"
                          >
                            <Download size={20} />
                            Download Full Backup
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="border-foreground/20 bg-gray/50 border p-12 text-center">
                <Settings size={64} className="text-foreground/30 mx-auto mb-6" />
                <h3 className="text-foreground mb-2 text-xl font-medium">No Item Selected</h3>
                <p className="text-foreground/70 mb-6">
                  Select an item from the list or create a new one to start editing.
                </p>
                <button
                  onClick={createNewItem}
                  className="bg-primary hover:bg-primary/90 flex items-center gap-2 px-6 py-3 text-white transition-colors"
                >
                  <Plus size={20} />
                  Create New Item
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Database, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Shield,
  Cpu,
  HardDrive,
  Activity
} from "lucide-react";

export default function AdminPage() {
  const [isDevMode, setIsDevMode] = useState(false);
  const [stats, setStats] = useState({
    totalContent: 0,
    totalViews: 0,
    totalDownloads: 0,
    totalSearches: 0,
  });

  useEffect(() => {
    // Check if running in development mode
    setIsDevMode(process.env.NODE_ENV === 'development');
    
    // Load basic stats (mock data for demonstration)
    setStats({
      totalContent: 25,
      totalViews: 12543,
      totalDownloads: 1834,
      totalSearches: 6721,
    });
  }, []);

  if (!isDevMode) {
    return (
      <div className="min-h-screen bg-gray flex items-center justify-center">
        <div className="text-center">
          <Shield size={64} className="text-primary mx-auto mb-6" />
          <h1 className="neue-haas-grotesk-display text-4xl text-primary mb-4">
            Access Denied
          </h1>
          <p className="noto-sans-jp text-foreground/70 mb-6">
            Admin access is only available in development mode.
          </p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray">
      {/* Navigation */}
      <nav className="border-b border-foreground/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            href="/" 
            className="neue-haas-grotesk-display text-2xl text-primary hover:text-primary/80"
          >
            ← Home
          </Link>
          <div className="text-sm text-foreground/60">
            Development Mode Only
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="text-center py-12 px-4">
        <h1 className="neue-haas-grotesk-display text-4xl md:text-6xl text-primary mb-4">
          Admin Dashboard
        </h1>
        <p className="noto-sans-jp text-lg text-foreground/80">
          Content Management & Analytics
        </p>
        <div className="mt-6 h-1 w-24 bg-primary mx-auto"></div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-16">
        {/* Quick Stats */}
        <section className="mb-12">
          <h2 className="neue-haas-grotesk-display text-2xl text-foreground mb-6">
            Overview
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 border border-foreground/20 bg-gray/50">
              <div className="flex items-center justify-between mb-2">
                <FileText size={24} className="text-primary" />
                <span className="text-xs text-foreground/50">CONTENT</span>
              </div>
              <div className="neue-haas-grotesk-display text-2xl text-foreground">
                {stats.totalContent}
              </div>
              <div className="text-sm text-foreground/70">Total Items</div>
            </div>
            
            <div className="p-6 border border-foreground/20 bg-gray/50">
              <div className="flex items-center justify-between mb-2">
                <Activity size={24} className="text-primary" />
                <span className="text-xs text-foreground/50">VIEWS</span>
              </div>
              <div className="neue-haas-grotesk-display text-2xl text-foreground">
                {stats.totalViews.toLocaleString()}
              </div>
              <div className="text-sm text-foreground/70">Page Views</div>
            </div>
            
            <div className="p-6 border border-foreground/20 bg-gray/50">
              <div className="flex items-center justify-between mb-2">
                <HardDrive size={24} className="text-primary" />
                <span className="text-xs text-foreground/50">DOWNLOADS</span>
              </div>
              <div className="neue-haas-grotesk-display text-2xl text-foreground">
                {stats.totalDownloads.toLocaleString()}
              </div>
              <div className="text-sm text-foreground/70">Total Downloads</div>
            </div>
            
            <div className="p-6 border border-foreground/20 bg-gray/50">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 size={24} className="text-primary" />
                <span className="text-xs text-foreground/50">SEARCHES</span>
              </div>
              <div className="neue-haas-grotesk-display text-2xl text-foreground">
                {stats.totalSearches.toLocaleString()}
              </div>
              <div className="text-sm text-foreground/70">Search Queries</div>
            </div>
          </div>
        </section>

        {/* Admin Tools */}
        <section className="mb-12">
          <h2 className="neue-haas-grotesk-display text-2xl text-foreground mb-6">
            Management Tools
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/admin/content"
              className="group p-6 border border-foreground/20 bg-gray/50 hover:border-primary transition-colors"
            >
              <Database size={32} className="text-primary mb-4" />
              <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-2 group-hover:text-primary">
                Content Manager
              </h3>
              <p className="noto-sans-jp text-sm text-foreground/70">
                Create, edit, and manage portfolio items, tools, and blog posts
              </p>
            </Link>
            
            <Link
              href="/admin/analytics"
              className="group p-6 border border-foreground/20 bg-gray/50 hover:border-primary transition-colors"
            >
              <BarChart3 size={32} className="text-primary mb-4" />
              <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-2 group-hover:text-primary">
                Analytics
              </h3>
              <p className="noto-sans-jp text-sm text-foreground/70">
                View detailed statistics and user behavior analytics
              </p>
            </Link>
            
            <Link
              href="/admin/users"
              className="group p-6 border border-foreground/20 bg-gray/50 hover:border-primary transition-colors"
            >
              <Users size={32} className="text-primary mb-4" />
              <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-2 group-hover:text-primary">
                User Management
              </h3>
              <p className="noto-sans-jp text-sm text-foreground/70">
                Manage user accounts and permissions (if applicable)
              </p>
            </Link>
            
            <Link
              href="/admin/settings"
              className="group p-6 border border-foreground/20 bg-gray/50 hover:border-primary transition-colors"
            >
              <Settings size={32} className="text-primary mb-4" />
              <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-2 group-hover:text-primary">
                Site Settings
              </h3>
              <p className="noto-sans-jp text-sm text-foreground/70">
                Configure site settings, SEO, and integrations
              </p>
            </Link>
            
            <Link
              href="/admin/performance"
              className="group p-6 border border-foreground/20 bg-gray/50 hover:border-primary transition-colors"
            >
              <Cpu size={32} className="text-primary mb-4" />
              <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-2 group-hover:text-primary">
                Performance Monitor
              </h3>
              <p className="noto-sans-jp text-sm text-foreground/70">
                Monitor site performance and optimization metrics
              </p>
            </Link>
            
            <Link
              href="/admin/security"
              className="group p-6 border border-foreground/20 bg-gray/50 hover:border-primary transition-colors"
            >
              <Shield size={32} className="text-primary mb-4" />
              <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-2 group-hover:text-primary">
                Security
              </h3>
              <p className="noto-sans-jp text-sm text-foreground/70">
                Security settings, audit logs, and access control
              </p>
            </Link>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="neue-haas-grotesk-display text-2xl text-foreground mb-6">
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-foreground/20 bg-gray/50">
              <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/70">New portfolio item added</span>
                  <span className="text-foreground/50">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/70">Tool usage analytics updated</span>
                  <span className="text-foreground/50">4 hours ago</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/70">Contact form submission</span>
                  <span className="text-foreground/50">6 hours ago</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 border border-foreground/20 bg-gray/50">
              <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-4">
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/70">Website Status</span>
                  <span className="text-green-500">Online</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/70">Database</span>
                  <span className="text-green-500">Connected</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/70">Search Index</span>
                  <span className="text-green-500">Updated</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-foreground/20 py-8 text-center">
        <p className="noto-sans-jp text-foreground/60 text-sm">
          Admin Dashboard - Development Mode Only
        </p>
      </footer>
    </div>
  );
}
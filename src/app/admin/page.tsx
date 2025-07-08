'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Database,
  FileText,
  Users,
  BarChart3,
  Settings,
  Shield,
  Cpu,
  HardDrive,
  Activity,
} from 'lucide-react';
import { GridLayout, GridContainer, GridContent } from '@/components/GridSystem';

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
      <GridLayout
        background={false}
        className="bg-gray flex min-h-screen items-center justify-center"
      >
        <GridContainer>
          <div className="text-center">
            <Shield size={64} className="text-primary mx-auto mb-6" />
            <h1 className="neue-haas-grotesk-display text-primary mb-4 text-4xl">Access Denied</h1>
            <p className="noto-sans-jp text-foreground/70 mb-6">
              Admin access is only available in development mode.
            </p>
            <Link
              href="/"
              className="bg-primary hover:bg-primary/90 inline-block px-6 py-3 text-white transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </GridContainer>
      </GridLayout>
    );
  }

  return (
    <GridLayout background={false} className="bg-gray">
      {/* Navigation */}
      <nav className="border-foreground/20 border-b p-4">
        <GridContainer>
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="neue-haas-grotesk-display text-primary hover:text-primary/80 text-2xl"
            >
              ← Home
            </Link>
            <div className="text-foreground/60 text-sm">Development Mode Only</div>
          </div>
        </GridContainer>
      </nav>

      {/* Header */}
      <header className="px-4 py-12 text-center">
        <h1 className="neue-haas-grotesk-display text-primary mb-4 text-4xl md:text-6xl">
          Admin Dashboard
        </h1>
        <p className="noto-sans-jp text-foreground/80 text-lg">Content Management & Analytics</p>
        <div className="bg-primary mx-auto mt-6 h-1 w-24"></div>
      </header>

      {/* Main Content */}
      <main className="pb-16">
        <GridContainer>
          {/* Quick Stats */}
          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">Overview</h2>

            <GridContent cols={{ xs: 2, md: 4, xl: 4, '2xl': 4 }}>
              <div className="border-foreground/20 bg-gray/50 border p-6">
                <div className="mb-2 flex items-center justify-between">
                  <FileText size={24} className="text-primary" />
                  <span className="text-foreground/50 text-xs">CONTENT</span>
                </div>
                <div className="neue-haas-grotesk-display text-foreground text-2xl">
                  {stats.totalContent}
                </div>
                <div className="text-foreground/70 text-sm">Total Items</div>
              </div>

              <div className="border-foreground/20 bg-gray/50 border p-6">
                <div className="mb-2 flex items-center justify-between">
                  <Activity size={24} className="text-primary" />
                  <span className="text-foreground/50 text-xs">VIEWS</span>
                </div>
                <div className="neue-haas-grotesk-display text-foreground text-2xl">
                  {stats.totalViews.toLocaleString()}
                </div>
                <div className="text-foreground/70 text-sm">Page Views</div>
              </div>

              <div className="border-foreground/20 bg-gray/50 border p-6">
                <div className="mb-2 flex items-center justify-between">
                  <HardDrive size={24} className="text-primary" />
                  <span className="text-foreground/50 text-xs">DOWNLOADS</span>
                </div>
                <div className="neue-haas-grotesk-display text-foreground text-2xl">
                  {stats.totalDownloads.toLocaleString()}
                </div>
                <div className="text-foreground/70 text-sm">Total Downloads</div>
              </div>

              <div className="border-foreground/20 bg-gray/50 border p-6">
                <div className="mb-2 flex items-center justify-between">
                  <BarChart3 size={24} className="text-primary" />
                  <span className="text-foreground/50 text-xs">SEARCHES</span>
                </div>
                <div className="neue-haas-grotesk-display text-foreground text-2xl">
                  {stats.totalSearches.toLocaleString()}
                </div>
                <div className="text-foreground/70 text-sm">Search Queries</div>
              </div>
            </GridContent>
          </section>

          {/* Admin Tools */}
          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
              Management Tools
            </h2>

            <GridContent cols={{ xs: 1, md: 2, xl: 3, '2xl': 3 }}>
              <Link
                href="/admin/content"
                className="group border-foreground/20 bg-gray/50 hover:border-primary border p-6 transition-colors"
              >
                <Database size={32} className="text-primary mb-4" />
                <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary mb-2 text-lg">
                  Content Manager
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  Create, edit, and manage portfolio items, tools, and blog posts
                </p>
              </Link>

              <Link
                href="/admin/analytics"
                className="group border-foreground/20 bg-gray/50 hover:border-primary border p-6 transition-colors"
              >
                <BarChart3 size={32} className="text-primary mb-4" />
                <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary mb-2 text-lg">
                  Analytics
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  View detailed statistics and user behavior analytics
                </p>
              </Link>

              <Link
                href="/admin/users"
                className="group border-foreground/20 bg-gray/50 hover:border-primary border p-6 transition-colors"
              >
                <Users size={32} className="text-primary mb-4" />
                <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary mb-2 text-lg">
                  User Management
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  Manage user accounts and permissions (if applicable)
                </p>
              </Link>

              <Link
                href="/admin/settings"
                className="group border-foreground/20 bg-gray/50 hover:border-primary border p-6 transition-colors"
              >
                <Settings size={32} className="text-primary mb-4" />
                <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary mb-2 text-lg">
                  Site Settings
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  Configure site settings, SEO, and integrations
                </p>
              </Link>

              <Link
                href="/admin/performance"
                className="group border-foreground/20 bg-gray/50 hover:border-primary border p-6 transition-colors"
              >
                <Cpu size={32} className="text-primary mb-4" />
                <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary mb-2 text-lg">
                  Performance Monitor
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  Monitor site performance and optimization metrics
                </p>
              </Link>

              <Link
                href="/admin/security"
                className="group border-foreground/20 bg-gray/50 hover:border-primary border p-6 transition-colors"
              >
                <Shield size={32} className="text-primary mb-4" />
                <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary mb-2 text-lg">
                  Security
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  Security settings, audit logs, and access control
                </p>
              </Link>
            </GridContent>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
              Quick Actions
            </h2>

            <GridContent cols={{ xs: 1, md: 2, xl: 2, '2xl': 2 }}>
              <div className="border-foreground/20 bg-gray/50 border p-6">
                <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">
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

              <div className="border-foreground/20 bg-gray/50 border p-6">
                <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">
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
            </GridContent>
          </section>
        </GridContainer>
      </main>

      {/* Footer */}
      <footer className="border-foreground/20 border-t py-8 text-center">
        <GridContainer>
          <p className="noto-sans-jp text-foreground/60 text-sm">
            Admin Dashboard - Development Mode Only
          </p>
        </GridContainer>
      </footer>
    </GridLayout>
  );
}

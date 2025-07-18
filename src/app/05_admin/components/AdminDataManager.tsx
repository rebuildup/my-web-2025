import React, { useState, useEffect } from 'react';

type DataItemType = 'user' | 'content' | 'analytics' | 'unknown';
type DataItemStatus = 'active' | 'inactive' | 'pending' | 'unknown';

interface DataItem {
  id: string;
  type: DataItemType;
  title: string;
  status: DataItemStatus;
  lastModified: string;
  size: string;
}

interface SystemStats {
  totalUsers: number;
  totalContent: number;
  totalViews: number;
  storageUsed: number;
}

const AdminDataManager: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'data' | 'settings'>('overview');
  const [dataItems, setDataItems] = useState<DataItem[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    totalContent: 0,
    totalViews: 0,
    storageUsed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadData = () => {
      setIsLoading(true);

      setSystemStats({
        totalUsers: 1247,
        totalContent: 89,
        totalViews: 15420,
        storageUsed: 2.3,
      });

      setDataItems([
        {
          id: '1',
          type: 'user',
          title: 'User Database',
          status: 'active',
          lastModified: '2024-01-15T10:30:00Z',
          size: '1.2 MB',
        },
        {
          id: '2',
          type: 'content',
          title: 'Blog Posts',
          status: 'inactive',
          lastModified: '2024-01-14T16:45:00Z',
          size: '850 KB',
        },
        {
          id: '3',
          type: 'analytics',
          title: 'Analytics Data',
          status: 'pending',
          lastModified: '2024-01-13T09:15:00Z',
          size: '3.4 MB',
        },
        {
          id: '4',
          type: 'unknown',
          title: 'Unknown Type Data',
          status: 'unknown',
          lastModified: '2024-01-12T09:15:00Z',
          size: '1.0 MB',
        },
      ]);

      setIsLoading(false);
    };

    loadData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-900';
      case 'inactive':
        return 'text-red-400 bg-red-900';
      case 'pending':
        return 'text-yellow-400 bg-yellow-900';
      default:
        return 'text-gray-400 bg-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return '👥';
      case 'content':
        return '📄';
      case 'analytics':
        return '📊';
      default:
        return '📁';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'data', label: 'Data Management' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="rounded-none bg-gray-800 p-6 text-white">
      <h2 className="neue-haas-grotesk-display mb-4 text-xl font-bold text-blue-500">
        Admin Data Manager
      </h2>

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as 'overview' | 'data' | 'settings')}
            className={`rounded-none px-4 py-2 text-sm font-medium transition-colors ${
              selectedTab === tab.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-none bg-gray-700 p-8 text-center">
          <div className="animate-pulse">
            <div className="mx-auto mb-4 h-16 w-16 rounded-none bg-gray-600"></div>
            <p className="text-gray-400">Loading admin data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-none bg-gray-700 p-4">
                  <div className="text-2xl font-bold text-blue-400">{systemStats.totalUsers}</div>
                  <div className="text-sm text-gray-300">Total Users</div>
                </div>
                <div className="rounded-none bg-gray-700 p-4">
                  <div className="text-2xl font-bold text-green-400">
                    {systemStats.totalContent}
                  </div>
                  <div className="text-sm text-gray-300">Content Items</div>
                </div>
                <div className="rounded-none bg-gray-700 p-4">
                  <div className="text-2xl font-bold text-yellow-400">
                    {systemStats.totalViews.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-300">Total Views</div>
                </div>
                <div className="rounded-none bg-gray-700 p-4">
                  <div className="text-2xl font-bold text-purple-400">
                    {systemStats.storageUsed} GB
                  </div>
                  <div className="text-sm text-gray-300">Storage Used</div>
                </div>
              </div>

              <div className="rounded-none bg-gray-700 p-6">
                <h3 className="mb-4 text-lg font-semibold text-blue-400">System Health</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Database Connection</span>
                    <span className="text-green-400">✓ Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">API Response Time</span>
                    <span className="text-green-400">124ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Memory Usage</span>
                    <span className="text-yellow-400">68%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Management Tab */}
          {selectedTab === 'data' && (
            <div className="space-y-4">
              {dataItems.map(item => (
                <div key={item.id} className="rounded-none bg-gray-700 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getTypeIcon(item.type)}</span>
                      <div>
                        <h4 className="font-semibold text-blue-400">{item.title}</h4>
                        <p className="text-sm text-gray-400">
                          Last modified: {formatDate(item.lastModified)} • {item.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-none px-2 py-1 text-xs ${getStatusColor(item.status)}`}
                      >
                        {item.status}
                      </span>
                      <div className="flex gap-2">
                        <button className="rounded-none bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600">
                          Edit
                        </button>
                        <button className="rounded-none bg-red-500 px-3 py-1 text-sm text-white transition-colors hover:bg-red-600">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Settings Tab */}
          {selectedTab === 'settings' && (
            <div className="rounded-none bg-gray-700 p-6">
              <h3 className="mb-4 text-lg font-semibold text-blue-400">System Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Automatic Backups</span>
                  <button className="rounded-none bg-green-500 px-4 py-2 text-sm text-white transition-colors hover:bg-green-600">
                    Enabled
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Maintenance Mode</span>
                  <button className="rounded-none bg-gray-600 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700">
                    Disabled
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Debug Logging</span>
                  <button className="rounded-none bg-yellow-500 px-4 py-2 text-sm text-white transition-colors hover:bg-yellow-600">
                    Enabled
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDataManager;

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Copy, Download, Briefcase, Check, Upload, Filter, X } from 'lucide-react';

// Business domain detection
interface EmailAnalysisResult {
  email: string;
  domain: string;
  isBusinessDomain: boolean;
  confidence: number;
  category?: string;
}

interface BatchResult {
  totalEmails: number;
  businessEmails: number;
  personalEmails: number;
  results: EmailAnalysisResult[];
}

// Common business domain TLDs and keywords
const BUSINESS_TLDS = [
  'com',
  'co',
  'io',
  'biz',
  'org',
  'net',
  'corp',
  'inc',
  'ltd',
  'llc',
  'enterprise',
  'industries',
  'international',
  'group',
  'agency',
  'studio',
  'consulting',
  'solutions',
  'systems',
  'tech',
  'technology',
  'digital',
  'media',
  'marketing',
  'design',
  'creative',
  'global',
  'worldwide',
];

// Common personal domain providers
const PERSONAL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'aol.com',
  'protonmail.com',
  'mail.com',
  'zoho.com',
  'yandex.com',
  'gmx.com',
  'live.com',
  'me.com',
  'inbox.com',
  'fastmail.com',
  'tutanota.com',
  'mail.ru',
  'yahoo.co.jp',
  'naver.com',
  'qq.com',
  'msn.com',
  'mac.com',
  'comcast.net',
  'verizon.net',
  'att.net',
];

// Common business domain keywords
const BUSINESS_KEYWORDS = [
  'corp',
  'inc',
  'ltd',
  'llc',
  'company',
  'enterprise',
  'industries',
  'international',
  'group',
  'agency',
  'studio',
  'consulting',
  'solutions',
  'systems',
  'tech',
  'technology',
  'digital',
  'media',
  'marketing',
  'design',
  'creative',
  'global',
  'worldwide',
  'partners',
  'associates',
  'services',
  'software',
  'apps',
  'app',
  'dev',
  'development',
  'web',
  'cloud',
  'data',
  'ai',
  'ml',
  'analytics',
  'research',
  'labs',
  'lab',
  'office',
  'official',
  'team',
  'staff',
  'support',
  'info',
  'contact',
  'sales',
  'business',
  'corporate',
  'finance',
  'financial',
  'bank',
  'insurance',
  'invest',
  'capital',
  'asset',
  'management',
  'consult',
  'advisor',
  'legal',
  'law',
  'firm',
  'attorney',
  'health',
  'medical',
  'hospital',
  'clinic',
  'pharma',
  'education',
  'university',
  'college',
  'school',
  'academy',
  'institute',
  'foundation',
  'association',
  'society',
  'council',
  'federation',
  'alliance',
  'network',
  'community',
  'press',
  'news',
  'journal',
  'magazine',
  'publication',
  'broadcast',
  'media',
  'entertainment',
  'production',
  'studio',
  'films',
  'pictures',
  'records',
  'music',
  'games',
  'gaming',
  'travel',
  'tourism',
  'hotel',
  'resort',
  'vacation',
  'airlines',
  'flights',
  'automotive',
  'motors',
  'cars',
  'vehicles',
  'auto',
  'retail',
  'store',
  'shop',
  'market',
  'mall',
  'outlet',
  'fashion',
  'apparel',
  'clothing',
  'food',
  'restaurant',
  'cafe',
  'catering',
  'logistics',
  'shipping',
  'delivery',
  'transport',
  'freight',
  'construction',
  'builders',
  'realty',
  'estate',
  'properties',
  'energy',
  'power',
  'electric',
  'utility',
  'telecom',
  'communications',
  'network',
  'security',
  'protection',
  'defense',
  'gov',
  'government',
  'admin',
  'administration',
  'official',
  'ministry',
  'department',
  'agency',
  'bureau',
  'commission',
  'authority',
  'council',
  'committee',
  'board',
  'panel',
  'task-force',
  'initiative',
  'project',
  'program',
  'service',
];

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Function to analyze an email
const analyzeEmail = (email: string): EmailAnalysisResult => {
  // Validate email format
  if (!EMAIL_REGEX.test(email)) {
    return {
      email,
      domain: 'invalid',
      isBusinessDomain: false,
      confidence: 0,
      category: 'Invalid Email',
    };
  }

  // Extract domain
  const domain = email.split('@')[1].toLowerCase();

  // Check if it's a known personal domain
  if (PERSONAL_DOMAINS.includes(domain)) {
    return {
      email,
      domain,
      isBusinessDomain: false,
      confidence: 0.95,
      category: 'Personal Email',
    };
  }

  // Calculate business domain confidence
  let confidence = 0;
  let category = 'Unknown';

  // Check TLD
  const tld = domain.split('.').pop() || '';
  if (BUSINESS_TLDS.includes(tld)) {
    confidence += 0.3;
    category = 'Business TLD';
  }

  // Check for business keywords in domain
  const domainWithoutTld = domain.split('.').slice(0, -1).join('.');
  const domainParts = domainWithoutTld.split(/[.-]/);

  for (const part of domainParts) {
    if (BUSINESS_KEYWORDS.includes(part.toLowerCase())) {
      confidence += 0.4;
      category = 'Business Keyword';
      break;
    }
  }

  // Check for common patterns in business emails
  const localPart = email.split('@')[0].toLowerCase();
  if (/^(info|contact|support|sales|admin|office|hr|marketing|hello|team)$/.test(localPart)) {
    confidence += 0.3;
    category = 'Business Function Email';
  }

  // Determine if it's a business domain based on confidence threshold
  const isBusinessDomain = confidence > 0.3;

  return {
    email,
    domain,
    isBusinessDomain,
    confidence: Math.min(confidence, 1),
    category: isBusinessDomain ? category : 'Likely Personal',
  };
};

const BusinessMailBlocker: React.FC = () => {
  const [emails, setEmails] = useState<string>('');
  const [results, setResults] = useState<BatchResult | null>(null);
  const [showBusinessOnly, setShowBusinessOnly] = useState<boolean>(false);
  const [showPersonalOnly, setShowPersonalOnly] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Process emails
  const processEmails = useCallback(() => {
    if (!emails.trim()) {
      setCopySuccess('Please enter at least one email address');
      setTimeout(() => setCopySuccess(null), 2000);
      return;
    }

    setIsProcessing(true);

    // Split input by common separators
    const emailList = emails
      .split(/[\n,;\s]+/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    // Process each email
    const analysisResults = emailList.map(analyzeEmail);

    // Calculate statistics
    const businessEmails = analysisResults.filter(result => result.isBusinessDomain).length;
    const personalEmails = analysisResults.filter(result => !result.isBusinessDomain).length;

    setResults({
      totalEmails: emailList.length,
      businessEmails,
      personalEmails,
      results: analysisResults,
    });

    setIsProcessing(false);
  }, [emails]);

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      setEmails(content);
    };
    reader.readAsText(file);
  }, []);

  // Filter results based on user selection
  const filteredResults = useMemo(() => {
    if (!results) return [];

    if (showBusinessOnly) {
      return results.results.filter(result => result.isBusinessDomain);
    }

    if (showPersonalOnly) {
      return results.results.filter(result => !result.isBusinessDomain);
    }

    return results.results;
  }, [results, showBusinessOnly, showPersonalOnly]);

  // Copy filtered results to clipboard
  const copyToClipboard = useCallback(async (content: string, label: string = 'Emails') => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(`${label} copied!`);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setCopySuccess('Copy failed');
      setTimeout(() => setCopySuccess(null), 2000);
    }
  }, []);

  // Copy filtered emails
  const copyFilteredEmails = useCallback(() => {
    if (!filteredResults.length) {
      setCopySuccess('No emails to copy');
      setTimeout(() => setCopySuccess(null), 2000);
      return;
    }

    const emailsText = filteredResults.map(result => result.email).join('\n');
    copyToClipboard(emailsText, 'Filtered emails');
  }, [filteredResults, copyToClipboard]);

  // Export results
  const exportResults = useCallback(
    (format: 'csv' | 'json') => {
      if (!results) {
        setCopySuccess('No results to export');
        setTimeout(() => setCopySuccess(null), 2000);
        return;
      }

      let content = '';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      switch (format) {
        case 'csv':
          content = 'Email,Domain,Is Business,Confidence,Category\n';
          content += filteredResults
            .map(
              result =>
                `"${result.email}","${result.domain}",${result.isBusinessDomain},${result.confidence.toFixed(2)},"${result.category || ''}"`
            )
            .join('\n');
          break;
        case 'json':
          content = JSON.stringify(
            {
              summary: {
                totalEmails: results.totalEmails,
                businessEmails: results.businessEmails,
                personalEmails: results.personalEmails,
                timestamp: new Date().toISOString(),
              },
              emails: filteredResults,
            },
            null,
            2
          );
          break;
      }

      const blob = new Blob([content], {
        type: format === 'json' ? 'application/json' : 'text/csv',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `email-analysis-${timestamp}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      setCopySuccess(`Results exported as ${format.toUpperCase()}`);
      setTimeout(() => setCopySuccess(null), 2000);
    },
    [results, filteredResults]
  );

  // Clear all data
  const clearAll = useCallback(() => {
    setEmails('');
    setResults(null);
    setShowBusinessOnly(false);
    setShowPersonalOnly(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Email Input */}
      <div className="border-foreground/20 border p-6">
        <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
          <Briefcase className="mr-2 inline" size={24} />
          Business Mail Blocker
        </h2>
        <div className="space-y-4">
          <div>
            <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
              Enter email addresses (one per line or comma-separated)
            </label>
            <textarea
              value={emails}
              onChange={e => setEmails(e.target.value)}
              placeholder="example@company.com&#10;personal@gmail.com&#10;info@business.org"
              className="border-foreground/20 bg-gray text-foreground noto-sans-jp h-40 w-full border px-4 py-3 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={processEmails}
              disabled={isProcessing || !emails.trim()}
              className="bg-primary hover:bg-primary/80 flex items-center space-x-2 px-4 py-2 text-white transition-colors disabled:opacity-50"
            >
              <Filter size={16} />
              <span>Analyze Emails</span>
            </button>
            <label className="border-foreground/20 text-foreground/70 hover:border-primary/50 flex cursor-pointer items-center space-x-1 border px-4 py-2 text-sm transition-colors">
              <Upload size={14} />
              <span>Upload File</span>
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={clearAll}
              className="border-foreground/20 text-foreground/70 hover:border-primary/50 flex items-center space-x-1 border px-4 py-2 text-sm transition-colors"
            >
              <X size={14} />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="border-foreground/20 border p-6">
          <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-xl">
            Analysis Results
          </h3>

          {/* Summary */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="border-foreground/20 bg-gray/50 border p-3 text-center">
              <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                {results.totalEmails}
              </div>
              <div className="noto-sans-jp text-foreground/70 text-xs">Total Emails</div>
            </div>
            <div className="border-foreground/20 bg-gray/50 border p-3 text-center">
              <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                {results.businessEmails}
              </div>
              <div className="noto-sans-jp text-foreground/70 text-xs">Business Emails</div>
            </div>
            <div className="border-foreground/20 bg-gray/50 border p-3 text-center">
              <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                {results.personalEmails}
              </div>
              <div className="noto-sans-jp text-foreground/70 text-xs">Personal Emails</div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setShowBusinessOnly(true);
                setShowPersonalOnly(false);
              }}
              className={`px-3 py-1 text-sm ${
                showBusinessOnly
                  ? 'bg-primary text-white'
                  : 'border-foreground/20 text-foreground/70 border'
              }`}
            >
              Business Only
            </button>
            <button
              onClick={() => {
                setShowBusinessOnly(false);
                setShowPersonalOnly(true);
              }}
              className={`px-3 py-1 text-sm ${
                showPersonalOnly
                  ? 'bg-primary text-white'
                  : 'border-foreground/20 text-foreground/70 border'
              }`}
            >
              Personal Only
            </button>
            <button
              onClick={() => {
                setShowBusinessOnly(false);
                setShowPersonalOnly(false);
              }}
              className={`px-3 py-1 text-sm ${
                !showBusinessOnly && !showPersonalOnly
                  ? 'bg-primary text-white'
                  : 'border-foreground/20 text-foreground/70 border'
              }`}
            >
              Show All
            </button>
          </div>

          {/* Results Table */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-foreground/20 border-b">
                  <th className="text-foreground p-2 text-left text-sm">Email</th>
                  <th className="text-foreground p-2 text-left text-sm">Domain</th>
                  <th className="text-foreground p-2 text-left text-sm">Type</th>
                  <th className="text-foreground p-2 text-left text-sm">Confidence</th>
                  <th className="text-foreground p-2 text-left text-sm">Category</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result, index) => (
                  <tr
                    key={index}
                    className={`border-foreground/10 border-b ${
                      result.isBusinessDomain ? 'bg-blue-50/10' : ''
                    }`}
                  >
                    <td className="p-2 text-sm">{result.email}</td>
                    <td className="p-2 text-sm">{result.domain}</td>
                    <td className="p-2 text-sm">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs ${
                          result.isBusinessDomain
                            ? 'bg-blue-100/20 text-blue-700'
                            : 'bg-green-100/20 text-green-700'
                        }`}
                      >
                        {result.isBusinessDomain ? 'Business' : 'Personal'}
                      </span>
                    </td>
                    <td className="p-2 text-sm">
                      <div className="flex items-center">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className={`h-full ${
                              result.isBusinessDomain ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${result.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs">
                          {(result.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-2 text-sm">{result.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Export Options */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyFilteredEmails}
              className="border-primary text-primary hover:bg-primary/10 flex items-center space-x-2 border px-4 py-2 transition-colors"
            >
              <Copy size={16} />
              <span>Copy Emails</span>
            </button>
            <button
              onClick={() => exportResults('csv')}
              className="bg-primary hover:bg-primary/80 flex items-center space-x-2 px-4 py-2 text-white transition-colors"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => exportResults('json')}
              className="border-primary text-primary hover:bg-primary/10 flex items-center space-x-2 border px-4 py-2 transition-colors"
            >
              <Download size={16} />
              <span>Export JSON</span>
            </button>
          </div>

          {/* Copy notification */}
          {copySuccess && (
            <div className="bg-primary/10 text-primary mt-4 flex items-center gap-2 rounded-md p-2 text-sm">
              <Check size={16} />
              <span>{copySuccess}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessMailBlocker;

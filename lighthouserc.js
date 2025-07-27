module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:3000",
        "http://localhost:3000/about",
        "http://localhost:3000/portfolio",
        "http://localhost:3000/workshop",
        "http://localhost:3000/tools",
        "http://localhost:3000/contact",
        "http://localhost:3000/tools/color-palette",
        "http://localhost:3000/tools/qr-generator",
        "http://localhost:3000/tools/text-counter",
      ],
      startServerCommand: "npm run build && npm run start",
      startServerReadyPattern: "ready on",
      startServerReadyTimeout: 60000,
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        // 100% score requirements for all categories
        "categories:performance": ["error", { minScore: 1.0 }],
        "categories:accessibility": ["error", { minScore: 1.0 }],
        "categories:best-practices": ["error", { minScore: 1.0 }],
        "categories:seo": ["error", { minScore: 1.0 }],

        // Core Web Vitals requirements
        "first-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "first-input-delay": ["error", { maxNumericValue: 100 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],

        // Performance budget
        "total-byte-weight": ["warn", { maxNumericValue: 1000000 }], // 1MB
        "dom-size": ["warn", { maxNumericValue: 1500 }],
        interactive: ["error", { maxNumericValue: 3000 }],

        // Accessibility requirements
        "color-contrast": ["error", { minScore: 1.0 }],
        "heading-order": ["error", { minScore: 1.0 }],
        "aria-allowed-attr": ["error", { minScore: 1.0 }],
        "aria-required-attr": ["error", { minScore: 1.0 }],
        "button-name": ["error", { minScore: 1.0 }],
        "image-alt": ["error", { minScore: 1.0 }],
        label: ["error", { minScore: 1.0 }],
        "link-name": ["error", { minScore: 1.0 }],

        // SEO requirements
        "document-title": ["error", { minScore: 1.0 }],
        "meta-description": ["error", { minScore: 1.0 }],
        "http-status-code": ["error", { minScore: 1.0 }],
        "crawlable-anchors": ["error", { minScore: 1.0 }],
        "robots-txt": ["error", { minScore: 1.0 }],

        // Best practices
        "is-on-https": ["error", { minScore: 1.0 }],
        "uses-https": ["error", { minScore: 1.0 }],
        "no-vulnerable-libraries": ["error", { minScore: 1.0 }],
        "csp-xss": ["warn", { minScore: 0.8 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};

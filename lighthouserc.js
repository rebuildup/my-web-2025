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
        // Realistic score requirements for a complex web app
        "categories:performance": ["warn", { minScore: 0.7 }], // 70% for Three.js apps
        "categories:accessibility": ["error", { minScore: 0.95 }], // 95% accessibility
        "categories:best-practices": ["warn", { minScore: 0.8 }], // 80% best practices
        "categories:seo": ["error", { minScore: 0.9 }], // 90% SEO

        // Core Web Vitals requirements (relaxed for Three.js apps)
        "first-contentful-paint": ["warn", { maxNumericValue: 3500 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 4000 }],
        "first-input-delay": ["warn", { maxNumericValue: 200 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.15 }],

        // Performance budget (realistic for complex apps)
        "total-byte-weight": ["warn", { maxNumericValue: 5000000 }], // 5MB
        "dom-size": ["warn", { maxNumericValue: 2000 }],
        interactive: ["warn", { maxNumericValue: 5000 }],

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

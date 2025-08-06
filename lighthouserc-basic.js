module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:3000",
        "http://localhost:3000/about",
        "http://localhost:3000/portfolio",
        "http://localhost:3000/tools",
        "http://localhost:3000/contact",
      ],
      startServerCommand: "npm run build && npm run start",
      startServerReadyPattern: "ready on",
      startServerReadyTimeout: 60000,
      numberOfRuns: 1, // Reduced for faster execution
    },
    assert: {
      assertions: {
        // Basic performance requirements
        "categories:performance": ["warn", { minScore: 0.6 }], // 60% for basic pages
        "categories:accessibility": ["error", { minScore: 0.9 }], // 90% accessibility
        "categories:best-practices": ["warn", { minScore: 0.7 }], // 70% best practices
        "categories:seo": ["error", { minScore: 0.8 }], // 80% SEO

        // Basic Web Vitals
        "first-contentful-paint": ["warn", { maxNumericValue: 4000 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 5000 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.2 }],

        // Basic requirements
        "total-byte-weight": ["warn", { maxNumericValue: 3000000 }], // 3MB
        interactive: ["warn", { maxNumericValue: 6000 }],

        // Essential accessibility
        "color-contrast": ["error", { minScore: 1.0 }],
        "image-alt": ["error", { minScore: 1.0 }],
        label: ["error", { minScore: 1.0 }],

        // Essential SEO
        "document-title": ["error", { minScore: 1.0 }],
        "meta-description": ["error", { minScore: 1.0 }],
        "http-status-code": ["error", { minScore: 1.0 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};

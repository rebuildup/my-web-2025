# Performance and Accessibility Integration Tests

## Overview

This directory contains comprehensive integration tests for performance and accessibility compliance, implementing Task 11.2 requirements:

- **Core Web Vitals measurement and validation**
- **WCAG 2.1 AA compliance automated testing**
- **Keyboard navigation and screen reader support testing**

## Test Files

### Main Test Suites

1. **`performance-accessibility-integration.test.ts`**
   - Core Web Vitals integration tests (LCP, FID, CLS, FCP, TTFB)
   - WCAG 2.1 AA compliance validation
   - Keyboard navigation flow testing
   - Screen reader support validation

2. **`comprehensive-performance-accessibility-tests.test.ts`**
   - Complete performance and accessibility test suite
   - Cross-page consistency validation
   - Real-world user scenario testing
   - Performance degradation handling

### Utility Modules

3. **`utils/core-web-vitals-tester.ts`**
   - Core Web Vitals measurement utilities
   - Performance monitoring tools
   - Memory usage tracking
   - Threshold validation

4. **`utils/wcag-compliance-tester.ts`**
   - WCAG 2.1 AA automated testing
   - Color contrast validation
   - Form accessibility testing
   - ARIA implementation validation

5. **`utils/keyboard-navigation-tester.ts`**
   - Keyboard navigation testing
   - Focus management validation
   - Skip link testing
   - Focus trap validation

## Core Web Vitals Testing

### Metrics Measured

- **Largest Contentful Paint (LCP)**: < 2.5s (good), < 4.0s (needs improvement)
- **First Input Delay (FID)**: < 100ms (good), < 300ms (needs improvement)
- **Cumulative Layout Shift (CLS)**: < 0.1 (good), < 0.25 (needs improvement)
- **First Contentful Paint (FCP)**: < 1.8s (good), < 3.0s (needs improvement)
- **Time to First Byte (TTFB)**: < 600ms (good), < 1.5s (needs improvement)

### Usage Example

```typescript
import { CoreWebVitalsTester } from "./utils/core-web-vitals-tester";

const tester = new CoreWebVitalsTester();
const report = await tester.measureAll();
const validation = tester.validateMetrics(report);

expect(validation.passed).toBe(true);
expect(report.overall).not.toBe("poor");
```

## WCAG 2.1 AA Compliance Testing

### Categories Tested

1. **Perceivable**
   - Color contrast ratios
   - Image alt text
   - Audio/video captions

2. **Operable**
   - Keyboard navigation
   - Focus management
   - Skip links

3. **Understandable**
   - Language attributes
   - Form labels
   - Error identification

4. **Robust**
   - Valid HTML
   - ARIA implementation
   - Semantic markup

### Usage Example

```typescript
import { WCAGComplianceTester } from "./utils/wcag-compliance-tester";

const tester = new WCAGComplianceTester();
const report = await tester.testCompliance(container);

expect(report.passed).toBe(true);
expect(report.score).toBeGreaterThanOrEqual(90);
expect(report.violations.length).toBe(0);
```

## Keyboard Navigation Testing

### Features Tested

- **Tab Order**: Logical focus sequence
- **Skip Links**: Functional skip navigation
- **Focus Traps**: Modal/dialog focus management
- **Keyboard Shortcuts**: Standard key combinations
- **Focus Indicators**: Visible focus states

### Usage Example

```typescript
import { KeyboardNavigationTester } from "./utils/keyboard-navigation-tester";

const tester = new KeyboardNavigationTester(container);
const report = await tester.testKeyboardNavigation();

expect(report.passed).toBe(true);
expect(report.focusableElements).toBeGreaterThan(0);
expect(report.issues.filter((i) => i.severity === "error").length).toBe(0);
```

## Running the Tests

### Individual Test Suites

```bash
# Core performance and accessibility integration
npm test -- tests/integration/performance-accessibility-integration.test.ts --run

# Comprehensive test suite
npm test -- tests/integration/comprehensive-performance-accessibility-tests.test.ts --run
```

### All Integration Tests

```bash
# Run all integration tests
npm test -- --testPathPattern="tests/integration" --run

# Run with coverage
npm test -- --testPathPattern="tests/integration" --coverage --run
```

### Test Analysis

```bash
# Analyze test structure
node tests/integration/test-runner.js
```

## Test Configuration

### Jest Setup

The tests require specific Jest configuration for performance and accessibility testing:

```javascript
// jest.config.js
module.exports = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  testTimeout: 30000, // Longer timeout for performance tests
  // ... other config
};
```

### Required Dependencies

```json
{
  "devDependencies": {
    "@axe-core/playwright": "^4.10.2",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "jest-axe": "^10.0.0",
    "web-vitals": "^5.1.0"
  }
}
```

## Performance Thresholds

### Render Performance

- **Component Render Time**: < 100ms
- **Page Load Time**: < 3000ms
- **Interaction Response**: < 100ms
- **Memory Usage**: < 50MB per page

### Accessibility Scores

- **Overall WCAG Score**: ≥ 90/100
- **Category Scores**: ≥ 85/100 each
- **Critical Violations**: 0
- **Serious Violations**: ≤ 2

## Test Reports

### Performance Report Example

```
=== Core Web Vitals Report ===

Overall Rating: GOOD

Individual Metrics:
  LCP: 1234.5ms (good)
  FID: 45.2ms (good)
  CLS: 0.045 (good)
  FCP: 987.3ms (good)
  TTFB: 234.1ms (good)
```

### Accessibility Report Example

```
=== WCAG 2.1 AA Compliance Report ===

Overall Status: PASSED
Compliance Score: 95/100

Category Scores:
  Perceivable: 98/100 (0 violations)
  Operable: 94/100 (1 violations)
  Understandable: 96/100 (0 violations)
  Robust: 92/100 (2 violations)
```

### Keyboard Navigation Report Example

```
=== Keyboard Navigation Report ===

Status: PASSED
Focusable Elements: 15
Tab Order Elements: 15
Skip Links: 2
Focus Traps: 1
Issues: 0
```

## Troubleshooting

### Common Issues

1. **Test Timeouts**
   - Increase `testTimeout` in Jest config
   - Use `waitFor` for async operations
   - Mock heavy dependencies

2. **Memory Issues**
   - Clear mocks between tests
   - Use `act()` for React updates
   - Monitor memory usage with `MemoryMonitor`

3. **Accessibility Violations**
   - Check axe-core documentation
   - Validate HTML semantics
   - Ensure proper ARIA usage

4. **Performance Failures**
   - Profile component render times
   - Optimize heavy computations
   - Use React.memo for expensive components

### Debug Mode

Enable detailed logging by setting environment variables:

```bash
DEBUG=true npm test -- tests/integration/performance-accessibility-integration.test.ts --run
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Performance and Accessibility Tests
on: [push, pull_request]

jobs:
  performance-accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm test -- --testPathPattern="tests/integration" --run
      - name: Upload test reports
        uses: actions/upload-artifact@v3
        with:
          name: performance-accessibility-reports
          path: coverage/
```

## Best Practices

### Writing Performance Tests

1. **Use realistic data**: Test with representative content sizes
2. **Mock external dependencies**: Avoid network calls in unit tests
3. **Measure consistently**: Use the same measurement points
4. **Set appropriate thresholds**: Based on real user expectations

### Writing Accessibility Tests

1. **Test real user scenarios**: Focus on actual user workflows
2. **Use semantic HTML**: Prefer semantic elements over ARIA
3. **Test keyboard navigation**: Ensure all functionality is keyboard accessible
4. **Validate screen reader support**: Test with actual assistive technologies

### Maintenance

1. **Update thresholds regularly**: Based on performance improvements
2. **Review test failures**: Understand root causes, don't just fix tests
3. **Monitor real-world metrics**: Compare test results with production data
4. **Keep dependencies updated**: Especially axe-core and testing libraries

## Requirements Compliance

### Task 11.2 Requirements

✅ **Core Web Vitals測定の統合テストを作成**

- Comprehensive Core Web Vitals measurement
- Automated threshold validation
- Performance monitoring utilities

✅ **WCAG 2.1 AA準拠の自動テストを実装**

- Complete WCAG 2.1 AA rule coverage
- Automated compliance reporting
- Category-specific testing

✅ **キーボードナビゲーション・スクリーンリーダー対応テストを作成**

- Full keyboard navigation testing
- Focus management validation
- Screen reader support verification

### Requirements 5.3, 5.4 Compliance

- **5.3**: Performance testing with Core Web Vitals and memory monitoring
- **5.4**: Accessibility testing with WCAG 2.1 AA compliance and keyboard navigation

## Future Enhancements

1. **Visual Regression Testing**: Add screenshot comparison tests
2. **Real Device Testing**: Integrate with device farms
3. **Lighthouse Integration**: Add Lighthouse CI for comprehensive audits
4. **Performance Budgets**: Implement performance budget enforcement
5. **A11y Tree Testing**: Add accessibility tree validation
6. **Voice Control Testing**: Test voice navigation support

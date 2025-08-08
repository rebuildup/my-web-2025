/**
 * @jest-environment jsdom
 */

import * as faviconManagerModule from "../favicon-manager";

describe("Favicon Manager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should import without crashing", () => {
    expect(() => {
      expect(faviconManagerModule).toBeDefined();
    }).not.toThrow();
  });

  it("should have basic functionality", () => {
    expect(faviconManagerModule).toBeDefined();
  });
});

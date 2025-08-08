/**
 * @jest-environment jsdom
 */

import * as analyticsModule from "../analytics";

describe("Admin Analytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should import without crashing", () => {
    expect(() => {
      expect(analyticsModule).toBeDefined();
    }).not.toThrow();
  });

  it("should have basic functionality", () => {
    expect(analyticsModule).toBeDefined();
  });
});

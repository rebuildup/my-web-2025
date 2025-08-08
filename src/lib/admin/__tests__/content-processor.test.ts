/**
 * @jest-environment jsdom
 */

import * as contentProcessorModule from "../content-processor";

describe("Content Processor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should import without crashing", () => {
    expect(() => {
      expect(contentProcessorModule).toBeDefined();
    }).not.toThrow();
  });

  it("should have basic functionality", () => {
    expect(contentProcessorModule).toBeDefined();
  });
});

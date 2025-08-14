/**
 * Mock for Three.js modules that cause Jest parsing issues
 */

// Mock Stats module
export default class Stats {
  constructor() {
    this.dom = document.createElement("div");
  }

  begin() {}
  end() {}
  update() {}
  setMode() {}
}

// Mock other common Three.js utilities
export const OrbitControls = jest.fn();
export const GLTFLoader = jest.fn();
export const DRACOLoader = jest.fn();
export const RGBELoader = jest.fn();
export const PMREMGenerator = jest.fn();

// Mock WebGL utilities
export const WebGLUtils = {
  getWebGLErrorMessage: jest.fn(),
  getShaderErrorMessage: jest.fn(),
};

// Default export for compatibility
module.exports = Stats;
module.exports.OrbitControls = OrbitControls;
module.exports.GLTFLoader = GLTFLoader;
module.exports.DRACOLoader = DRACOLoader;
module.exports.RGBELoader = RGBELoader;
module.exports.PMREMGenerator = PMREMGenerator;
module.exports.WebGLUtils = WebGLUtils;

import {
  sortFramesByName,
  validatePngFile,
  formatFileSize,
} from "../utils/fileProcessor";
import { FrameData } from "../types";

describe("fileProcessor", () => {
  describe("sortFramesByName", () => {
    it("sorts frames by numeric order in filename", () => {
      const frames: FrameData[] = [
        {
          name: "frame_10.png",
          dataUrl: "",
          width: 100,
          height: 100,
          size: 1000,
          file: new File([], "frame_10.png"),
        },
        {
          name: "frame_2.png",
          dataUrl: "",
          width: 100,
          height: 100,
          size: 1000,
          file: new File([], "frame_2.png"),
        },
        {
          name: "frame_1.png",
          dataUrl: "",
          width: 100,
          height: 100,
          size: 1000,
          file: new File([], "frame_1.png"),
        },
      ];

      const sorted = sortFramesByName(frames);

      expect(sorted[0].name).toBe("frame_1.png");
      expect(sorted[1].name).toBe("frame_2.png");
      expect(sorted[2].name).toBe("frame_10.png");
    });

    it("falls back to alphabetical sorting when no numbers found", () => {
      const frames: FrameData[] = [
        {
          name: "zebra.png",
          dataUrl: "",
          width: 100,
          height: 100,
          size: 1000,
          file: new File([], "zebra.png"),
        },
        {
          name: "apple.png",
          dataUrl: "",
          width: 100,
          height: 100,
          size: 1000,
          file: new File([], "apple.png"),
        },
        {
          name: "banana.png",
          dataUrl: "",
          width: 100,
          height: 100,
          size: 1000,
          file: new File([], "banana.png"),
        },
      ];

      const sorted = sortFramesByName(frames);

      expect(sorted[0].name).toBe("apple.png");
      expect(sorted[1].name).toBe("banana.png");
      expect(sorted[2].name).toBe("zebra.png");
    });

    it("does not mutate original array", () => {
      const frames: FrameData[] = [
        {
          name: "frame_2.png",
          dataUrl: "",
          width: 100,
          height: 100,
          size: 1000,
          file: new File([], "frame_2.png"),
        },
        {
          name: "frame_1.png",
          dataUrl: "",
          width: 100,
          height: 100,
          size: 1000,
          file: new File([], "frame_1.png"),
        },
      ];

      const originalOrder = frames.map((f) => f.name);
      sortFramesByName(frames);

      expect(frames.map((f) => f.name)).toEqual(originalOrder);
    });
  });

  describe("validatePngFile", () => {
    it("validates PNG files by MIME type", () => {
      const pngFile = new File([], "test.png", { type: "image/png" });
      expect(validatePngFile(pngFile)).toBe(true);
    });

    it("validates PNG files by extension", () => {
      const pngFile = new File([], "test.png", { type: "" });
      expect(validatePngFile(pngFile)).toBe(true);
    });

    it("validates PNG files with uppercase extension", () => {
      const pngFile = new File([], "test.PNG", { type: "" });
      expect(validatePngFile(pngFile)).toBe(true);
    });

    it("rejects non-PNG files", () => {
      const jpgFile = new File([], "test.jpg", { type: "image/jpeg" });
      expect(validatePngFile(jpgFile)).toBe(false);
    });
  });

  describe("formatFileSize", () => {
    it("formats bytes correctly", () => {
      expect(formatFileSize(0)).toBe("0 Bytes");
      expect(formatFileSize(500)).toBe("500 Bytes");
    });

    it("formats kilobytes correctly", () => {
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1536)).toBe("1.5 KB");
    });

    it("formats megabytes correctly", () => {
      expect(formatFileSize(1024 * 1024)).toBe("1 MB");
      expect(formatFileSize(1024 * 1024 * 2.5)).toBe("2.5 MB");
    });

    it("formats gigabytes correctly", () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe("1 GB");
    });
  });
});

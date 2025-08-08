/**
 * Content Parser Service Tests
 * Tests for embed resolution functionality
 */

import type {
  ExternalLink,
  MediaData,
  MediaEmbed,
} from "../../../types/content";
import {
  ContentParser,
  MediaResolver,
  createContentParser,
} from "../content-parser";

describe("MediaResolver", () => {
  let resolver: MediaResolver;

  beforeEach(() => {
    resolver = new MediaResolver();
  });

  describe("resolveImageIndex", () => {
    const images = ["/image1.jpg", "/image2.png", "/image3.gif"];

    it("should resolve valid image index", () => {
      expect(resolver.resolveImageIndex(0, images)).toBe("/image1.jpg");
      expect(resolver.resolveImageIndex(1, images)).toBe("/image2.png");
      expect(resolver.resolveImageIndex(2, images)).toBe("/image3.gif");
    });

    it("should return null for invalid index", () => {
      expect(resolver.resolveImageIndex(-1, images)).toBeNull();
      expect(resolver.resolveImageIndex(3, images)).toBeNull();
      expect(resolver.resolveImageIndex(1.5, images)).toBeNull();
    });

    it("should handle empty array", () => {
      expect(resolver.resolveImageIndex(0, [])).toBeNull();
    });
  });

  describe("resolveVideoIndex", () => {
    const videos: MediaEmbed[] = [
      {
        type: "youtube",
        url: "https://youtu.be/dQw4w9WgXcQ",
        title: "Test Video 1",
      },
      {
        type: "vimeo",
        url: "https://vimeo.com/123456789",
        title: "Test Video 2",
      },
    ];

    it("should resolve valid video index", () => {
      const result = resolver.resolveVideoIndex(0, videos);
      expect(result).toEqual(videos[0]);
    });

    it("should return null for invalid index", () => {
      expect(resolver.resolveVideoIndex(-1, videos)).toBeNull();
      expect(resolver.resolveVideoIndex(2, videos)).toBeNull();
    });
  });

  describe("resolveLinkIndex", () => {
    const links: ExternalLink[] = [
      {
        type: "github",
        url: "https://github.com/test/repo",
        title: "GitHub Repo",
      },
      {
        type: "demo",
        url: "https://demo.example.com",
        title: "Live Demo",
      },
    ];

    it("should resolve valid link index", () => {
      const result = resolver.resolveLinkIndex(0, links);
      expect(result).toEqual(links[0]);
    });

    it("should return null for invalid index", () => {
      expect(resolver.resolveLinkIndex(-1, links)).toBeNull();
      expect(resolver.resolveLinkIndex(2, links)).toBeNull();
    });
  });

  describe("validateIndex", () => {
    it("should validate correct indices", () => {
      expect(resolver.validateIndex(0, 3)).toBe(true);
      expect(resolver.validateIndex(1, 3)).toBe(true);
      expect(resolver.validateIndex(2, 3)).toBe(true);
    });

    it("should reject invalid indices", () => {
      expect(resolver.validateIndex(-1, 3)).toBe(false);
      expect(resolver.validateIndex(3, 3)).toBe(false);
      expect(resolver.validateIndex(1.5, 3)).toBe(false);
    });
  });
});

describe("ContentParser", () => {
  let parser: ContentParser;
  let mockMediaData: MediaData;

  beforeEach(() => {
    parser = new ContentParser();
    mockMediaData = {
      images: ["/image1.jpg", "/image2.png"],
      videos: [
        {
          type: "youtube",
          url: "https://youtu.be/dQw4w9WgXcQ",
          title: "Test Video",
        },
        {
          type: "vimeo",
          url: "https://vimeo.com/123456789",
          title: "Vimeo Video",
        },
      ],
      externalLinks: [
        {
          type: "github",
          url: "https://github.com/test/repo",
          title: "GitHub Repo",
        },
        {
          type: "demo",
          url: "https://demo.example.com",
          title: "Live Demo",
        },
      ],
    };
  });

  describe("extractEmbedReferences", () => {
    it("should extract image references", () => {
      const content =
        'Here is an image: ![image:0] and another ![image:1 "Alt text"]';
      const refs = parser.extractEmbedReferences(content);

      expect(refs).toHaveLength(2);
      expect(refs[0]).toEqual({
        type: "image",
        index: 0,
        altText: undefined,
        cssClasses: undefined,
        originalMatch: "![image:0]",
        startPos: 18,
        endPos: 28,
      });
      expect(refs[1]).toEqual({
        type: "image",
        index: 1,
        altText: "Alt text",
        cssClasses: undefined,
        originalMatch: '![image:1 "Alt text"]',
        startPos: 41,
        endPos: 62,
      });
    });

    it("should extract video references", () => {
      const content =
        'Check out this video: ![video:0] and this one ![video:1 "Custom title"]';
      const refs = parser.extractEmbedReferences(content);

      expect(refs).toHaveLength(2);
      expect(refs[0]).toEqual({
        type: "video",
        index: 0,
        customText: undefined,
        cssClasses: undefined,
        originalMatch: "![video:0]",
        startPos: 22,
        endPos: 32,
      });
      expect(refs[1]).toEqual({
        type: "video",
        index: 1,
        customText: "Custom title",
        cssClasses: undefined,
        originalMatch: '![video:1 "Custom title"]',
        startPos: 46,
        endPos: 71,
      });
    });

    it("should extract link references", () => {
      const content = 'Visit [link:0] or [link:1 "Custom text"]';
      const refs = parser.extractEmbedReferences(content);

      expect(refs).toHaveLength(2);
      expect(refs[0]).toEqual({
        type: "link",
        index: 0,
        customText: undefined,
        cssClasses: undefined,
        originalMatch: "[link:0]",
        startPos: 6,
        endPos: 14,
      });
      expect(refs[1]).toEqual({
        type: "link",
        index: 1,
        customText: "Custom text",
        cssClasses: undefined,
        originalMatch: '[link:1 "Custom text"]',
        startPos: 18,
        endPos: 40,
      });
    });

    it("should extract mixed references", () => {
      const content = "Image: ![image:0], Video: ![video:0], Link: [link:0]";
      const refs = parser.extractEmbedReferences(content);

      expect(refs).toHaveLength(3);
      expect(refs.map((r) => r.type)).toEqual(["image", "video", "link"]);
    });
  });

  describe("createEmbedResolutionMap", () => {
    it("should create resolution map from media data", () => {
      const map = parser.createEmbedResolutionMap(mockMediaData);

      expect(map.images.get(0)).toBe("/image1.jpg");
      expect(map.images.get(1)).toBe("/image2.png");
      expect(map.videos.get(0)).toEqual(mockMediaData.videos[0]);
      expect(map.links.get(0)).toEqual(mockMediaData.externalLinks[0]);
    });
  });

  describe("resolveEmbedReferences", () => {
    it("should resolve image embeds", () => {
      const content = "Here is an image: ![image:0]";
      const result = parser.resolveEmbedReferences(content, mockMediaData);

      expect(result).toBe("Here is an image: ![Image 0](/image1.jpg)");
    });

    it("should resolve image embeds with alt text", () => {
      const content = 'Here is an image: ![image:0 "My Image"]';
      const result = parser.resolveEmbedReferences(content, mockMediaData);

      expect(result).toBe("Here is an image: ![My Image](/image1.jpg)");
    });

    it("should resolve YouTube video embeds", () => {
      const content = "Watch this: ![video:0]";
      const result = parser.resolveEmbedReferences(content, mockMediaData);

      expect(result).toContain('<div class="video-embed youtube-embed">');
      expect(result).toContain(
        'src="https://www.youtube.com/embed/dQw4w9WgXcQ"',
      );
      expect(result).toContain('title="Test Video"');
    });

    it("should resolve Vimeo video embeds", () => {
      const content = "Watch this: ![video:1]";
      const result = parser.resolveEmbedReferences(content, mockMediaData);

      expect(result).toContain('<div class="video-embed vimeo-embed">');
      expect(result).toContain(
        'src="https://player.vimeo.com/video/123456789"',
      );
      expect(result).toContain('title="Vimeo Video"');
    });

    it("should resolve link embeds", () => {
      const content = "Check out [link:0]";
      const result = parser.resolveEmbedReferences(content, mockMediaData);

      expect(result).toBe(
        "Check out [GitHub Repo](https://github.com/test/repo)",
      );
    });

    it("should resolve link embeds with custom text", () => {
      const content = 'Check out [link:0 "My Custom Link"]';
      const result = parser.resolveEmbedReferences(content, mockMediaData);

      expect(result).toBe(
        "Check out [My Custom Link](https://github.com/test/repo)",
      );
    });

    it("should handle invalid references gracefully", () => {
      const content = "Invalid: ![image:99] ![video:99] [link:99]";
      const result = parser.resolveEmbedReferences(content, mockMediaData);

      expect(result).toContain("![Image not found: index 99]");
      expect(result).toContain("動画が見つかりません");
      expect(result).toContain("[Link not found: index 99]");
    });

    it("should handle iframe embeds with security validation", () => {
      const content =
        'Here is an iframe: <iframe src="https://www.youtube.com/embed/test123" title="Test"></iframe>';
      const result = parser.resolveEmbedReferences(content, mockMediaData);

      // The iframe should either be preserved (if allowed) or blocked with a fallback
      expect(result).toContain("iframe");
      // Check that some processing occurred
      expect(result.length).toBeGreaterThan(content.length);
    });
  });

  describe("validateEmbedSyntax", () => {
    it("should validate correct embed syntax", () => {
      const content = "![image:0] ![video:0] [link:0]";
      const result = parser.validateEmbedSyntax(content, mockMediaData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect invalid image index", () => {
      const content = "![image:99]";
      const result = parser.validateEmbedSyntax(content, mockMediaData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe("INVALID_INDEX");
      expect(result.errors[0].message).toContain("Invalid image index 99");
    });

    it("should detect invalid video index", () => {
      const content = "![video:99]";
      const result = parser.validateEmbedSyntax(content, mockMediaData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe("INVALID_INDEX");
      expect(result.errors[0].message).toContain("Invalid video index 99");
    });

    it("should detect invalid link index", () => {
      const content = "[link:99]";
      const result = parser.validateEmbedSyntax(content, mockMediaData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe("INVALID_INDEX");
      expect(result.errors[0].message).toContain("Invalid link index 99");
    });

    it("should provide helpful suggestions", () => {
      const content = "![image:99]";
      const result = parser.validateEmbedSyntax(content, mockMediaData);

      expect(result.errors[0].suggestion).toBe(
        "Index 99 is too high. Available image indices: 0-1 (2 total)",
      );
    });

    it("should handle empty media arrays", () => {
      const emptyMediaData: MediaData = {
        images: [],
        videos: [],
        externalLinks: [],
      };
      const content = "![image:0]";
      const result = parser.validateEmbedSyntax(content, emptyMediaData);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].suggestion).toBe(
        "No image data available. Add images to your content first.",
      );
    });
  });

  describe("parseMarkdown", () => {
    it("should parse markdown with valid embeds", async () => {
      const content =
        "# Test\n\nImage: ![image:0]\nVideo: ![video:0]\nLink: [link:0]";
      const result = await parser.parseMarkdown(content, mockMediaData);

      expect(result).toContain("![Image 0](/image1.jpg)");
      expect(result).toContain('<div class="video-embed youtube-embed">');
      expect(result).toContain("[GitHub Repo](https://github.com/test/repo)");
    });

    it("should handle validation errors gracefully", async () => {
      const content = "Invalid: ![image:99]";
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const result = await parser.parseMarkdown(content, mockMediaData);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Embed validation errors found:",
        expect.any(Array),
      );
      expect(result).toContain("Image not found");

      consoleSpy.mockRestore();
    });
  });
});

describe("createContentParser", () => {
  it("should create content parser with default media resolver", () => {
    const parser = createContentParser();
    expect(parser).toBeInstanceOf(ContentParser);
  });

  it("should create content parser with custom media resolver", () => {
    const customResolver = new MediaResolver();
    const parser = createContentParser(customResolver);
    expect(parser).toBeInstanceOf(ContentParser);
  });
});

"use client";
// Forced HMR Update


import { SEOData } from "@/types/content";

interface SEOSectionProps {
	seo?: SEOData;
	onSEOChange: (seo: SEOData | undefined) => void;
	title?: string;
	category?: string;
	tags?: string[];
	thumbnail?: string;
}
export function SEOSection({
	seo,
	onSEOChange,
	title,
	category,
	tags,
	thumbnail,
}: SEOSectionProps) {
	const handleInputChange = (field: keyof SEOData, value: unknown) => {
		const currentSEO = seo || {};
		onSEOChange({
			...currentSEO,
			[field]: value,
		});
	};

	const handleKeywordsChange = (keywordsString: string) => {
		const keywords = keywordsString
			.split(",")
			.map((keyword) => keyword.trim())
			.filter((keyword) => keyword.length > 0);
		handleInputChange("keywords", keywords);
	};

	const inputStyle =
		"w-full border border-main px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base";
	const labelStyle =
		"block noto-sans-jp-regular text-sm font-medium text-main mb-1";
	const checkboxStyle =
		"rounded border-main text-main focus:ring-main focus:ring-offset-0";

	return (
		<div className="space-y-4">
			<h3 className="neue-haas-grotesk-display text-xl text-main leading-snug">
				SEO Settings
			</h3>

			   {/* Basic SEO */}
			   <div className="space-y-4">
				   <div>
					   <label className={labelStyle}>SEO Title</label>
					   <input
						   type="text"
						   value={seo?.title || ""}
						   onChange={(e) => handleInputChange("title", e.target.value)}
						   className={inputStyle}
						   placeholder="Custom title for search engines"
						   maxLength={60}
					   />
					   <p className="text-xs text-gray-500 mt-1">
						   {(seo?.title || "").length}/60 characters (recommended)
					   </p>
				   </div>
				   <div>
					   <label className={labelStyle}>SEO Description</label>
					   <textarea
						   value={seo?.description || ""}
						   onChange={(e) => handleInputChange("description", e.target.value)}
						   className={`${inputStyle} h-20 resize-vertical`}
						   placeholder="Description for search engines and social media"
						   maxLength={160}
						   rows={3}
					   />
					   <p className="text-xs text-gray-500 mt-1">
						   {(seo?.description || "").length}/160 characters (recommended)
					   </p>
				   </div>
				   <div>
					   <label className={labelStyle}>Keywords</label>
					   <input
						   type="text"
						   value={seo?.keywords?.join(", ") || ""}
						   onChange={(e) => handleKeywordsChange(e.target.value)}
						   className={inputStyle}
						   placeholder="keyword1, keyword2, keyword3"
					   />
					   <p className="text-xs text-gray-500 mt-1">
						   Separate keywords with commas. Focus on 3-5 relevant keywords.
					   </p>
				   </div>
			   </div>

			   {/* Social Media Images */}
			   <div className="space-y-4">
				   <h4 className="noto-sans-jp-regular text-sm font-medium text-main">
					   Social Media Images
				   </h4>
				   <div>
					   <label className={labelStyle}>Open Graph Image</label>
					   <input
						   type="url"
						   value={seo?.ogImage || ""}
						   onChange={(e) => handleInputChange("ogImage", e.target.value)}
						   className={inputStyle}
						   placeholder="https://example.com/og-image.png"
					   />
					   <p className="text-xs text-gray-500 mt-1">
						   Recommended size: 1200x630px. Used for Facebook, LinkedIn, etc.
					   </p>
				   </div>
				   <div>
					   <label className={labelStyle}>Twitter Image</label>
					   <input
						   type="url"
						   value={seo?.twitterImage || ""}
						   onChange={(e) => handleInputChange("twitterImage", e.target.value)}
						   className={inputStyle}
						   placeholder="https://example.com/twitter-image.jpg"
					   />
					   <p className="text-xs text-gray-500 mt-1">
						   Recommended size: 1200x600px. Used for Twitter cards.
					   </p>
				   </div>
			   </div>

			   {/* Advanced Settings */}
			   <div className="space-y-4">
				   <h4 className="noto-sans-jp-regular text-sm font-medium text-main">
					   Advanced Settings
				   </h4>
				   <div>
					   <label className={labelStyle}>Canonical URL</label>
					   <input
						   type="url"
						   value={seo?.canonical || ""}
						   onChange={(e) => handleInputChange("canonical", e.target.value)}
						   className={inputStyle}
						   placeholder="https://example.com/canonical-url"
					   />
					   <p className="text-xs text-gray-500 mt-1">
						   Specify the canonical URL to avoid duplicate content issues.
					   </p>
				   </div>
				   <div className="space-y-2">
					   <div className="flex items-center">
						   <input
							   type="checkbox"
							   id="noindex"
							   checked={seo?.noindex || false}
							   onChange={(e) => handleInputChange("noindex", e.target.checked)}
							   className={checkboxStyle}
						   />
						   <label htmlFor="noindex" className="ml-2 text-sm text-gray-700">
							   No Index (prevent search engines from indexing this page)
						   </label>
					   </div>
					   <div className="flex items-center">
						   <input
							   type="checkbox"
							   id="nofollow"
							   checked={seo?.nofollow || false}
							   onChange={(e) => handleInputChange("nofollow", e.target.checked)}
							   className={checkboxStyle}
						   />
						   <label htmlFor="nofollow" className="ml-2 text-sm text-gray-700">
							   No Follow (prevent search engines from following links on this
							   page)
						   </label>
					   </div>
				   </div>
			   </div>

			   {/* SEO Preview */}
			   {(seo?.title || seo?.description) && (
				   <div className="border border-gray-200 p-4 rounded">
					   <h4 className="noto-sans-jp-regular text-sm font-medium text-main mb-3">
						   Search Engine Preview
					   </h4>
					   <div className="space-y-2">
						   <div className="text-blue-600 text-lg hover:underline cursor-pointer">
							   {seo?.title || "Page Title"}
						   </div>
						   <div className="text-green-700 text-sm">
							   https://yusuke-kim.com/example-url
						   </div>
						   <div className="text-gray-600 text-sm">
							   {seo?.description || "Page description will appear here..."}
						   </div>
					   </div>
				   </div>
			   )}
			   {/* Social Media Preview */}
			   {(seo?.title || seo?.description || seo?.ogImage) && (
				   <div className="border border-gray-200 p-4 rounded">
					   <h4 className="noto-sans-jp-regular text-sm font-medium text-main mb-3">
						   Social Media Preview
					   </h4>
					   <div className="border border-gray-300 rounded overflow-hidden max-w-md">
						   {seo?.ogImage && (
							   <div className="aspect-video bg-gray-100">
								   {/* eslint-disable-next-line @next/next/no-img-element */}
								   <img
									   src={seo.ogImage}
									   alt="OG Preview"
									   className="w-full h-full object-cover"
									   onError={(e) => {
										   (e.target as HTMLImageElement).style.display = "none";
									   }}
								   />
							   </div>
						   )}
						   <div className="p-3 bg-white">
							   <div className="text-sm font-medium text-gray-900 mb-1">
								   {seo?.title || "Page Title"}
							   </div>
							   <div className="text-xs text-gray-600 mb-1">
								   {seo?.description || "Page description will appear here..."}
							   </div>
							   <div className="text-xs text-gray-500">yusuke-kim.com</div>
						   </div>
					   </div>
				   </div>
			   )}

			{/* Dynamic OG Image Preview */}
			<div className="border border-gray-200 p-4 rounded bg-gray-50">
				<h4 className="noto-sans-jp-regular text-sm font-medium text-main mb-3">
					Dynamic Generated Mockup
				</h4>
				<p className="text-xs text-gray-500 mb-2">
					Based on current title, category, tags, and thumbnail.
				</p>
				<div className="border border-gray-300 rounded overflow-hidden max-w-md">
					<div className="aspect-video bg-gray-100">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={`/api/og?title=${encodeURIComponent(
								title || "Untitled",
							)}&category=${encodeURIComponent(
								category || "Portfolio",
							)}&tags=${encodeURIComponent(
								(tags || []).join(","),
							)}&thumbnail=${encodeURIComponent(thumbnail || "")}`}
							alt="Dynamic OG Preview"
							className="w-full h-full object-cover"
							onError={(e) => {
								(e.target as HTMLImageElement).style.display = "none";
							}}
						/>
					</div>
				</div>
			</div>

			{/* Clear SEO Data */}
			{seo && Object.keys(seo).length > 0 && (
				<div className="pt-4 border-t border-gray-200">
					<button
						type="button"
						onClick={() => onSEOChange(undefined)}
						className="text-red-600 hover:text-red-800 text-sm"
					>
						Clear all SEO data
					</button>
				</div>
			)}
		</div>
	);
}

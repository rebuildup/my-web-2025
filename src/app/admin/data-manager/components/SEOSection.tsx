"use client";
// Forced HMR Update


import Image from "next/image";
import { SEOData } from "@/types/content";

interface SEOSectionProps {
	seo?: SEOData;
	onSEOChange: (seo: SEOData | undefined) => void;
	title?: string;
	category?: string;
	tags?: string[];
	thumbnail?: string;
}

interface OGFieldsProps {
	seo?: SEOData;
	inputStyle: string;
	labelStyle: string;
	onChange: (field: keyof SEOData, value: unknown) => void;
}

interface TwitterFieldsProps {
	seo?: SEOData;
	inputStyle: string;
	labelStyle: string;
	onChange: (field: keyof SEOData, value: unknown) => void;
}

interface SEOPreviewProps {
	seo?: SEOData;
	title?: string;
	category?: string;
	tags?: string[];
	thumbnail?: string;
}

interface SEOFooterProps {
	seo?: SEOData;
	onClear: () => void;
}

function SEOHeader() {
	return (
		<h3 className="neue-haas-grotesk-display text-xl leading-snug">
			SEO Settings
		</h3>
	);
}

function OGFields({ seo, inputStyle, labelStyle, onChange }: OGFieldsProps) {
	return (
		<div>
			<label className={labelStyle}>Open Graph Image</label>
			<input
				type="url"
				value={seo?.ogImage || ""}
				onChange={(e) => onChange("ogImage", e.target.value)}
				className={inputStyle}
				placeholder="https://example.com/og-image.png"
			/>
			<p className="text-xs  mt-1">
				Recommended size: 1200x630px. Used for Facebook, LinkedIn, etc.
			</p>
		</div>
	);
}

function TwitterFields({
	seo,
	inputStyle,
	labelStyle,
	onChange,
}: TwitterFieldsProps) {
	return (
		<div>
			<label className={labelStyle}>Twitter Image</label>
			<input
				type="url"
				value={seo?.twitterImage || ""}
				onChange={(e) => onChange("twitterImage", e.target.value)}
				className={inputStyle}
				placeholder="https://example.com/twitter-image.jpg"
			/>
			<p className="text-xs  mt-1">
				Recommended size: 1200x600px. Used for Twitter cards.
			</p>
		</div>
	);
}

function SEOPreview({
	seo,
	title,
	category,
	tags,
	thumbnail,
}: SEOPreviewProps) {
	return (
		<>
			{/* SEO Preview */}
			{(seo?.title || seo?.description) && (
				<div className="  p-4 rounded">
					<h4 className="noto-sans-jp-regular text-sm font-medium mb-3">
						Search Engine Preview
					</h4>
					<div className="space-y-2">
						<div className=" text-lg hover:underline cursor-pointer">
							{seo?.title || "Page Title"}
						</div>
						<div className=" text-sm">
							https://yusuke-kim.com/example-url
						</div>
						<div className=" text-sm">
							{seo?.description || "Page description will appear here..."}
						</div>
					</div>
				</div>
			)}
			{/* Social Media Preview */}
			{(seo?.title || seo?.description || seo?.ogImage) && (
				<div className="  p-4 rounded">
					<h4 className="noto-sans-jp-regular text-sm font-medium mb-3">
						Social Media Preview
					</h4>
					<div className="  rounded overflow-hidden max-w-md">
						{seo?.ogImage && (
							<div className="aspect-video ">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<Image
									src={seo.ogImage} width={1200} height={630} unoptimized
									alt="OG Preview"
									className="w-full h-full object-cover"
									onError={(e) => {
										(e.target as HTMLImageElement).style.display = "none";
									}}
								/>
							</div>
						)}
						<div className="p-3 ">
							<div className="text-sm font-medium  mb-1">
								{seo?.title || "Page Title"}
							</div>
							<div className="text-xs  mb-1">
								{seo?.description || "Page description will appear here..."}
							</div>
							<div className="text-xs ">yusuke-kim.com</div>
						</div>
					</div>
				</div>
			)}

			{/* Dynamic OG Image Preview */}
			<div className="  p-4 rounded ">
				<h4 className="noto-sans-jp-regular text-sm font-medium mb-3">
					Dynamic Generated Mockup
				</h4>
				<p className="text-xs  mb-2">
					Based on current title, category, tags, and thumbnail.
				</p>
				<div className="  rounded overflow-hidden max-w-md">
					<div className="aspect-video ">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<Image
							src={`/api/og?title=${encodeURIComponent(
								title || "Untitled",
							)}&category=${encodeURIComponent(
								category || "Portfolio",
							)}&tags=${encodeURIComponent(
								(tags || []).join(","),
							)}&thumbnail=${encodeURIComponent(thumbnail || "")}`}
							width={1200} height={630} unoptimized alt="Dynamic OG Preview"
							className="w-full h-full object-cover"
							onError={(e) => {
								(e.target as HTMLImageElement).style.display = "none";
							}}
						/>
					</div>
				</div>
			</div>
		</>
	);
}

function SEOFooter({ seo, onClear }: SEOFooterProps) {
	if (!seo || Object.keys(seo).length === 0) return null;
	return (
		<div className="pt-4  ">
			<button type="button" onClick={onClear} className="text-sm">
				Clear all SEO data
			</button>
		</div>
	);
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
		"w-full  px-3 py-2 text-sm   focus: focus:ring-offset-2 focus:ring-offset-base";
	const labelStyle =
		"block noto-sans-jp-regular text-sm font-medium mb-1";
	const checkboxStyle =
		"rounded focus: focus:ring-offset-0";

	return (
		<div className="space-y-4">
			<SEOHeader />

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
					<p className="text-xs  mt-1">
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
					<p className="text-xs  mt-1">
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
					<p className="text-xs  mt-1">
						Separate keywords with commas. Focus on 3-5 relevant keywords.
					</p>
				</div>
			</div>

			{/* Social Media Images */}
			<div className="space-y-4">
				<h4 className="noto-sans-jp-regular text-sm font-medium ">
					Social Media Images
				</h4>
				<OGFields
					seo={seo}
					inputStyle={inputStyle}
					labelStyle={labelStyle}
					onChange={handleInputChange}
				/>
				<TwitterFields
					seo={seo}
					inputStyle={inputStyle}
					labelStyle={labelStyle}
					onChange={handleInputChange}
				/>
			</div>

			{/* Advanced Settings */}
			<div className="space-y-4">
				<h4 className="noto-sans-jp-regular text-sm font-medium ">
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
					<p className="text-xs  mt-1">
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
						<label htmlFor="noindex" className="ml-2 text-sm ">
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
						<label htmlFor="nofollow" className="ml-2 text-sm ">
							No Follow (prevent search engines from following links on this
							page)
						</label>
					</div>
				</div>
			</div>

			<SEOPreview
				seo={seo}
				title={title}
				category={category}
				tags={tags}
				thumbnail={thumbnail}
			/>

			<SEOFooter seo={seo} onClear={() => onSEOChange(undefined)} />
		</div>
	);
}

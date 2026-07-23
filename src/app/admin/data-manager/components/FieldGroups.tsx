import { isEnhancedContentItem } from "@/types";
import { DownloadInfoSection } from "./DownloadInfoSection";
import { ExternalLinksSection } from "./ExternalLinksSection";
import { SEOSection } from "./SEOSection";
import { BasicFields } from "./BasicFields";
import { DateFields } from "./DateFields";
import { MediaFields } from "./MediaFields";
import type { FieldGroupsProps } from "./data-manager-form.types";

export function FieldGroups(props: FieldGroupsProps) {
	const { activeTab, formData, enhanced, handleInputChange } = props;
	return <>
		{activeTab === "basic" && <BasicFields {...props} />}
		{activeTab === "media" && <MediaFields {...props} />}
		{activeTab === "links" && <ExternalLinksSection links={formData.externalLinks || []} onLinksChange={(links) => handleInputChange("externalLinks", links)} />}
		{activeTab === "download" && formData.type === "download" && <DownloadInfoSection downloadInfo={formData.downloadInfo} onDownloadInfoChange={(downloadInfo) => handleInputChange("downloadInfo", downloadInfo)} />}
		{activeTab === "seo" && <SEOSection seo={formData.seo} onSEOChange={(seo) => handleInputChange("seo", seo)} title={formData.title} category={isEnhancedContentItem(formData) ? formData.categories?.[0] : formData.category} tags={formData.tags} thumbnail={formData.thumbnail || formData.images?.[0]} />}
		{activeTab === "dates" && enhanced && <DateFields {...props} />}
	</>;
}

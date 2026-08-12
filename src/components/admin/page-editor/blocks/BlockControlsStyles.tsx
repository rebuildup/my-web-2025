const BLOCK_CONTROLS_CSS = `
.block-image:hover .image-controls,
.block-image .image-controls:focus-within { opacity: 1 !important; pointer-events: auto !important; }

.block-video:hover .video-controls,
.block-video .video-controls:focus-within { opacity: 1 !important; pointer-events: auto !important; }

.block-audio:hover .audio-controls,
.block-audio .audio-controls:focus-within { opacity: 1 !important; pointer-events: auto !important; }
.block-audio:hover .audio-preview,
.block-audio:has(.audio-controls:focus-within) .audio-preview { margin-top: 224px; }

.block-file:hover .file-controls,
.block-file .file-controls:focus-within { opacity: 1 !important; pointer-events: auto !important; }
.block-file:hover .file-preview,
.block-file:has(.file-controls:focus-within) .file-preview { margin-top: 112px; }

.block-gallery:hover .gallery-controls,
.block-gallery .gallery-controls:focus-within { opacity: 1 !important; pointer-events: auto !important; }
.block-gallery:hover,
.block-gallery:has(.gallery-controls:focus-within) { padding-bottom: 112px; }

.block-spacer:hover .spacer-controls,
.block-spacer .spacer-controls:focus-within { opacity: 1 !important; pointer-events: auto !important; }

.block-code:hover .codeblock-controls,
.block-code .codeblock-controls:focus-within { opacity: 1 !important; pointer-events: auto !important; }

.block-custom-html:hover .custom-html-controls,
.block-custom-html .custom-html-controls:focus-within { opacity: 1 !important; pointer-events: auto !important; }
`;

export function BlockControlsStyles() {
	return (
		<style
			href="page-editor-block-controls"
			precedence="default"
			dangerouslySetInnerHTML={{ __html: BLOCK_CONTROLS_CSS }}
		/>
	);
}

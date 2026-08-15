"use client";

import { useState } from "react";

import { Loader2, Upload } from "lucide-react";

import { getCmsApiBaseUrl } from "@/lib/cms-api/config";

interface OrphanReplaceButtonProps {
	sourceContentId: string;
	sourceField: string;
	brokenMediaId: string;
}

interface ReplaceResult {
	ok: boolean;
	newMediaId?: string;
	newUrl?: string;
	error?: string;
}

function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = String(reader.result ?? "");
			resolve(result.includes(",") ? (result.split(",")[1] ?? "") : result);
		};
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});
}

/**
 * Recovery affordance: upload a replacement file to the Rust CMS API.
 * After upload, copy the new URL to clipboard and prompt the user to paste
 * it into the content's edit form. We intentionally avoid mutating the
 * per-content DB from the browser — that must happen through the existing
 * admin form so FTS5 / mappings stay consistent.
 */
export function OrphanReplaceButton({
	sourceContentId,
	sourceField,
	brokenMediaId,
}: OrphanReplaceButtonProps) {
	const [busy, setBusy] = useState(false);
	const [result, setResult] = useState<ReplaceResult | null>(null);

	async function handleFile(file: File) {
		setBusy(true);
		setResult(null);
		try {
			const base64Data = await fileToBase64(file);
			const uploadRes = await fetch(`${getCmsApiBaseUrl()}/media`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					contentId: sourceContentId,
					filename: file.name,
					mimeType: file.type,
					base64Data,
				}),
			});
			if (!uploadRes.ok) {
				throw new Error(`upload failed: ${uploadRes.status}`);
			}
			const { id } = (await uploadRes.json()) as { id: string };
			const newUrl = `${getCmsApiBaseUrl()}/api/cms/media?contentId=${encodeURIComponent(
				sourceContentId,
			)}&id=${encodeURIComponent(id)}&raw=1`;
			try {
				await navigator.clipboard.writeText(newUrl);
			} catch {
				// clipboard might be unavailable in some browsers; non-fatal
			}
			setResult({ ok: true, newMediaId: id, newUrl });
		} catch (err) {
			setResult({
				ok: false,
				error: err instanceof Error ? err.message : String(err),
			});
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="flex items-center gap-2 flex-wrap text-xs">
			<label className="inline-flex items-center gap-1 cursor-pointer rounded border px-2 py-1 hover:bg-black/5">
				{busy ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
				<span>{busy ? "アップロード中…" : "代替画像をアップロード"}</span>
				<input
					type="file"
					className="hidden"
					disabled={busy}
					accept="image/*"
					onChange={(e) => {
						const f = e.target.files?.[0];
						if (f) handleFile(f);
						e.target.value = "";
					}}
				/>
			</label>
			{result?.ok && result.newUrl ? (
				<code className="bg-green-50 border border-green-300 rounded px-1.5 py-0.5 break-all">
					新URL: {result.newUrl} (clipboard にコピー済み)
				</code>
			) : null}
			{result && !result.ok ? (
				<code className="bg-red-50 border border-red-300 rounded px-1.5 py-0.5 break-all">
					失敗: {result.error}
				</code>
			) : null}
			<span className="opacity-50">
				孤児 {brokenMediaId.slice(0, 16)}… / {sourceField}
			</span>
		</div>
	);
}

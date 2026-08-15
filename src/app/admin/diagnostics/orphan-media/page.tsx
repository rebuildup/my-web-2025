import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { AlertTriangle, ExternalLink, FileWarning } from "lucide-react";

import { getCmsApiBaseUrl } from "@/lib/cms-api/config";

import { OrphanReplaceButton } from "./OrphanReplaceButton";

interface OrphanRef {
	sourceContentId: string;
	sourceTitle?: string;
	sourceField: string;
	mediaId: string;
	brokenUrl: string;
	lineNumber?: number;
	matchOffset?: number;
}

interface OrphanReport {
	generatedAt: string;
	contentsDir: string;
	totalScanned: number;
	totalOrphans: number;
	orphans: OrphanRef[];
	grouped: Record<string, OrphanRef[]>;
}

async function loadOrphanReport(): Promise<OrphanReport | null> {
	const candidates = [
		join(process.cwd(), "data", "diagnostics", "orphan-media.json"),
		join(process.cwd(), "..", "data", "diagnostics", "orphan-media.json"),
	];
	for (const path of candidates) {
		try {
			const raw = await readFile(path, "utf8");
			return JSON.parse(raw) as OrphanReport;
		} catch {
			// try next candidate
		}
	}
	return null;
}

export const dynamic = "force-static";

export default async function OrphanMediaDiagnosticsPage() {
	const report = await loadOrphanReport();

	if (!report) {
		return (
			<div className="space-y-4">
				<h1 className="text-xl font-semibold flex items-center gap-2">
					<FileWarning size={20} />
					孤児メディア診断
				</h1>
				<div
					className="rounded border p-4 text-sm space-y-2"
					style={{
						borderColor: "var(--color-border, #ccc)",
						background: "var(--color-card, #fafafa)",
					}}
				>
					<p>
						<code>data/diagnostics/orphan-media.json</code>{" "}
						が見つかりません. 先に diagnostic スクリプトを実行してください:
					</p>
					<pre className="rounded bg-black/5 p-3 text-xs overflow-x-auto">
						<code>bun run diagnose:orphan-media</code>
					</pre>
					<p className="text-xs opacity-70">
						本番環境では <code>CONTENT_DATA_DIR</code>{" "}
						を本番のデータディレクトリに向けた状態で実行してください.
					</p>
				</div>
			</div>
		);
	}

	const generatedAt = new Date(report.generatedAt).toLocaleString("ja-JP");
	const contentIds = Object.keys(report.grouped).sort();

	return (
		<div className="space-y-6">
			<header className="space-y-1">
				<h1 className="text-xl font-semibold flex items-center gap-2">
					<AlertTriangle size={20} />
					孤児メディア診断
				</h1>
				<p className="text-xs opacity-70">
					検出時刻: {generatedAt} / スキャン: {report.totalScanned}{" "}
					件のメディア参照 / 孤児:{" "}
					<span className="font-semibold">{report.totalOrphans}</span> 件
				</p>
				<p className="text-xs opacity-70">
					CMS API base: <code>{getCmsApiBaseUrl()}</code>
				</p>
			</header>

			{contentIds.length === 0 ? (
				<div
					className="rounded border p-4 text-sm"
					style={{ borderColor: "var(--color-border, #ccc)" }}
				>
					✅ 孤児メディア参照は見つかりませんでした.
				</div>
			) : (
				contentIds.map((contentId) => {
					const refs = report.grouped[contentId] || [];
					const title = refs[0]?.sourceTitle;
					return (
						<section
							key={contentId}
							className="rounded border"
							style={{ borderColor: "var(--color-border, #ccc)" }}
						>
							<header
								className="px-4 py-2 flex items-center justify-between"
								style={{ background: "var(--color-card, #f5f5f5)" }}
							>
								<div>
									<div className="font-mono text-sm">{contentId}</div>
									{title ? (
										<div className="text-xs opacity-70">{title}</div>
									) : null}
								</div>
								<a
									href={`/admin/content/page-editor?id=${encodeURIComponent(contentId)}`}
									className="text-xs underline flex items-center gap-1"
									target="_blank"
									rel="noreferrer"
								>
									編集ページを開く <ExternalLink size={12} />
								</a>
							</header>
							<ul className="divide-y" style={{ borderColor: "inherit" }}>
								{refs.map((ref, idx) => (
									<li
										key={`${ref.mediaId}-${ref.sourceField}-${idx}`}
										className="px-4 py-3 space-y-2 text-sm"
									>
										<div className="flex items-baseline justify-between gap-2 flex-wrap">
											<code className="text-xs bg-black/5 px-1 py-0.5 rounded">
												{ref.sourceField}
												{ref.lineNumber != null ? ` (line ${ref.lineNumber})` : ""}
											</code>
											<code className="text-xs font-mono opacity-70">
												{contentId}/{ref.mediaId}
											</code>
										</div>
										<div className="text-xs break-all opacity-80">
											{ref.brokenUrl}
										</div>
										<OrphanReplaceButton
											sourceContentId={contentId}
											sourceField={ref.sourceField}
											brokenMediaId={ref.mediaId}
										/>
									</li>
								))}
							</ul>
						</section>
					);
				})
			)}

			<footer className="text-xs opacity-60 space-y-1">
				<p>
					このページはビルド時に <code>data/diagnostics/orphan-media.json</code>{" "}
					を読み込みます. 孤児を修正したあとは:
				</p>
				<ol className="list-decimal pl-5 space-y-0.5">
					<li>
						コンテンツ編集ページで新しい画像をアップロード → サムネイルに設定 →
						保存
					</li>
					<li>
						<code>bun run diagnose:orphan-media</code> を再実行
					</li>
					<li>
						<code>bun run build</code> で静的エクスポートを再生成
					</li>
				</ol>
			</footer>
		</div>
	);
}

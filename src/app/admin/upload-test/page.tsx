"use client";

import { useState } from "react";

export default function UploadTestPage() {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [uploadStatus, setUploadStatus] = useState<string>("");
	const [uploadResult, setUploadResult] = useState<{
		files?: Array<{ url: string; [key: string]: unknown }>;
		[key: string]: unknown;
	} | null>(null);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			setUploadStatus("");
			setUploadResult(null);
		}
	};

	const handleUpload = async () => {
		if (!selectedFile) {
			setUploadStatus("ファイルを選択してください");
			return;
		}

		setUploadStatus("アップロード中...");

		try {
			const formData = new FormData();
			formData.append("file", selectedFile);
			formData.append("type", "portfolio");

			console.log("Uploading file:", {
				name: selectedFile.name,
				size: selectedFile.size,
				type: selectedFile.type,
			});

			const response = await fetch("/api/admin/upload", {
				method: "POST",
				body: formData,
			});

			console.log("Response status:", response.status);

			if (response.ok) {
				const result = await response.json();
				console.log("Upload result:", result);
				setUploadResult(result);
				setUploadStatus("アップロード成功！");
			} else {
				const errorData = await response.json();
				console.error("Upload error:", errorData);
				setUploadStatus(
					`アップロードエラー: ${errorData.error || "不明なエラー"}`,
				);
			}
		} catch (error) {
			console.error("Upload failed:", error);
			setUploadStatus(
				`アップロード失敗: ${error instanceof Error ? error.message : "不明なエラー"}`,
			);
		}
	};

	return (
		<div className="min-h-screen bg-base text-main p-8">
			<div className="max-w-2xl mx-auto">
				<h1 className="text-3xl font-bold mb-8">画像アップロードテスト</h1>

				<div className="space-y-6">
					<div>
						<label className="block text-sm font-medium mb-2">
							画像ファイルを選択:
						</label>
						<input
							type="file"
							accept="image/*"
							onChange={handleFileSelect}
							className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
						/>
					</div>

					{selectedFile && (
						<div className="bg-gray-50 p-4 rounded-lg">
							<h3 className="font-medium mb-2">選択されたファイル:</h3>
							<p>名前: {selectedFile.name}</p>
							<p>サイズ: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
							<p>タイプ: {selectedFile.type}</p>
						</div>
					)}

					<button type="button"
						onClick={handleUpload}
						disabled={!selectedFile}
						className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
					>
						アップロード
					</button>

					{uploadStatus && (
						<div
							className={`p-4 rounded-lg ${
								uploadStatus.includes("成功")
									? "bg-green-100 text-green-800"
									: uploadStatus.includes("エラー") ||
											uploadStatus.includes("失敗")
										? "bg-red-100 text-red-800"
										: "bg-blue-100 text-blue-800"
							}`}
						>
							{uploadStatus}
						</div>
					)}

					{uploadResult && (
						<div className="bg-gray-50 p-4 rounded-lg">
							<h3 className="font-medium mb-2">アップロード結果:</h3>
							<pre className="text-sm overflow-auto">
								{JSON.stringify(uploadResult, null, 2)}
							</pre>

							{uploadResult.files &&
								uploadResult.files.length > 0 &&
								uploadResult.files[0].url && (
									<div className="mt-4">
										<h4 className="font-medium mb-2">
											アップロードされた画像:
										</h4>
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={uploadResult.files[0].url}
											alt="Uploaded"
											className="max-w-md max-h-64 object-contain border rounded"
										/>
										<p className="text-sm text-gray-600 mt-2">
											URL: {uploadResult.files[0].url}
										</p>
									</div>
								)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

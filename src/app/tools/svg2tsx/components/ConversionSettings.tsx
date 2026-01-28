"use client";

import type { ConversionSettings } from "../types";

interface ConversionSettingsProps {
	settings: ConversionSettings;
	onSettingsChange: (settings: ConversionSettings) => void;
}

export function ConversionSettingsPanel({
	settings,
	onSettingsChange,
}: ConversionSettingsProps) {
	const updateSetting = <K extends keyof ConversionSettings>(
		key: K,
		value: ConversionSettings[K],
	) => {
		onSettingsChange({ ...settings, [key]: value });
	};

	return (
		<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4">
			<h3 className="text-lg font-medium mb-4">変換設定</h3>

			<div className="space-y-6">
				{/* Basic Settings */}
				<div className="space-y-4">
					<h4 className="font-medium text-sm text-main/80">基本設定</h4>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-1">
								コンポーネント名
							</label>
							<input
								type="text"
								value={settings.componentName}
								onChange={(e) => updateSetting("componentName", e.target.value)}
								className="w-full p-2 rounded-lg bg-main/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
								placeholder="MyIcon"
								aria-label="コンポーネント名"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1">
								Props型名
							</label>
							<input
								type="text"
								value={settings.propsType}
								onChange={(e) => updateSetting("propsType", e.target.value)}
								className="w-full p-2 rounded-lg bg-main/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
								placeholder="IconProps"
								aria-label="Props型名"
							/>
						</div>
					</div>

					<div className="flex flex-wrap gap-4">
						<label className="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								checked={settings.includeComments}
								onChange={(e) =>
									updateSetting("includeComments", e.target.checked)
								}
								className="w-4 h-4"
							/>
							コメントを追加
						</label>
					</div>
				</div>

				{/* Optimization Settings */}
				<div className="space-y-4">
					<h4 className="font-medium text-sm text-main/80">最適化設定</h4>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<label className="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								checked={settings.removeUnnecessaryAttributes}
								onChange={(e) =>
									updateSetting("removeUnnecessaryAttributes", e.target.checked)
								}
								className="w-4 h-4"
							/>
							不要属性を削除
						</label>

						<label className="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								checked={settings.optimizePaths}
								onChange={(e) =>
									updateSetting("optimizePaths", e.target.checked)
								}
								className="w-4 h-4"
							/>
							パスを最適化
						</label>

						<label className="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								checked={settings.variableizeColors}
								onChange={(e) =>
									updateSetting("variableizeColors", e.target.checked)
								}
								className="w-4 h-4"
							/>
							色を変数化
						</label>

						<label className="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								checked={settings.variableizeSizes}
								onChange={(e) =>
									updateSetting("variableizeSizes", e.target.checked)
								}
								className="w-4 h-4"
							/>
							サイズを変数化
						</label>
					</div>
				</div>

				{/* Output Settings */}
				<div className="space-y-4">
					<h4 className="font-medium text-sm text-main/80">出力設定</h4>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-1">
								インデント
							</label>
							<select
								value={settings.indentSize}
								onChange={(e) =>
									updateSetting("indentSize", parseInt(e.target.value, 10))
								}
								className="w-full p-2 rounded-lg bg-main/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
							>
								<option value={2}>2スペース</option>
								<option value={4}>4スペース</option>
								<option value={8}>8スペース</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1">改行設定</label>
							<select
								value={settings.lineBreaks}
								onChange={(e) =>
									updateSetting("lineBreaks", e.target.value as "lf" | "crlf")
								}
								className="w-full p-2 rounded-lg bg-main/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
							>
								<option value="lf">LF (Unix)</option>
								<option value="crlf">CRLF (Windows)</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1">
								エクスポート形式
							</label>
							<select
								value={settings.exportType}
								onChange={(e) =>
									updateSetting(
										"exportType",
										e.target.value as "default" | "named",
									)
								}
								className="w-full p-2 rounded-lg bg-main/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
							>
								<option value="default">デフォルトエクスポート</option>
								<option value="named">名前付きエクスポート</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1">
								ファイル拡張子
							</label>
							<select
								value={settings.fileExtension}
								onChange={(e) =>
									updateSetting(
										"fileExtension",
										e.target.value as ConversionSettings["fileExtension"],
									)
								}
								className="w-full p-2 rounded-lg bg-main/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
							>
								<option value=".tsx">.tsx (TypeScript JSX)</option>
								<option value=".ts">.ts (TypeScript)</option>
								<option value=".jsx">.jsx (JavaScript JSX)</option>
								<option value=".js">.js (JavaScript)</option>
							</select>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

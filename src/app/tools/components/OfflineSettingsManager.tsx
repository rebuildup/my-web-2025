/**
 * Offline Settings Manager Component
 * Provides persistent settings management for tools with offline functionality
 */

"use client";

import { Download, RotateCcw, Save, Settings, Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import useOfflinePerformance from "@/hooks/useOfflinePerformance";
import AccessibleButton from "./AccessibleButton";

interface SettingsManagerProps<T> {
	toolName: string;
	defaultSettings: T;
	settings: T;
	onSettingsChange: (settings: T) => void;
	children: (props: {
		settings: T;
		updateSetting: <K extends keyof T>(key: K, value: T[K]) => void;
		resetSettings: () => void;
		exportSettings: () => void;
		importSettings: (file: File) => void;
	}) => React.ReactNode;
	showControls?: boolean;
}

export default function OfflineSettingsManager<
	T extends Record<string, unknown>,
>({
	toolName,
	defaultSettings,
	settings,
	onSettingsChange,
	children,
	showControls = true,
}: SettingsManagerProps<T>) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);

	const { saveSettings, loadSettings, isOnline } = useOfflinePerformance({
		toolName,
		enablePerformanceMonitoring: false,
		enableOfflineNotifications: false,
	});

	// Load settings on mount
	useEffect(() => {
		const savedSettings = loadSettings(defaultSettings);
		if (
			savedSettings &&
			JSON.stringify(savedSettings) !== JSON.stringify(settings)
		) {
			onSettingsChange(savedSettings);
		}
	}, [defaultSettings, loadSettings, onSettingsChange, settings]);

	// Auto-save settings when they change
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			if (JSON.stringify(settings) !== JSON.stringify(defaultSettings)) {
				const success = saveSettings(settings);
				if (success) {
					setLastSaved(new Date());
				}
			}
		}, 1000); // Debounce saves by 1 second

		return () => clearTimeout(timeoutId);
	}, [settings, defaultSettings, saveSettings]);

	// Update individual setting
	const updateSetting = useCallback(
		<K extends keyof T>(key: K, value: T[K]) => {
			const newSettings = { ...settings, [key]: value };
			onSettingsChange(newSettings);
		},
		[settings, onSettingsChange],
	);

	// Reset to default settings
	const resetSettings = useCallback(() => {
		onSettingsChange(defaultSettings);
		saveSettings(defaultSettings);
		setLastSaved(new Date());
	}, [defaultSettings, onSettingsChange, saveSettings]);

	// Export settings as JSON file
	const exportSettings = useCallback(() => {
		const dataStr = JSON.stringify(settings, null, 2);
		const dataBlob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(dataBlob);

		const link = document.createElement("a");
		link.href = url;
		link.download = `${toolName}-settings.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		URL.revokeObjectURL(url);
	}, [settings, toolName]);

	// Helper function to parse and validate imported settings
	const parseImportedSettings = useCallback(
		(content: string): T | null => {
			const importedSettings = JSON.parse(content) as T;

			// Validate imported settings have required keys
			const requiredKeys = Object.keys(defaultSettings);
			const importedKeys = Object.keys(importedSettings);
			const hasAllKeys = requiredKeys.every((key) =>
				importedKeys.includes(key),
			);

			if (hasAllKeys) {
				return importedSettings;
			}
			return null;
		},
		[defaultSettings],
	);

	// Import settings from JSON file
	const importSettings = useCallback(
		(file: File) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				let fileContent: string | null = null;
				if (e.target) {
					if (e.target.result) {
						if (typeof e.target.result === "string") {
							fileContent = e.target.result;
						}
					}
				}

				if (!fileContent) {
					console.error("Failed to import settings: invalid file content");
					alert(
						"設定ファイルの読み込みに失敗しました。ファイル形式を確認してください。",
					);
					return;
				}

				try {
					const importedSettings = parseImportedSettings(fileContent);
					if (importedSettings) {
						onSettingsChange(importedSettings);
						saveSettings(importedSettings);
						setLastSaved(new Date());
					} else {
						console.error(
							"Invalid settings file format: missing required keys",
						);
						alert("設定ファイルの形式が無効です。必要なキーが不足しています。");
					}
				} catch (error) {
					console.error("Failed to import settings:", error);
					alert(
						"設定ファイルの読み込みに失敗しました。ファイル形式を確認してください。",
					);
				}
			};
			reader.readAsText(file);
		},
		[onSettingsChange, saveSettings, parseImportedSettings],
	);

	// Handle file input for import
	const handleFileImport = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (file) {
				importSettings(file);
			}
			// Reset input value to allow importing the same file again
			event.target.value = "";
		},
		[importSettings],
	);

	// Manual save (for explicit user action)
	const manualSave = useCallback(() => {
		const success = saveSettings(settings);
		if (success) {
			setLastSaved(new Date());
		}
	}, [settings, saveSettings]);

	return (
		<div className="space-y-4">
			{/* Settings Controls */}
			{showControls && (
				<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center space-x-2">
							<Settings size={16} className="text-main" />
							<h3 className="neue-haas-grotesk-display text-sm text-main">
								Settings Manager
							</h3>
							{!isOnline && (
								<span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
									Offline
								</span>
							)}
						</div>
						<button
							type="button"
							onClick={() => setIsExpanded(!isExpanded)}
							className="text-xs text-accent hover:text-main focus:outline-none focus:ring-1 focus:ring-accent"
							aria-label="Toggle settings controls"
						>
							{isExpanded ? "Hide" : "Show"} Controls
						</button>
					</div>

					{isExpanded && (
						<div className="space-y-4">
							{/* Action Buttons */}
							<div className="flex flex-wrap gap-2">
								<AccessibleButton
									onClick={manualSave}
									variant="primary"
									size="sm"
									shortcut="Ctrl+S"
									announceOnClick="設定を保存しました"
								>
									<Save size={14} />
									Save
								</AccessibleButton>

								<AccessibleButton
									onClick={resetSettings}
									variant="secondary"
									size="sm"
									announceOnClick="設定をリセットしました"
								>
									<RotateCcw size={14} />
									Reset
								</AccessibleButton>

								<AccessibleButton
									onClick={exportSettings}
									variant="secondary"
									size="sm"
									announceOnClick="設定をエクスポートしました"
								>
									<Download size={14} />
									Export
								</AccessibleButton>

								<label className="inline-flex">
									<span className="inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg bg-main/10 text-main hover:bg-main/20 focus:ring-accent focus:ring-offset-base px-3 py-1.5 text-sm min-h-[32px] cursor-pointer">
										<Upload size={14} />
										Import
									</span>
									<input
										type="file"
										accept=".json"
										onChange={handleFileImport}
										className="sr-only"
										aria-label="Import settings file"
									/>
								</label>
							</div>

							{/* Status Information */}
							<div className="text-xs text-main space-y-1">
								<div className="flex justify-between">
									<span>Auto-save:</span>
									<span className="text-green-600">Enabled</span>
								</div>
								<div className="flex justify-between">
									<span>Storage:</span>
									<span className="text-accent">Local Storage</span>
								</div>
								{lastSaved && (
									<div className="flex justify-between">
										<span>Last saved:</span>
										<span className="text-accent">
											{lastSaved.toLocaleTimeString()}
										</span>
									</div>
								)}
							</div>

							{/* Settings Info */}
							<div className="pt-2 border-t border-main/20">
								<h4 className="text-xs font-medium mb-2">
									Settings Information
								</h4>
								<ul className="text-xs space-y-1 text-main">
									<li>• 設定は自動的にローカルストレージに保存されます</li>
									<li>• オフラインでも設定の変更・保存が可能です</li>
									<li>• JSON形式でエクスポート・インポートできます</li>
									<li>• ブラウザのデータを削除すると設定も失われます</li>
								</ul>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Settings Content */}
			{children({
				settings,
				updateSetting,
				resetSettings,
				exportSettings,
				importSettings,
			})}
		</div>
	);
}

// Keyboard shortcut handler for manual save
if (typeof window !== "undefined") {
	document.addEventListener("keydown", (event) => {
		if (event.ctrlKey && event.key === "s") {
			event.preventDefault();
			// Trigger manual save event
			const saveEvent = new CustomEvent("manualSave");
			document.dispatchEvent(saveEvent);
		}
	});
}

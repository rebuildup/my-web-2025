"use client";

import { CountSettings, DisplaySettings } from "../types";

interface SettingsPanelProps {
  settings: CountSettings;
  displaySettings: DisplaySettings;
  onSettingsChange: (settings: CountSettings) => void;
  onDisplaySettingsChange: (settings: DisplaySettings) => void;
}

export default function SettingsPanel({
  settings,
  displaySettings,
  onSettingsChange,
  onDisplaySettingsChange,
}: SettingsPanelProps) {
  const handleCountSettingChange = (
    key: keyof CountSettings,
    value: boolean | string
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleDisplaySettingChange = (
    key: keyof DisplaySettings,
    value: boolean | string
  ) => {
    onDisplaySettingsChange({ ...displaySettings, [key]: value });
  };

  return (
    <div className="bg-base border border-foreground p-4 space-y-6">
      <h3 className="font-medium text-foreground">設定</h3>

      {/* Count Settings */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground">カウント設定</h4>
        <div className="space-y-2">
          <CheckboxSetting
            id="include-spaces"
            label="スペースを含める"
            checked={settings.includeSpaces}
            onChange={(checked) =>
              handleCountSettingChange("includeSpaces", checked)
            }
          />
          <CheckboxSetting
            id="include-newlines"
            label="改行を含める"
            checked={settings.includeNewlines}
            onChange={(checked) =>
              handleCountSettingChange("includeNewlines", checked)
            }
          />
          <CheckboxSetting
            id="include-whitespace"
            label="すべての空白を含める"
            checked={settings.includeWhitespace}
            onChange={(checked) =>
              handleCountSettingChange("includeWhitespace", checked)
            }
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="count-method"
            className="block text-sm text-foreground"
          >
            カウント方法
          </label>
          <select
            id="count-method"
            value={settings.countMethod}
            onChange={(e) =>
              handleCountSettingChange("countMethod", e.target.value)
            }
            className="w-full p-2 bg-background border border-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">すべての文字</option>
            <option value="visible">表示可能文字のみ</option>
            <option value="printable">印刷可能文字のみ</option>
          </select>
        </div>
      </div>

      {/* Display Settings */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground">表示設定</h4>
        <div className="space-y-2">
          <CheckboxSetting
            id="show-basic-stats"
            label="基本統計を表示"
            checked={displaySettings.showBasicStats}
            onChange={(checked) =>
              handleDisplaySettingChange("showBasicStats", checked)
            }
          />
          <CheckboxSetting
            id="show-detailed-stats"
            label="詳細統計を表示"
            checked={displaySettings.showDetailedStats}
            onChange={(checked) =>
              handleDisplaySettingChange("showDetailedStats", checked)
            }
          />
          <CheckboxSetting
            id="show-character-types"
            label="文字種別を表示"
            checked={displaySettings.showCharacterTypes}
            onChange={(checked) =>
              handleDisplaySettingChange("showCharacterTypes", checked)
            }
          />
          <CheckboxSetting
            id="show-structure-stats"
            label="構造統計を表示"
            checked={displaySettings.showStructureStats}
            onChange={(checked) =>
              handleDisplaySettingChange("showStructureStats", checked)
            }
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="font-size" className="block text-sm text-foreground">
            フォントサイズ
          </label>
          <select
            id="font-size"
            value={displaySettings.fontSize}
            onChange={(e) =>
              handleDisplaySettingChange("fontSize", e.target.value)
            }
            className="w-full p-2 bg-background border border-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="small">小</option>
            <option value="medium">中</option>
            <option value="large">大</option>
          </select>
        </div>
      </div>
    </div>
  );
}

interface CheckboxSettingProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function CheckboxSetting({
  id,
  label,
  checked,
  onChange,
}: CheckboxSettingProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-primary bg-background border border-foreground focus:ring-2 focus:ring-primary"
      />
      <label htmlFor={id} className="text-sm text-foreground cursor-pointer">
        {label}
      </label>
    </div>
  );
}

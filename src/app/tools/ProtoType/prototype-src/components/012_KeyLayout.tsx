import { useState, useLayoutEffect } from "react";
import { saveToCache, loadFromCache, updateSetting } from "../SiteInterface";

export const keyLayouts = [
  {
    name: "QWERTY",
    layout: [
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "^", "\\"],
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "@", "["],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";", ":", "]"],
      ["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "\\"],
    ],
  },
  {
    name: "Dvorak",
    layout: [
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "[", "]", "\\"],
      ["`", ",", ".", "P", "Y", "F", "G", "C", "R", "L", "/", "="],
      ["A", "O", "E", "U", "I", "D", "H", "T", "N", "S", "-", "]"],
      [";", "Q", "J", "K", "X", "B", "M", "W", "V", "Z", "\\"],
    ],
  },
  {
    name: "大西配列",
    layout: [
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "/", "^", "\\"],
      ["Q", "L", "U", ",", ".", "F", "W", "R", "Y", "P", "@", "["],
      ["E", "I", "A", "O", "-", "K", "T", "N", "S", "H", ":", "]"],
      ["Z", "X", "C", "V", ";", "G", "D", "M", "J", "B", "\\"],
    ],
  },
  {
    name: "Colemak",
    layout: [
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "\\"],
      ["Q", "W", "F", "P", "G", "J", "L", "U", "Y", ";", "[", "]"],
      ["A", "R", "S", "T", "D", "H", "N", "E", "I", "O", "'", "]"],
      ["Z", "X", "C", "V", "B", "K", "M", ".", ",", "/", "\\"],
    ],
  },
  {
    name: "Maltron",
    layout: [
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "^", "^", "\\"],
      ["Q", "P", "Y", "C", "B", "V", "M", "U", "Z", "L", "@", "["],
      ["A", "N", "I", "S", "F", "D", "T", "H", "O", "R", ":", "]"],
      [",", ".", "J", "G", "B", ".", "W", "K", "-", "X", "\\"],
    ],
  },
  {
    name: "Eucalyn",
    layout: [
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "^", "\\"],
      ["Q", "W", ",", ".", ";", "M", "R", "D", "Y", "P", "@", "["],
      ["A", "O", "E", "I", "U", "G", "T", "K", "S", "N", ":", "]"],
      ["Z", "X", "C", "V", "F", "B", "H", "J", "L", "/", "\\"],
    ],
  },
];

export default function KeyLayoutSelector() {
  const cachedLayout = loadFromCache<string>("keyLayout", keyLayouts[0].name);
  const [selectedLayout, setSelectedLayout] = useState(cachedLayout);

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-keylayout", cachedLayout);
  }, [cachedLayout]);

  const changeLayout = (layout: string) => {
    setSelectedLayout(layout);
    document.documentElement.setAttribute("data-keylayout", layout);
    saveToCache("keyLayout", layout);
    updateSetting("keyLayout", layout);
  };

  return (
    <div style={{ zIndex: 1 }}>
      <h1>キー配列</h1>
      <label className="selectbox-5">
        <select
          value={selectedLayout}
          onChange={(e) => changeLayout(e.target.value)}
        >
          {keyLayouts.map((layout) => (
            <option key={layout.name} value={layout.name}>
              {layout.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}


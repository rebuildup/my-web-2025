import React, { useState } from "react";
import { updateSetting } from "../SiteInterface";

export const themes = [
  {
    name: "Dark",
    colors: {
      "--MainBG": "#000000",
      "--MainColor": "#ffffff",
      "--MainAccent": "#ff0000",
      "--SecondAccent": "#ffffff",
    },
  },
  {
    name: "Grey",
    colors: {
      "--MainBG": "#212121",
      "--MainColor": "#eeeeee",
      "--MainAccent": "#007bff",
      "--SecondAccent": "#ff4081",
    },
  },
  {
    name: "Dark Bule",
    colors: {
      "--MainBG": "#000011",
      "--MainColor": "#eeeeee",
      "--MainAccent": "#EDE84C",
      "--SecondAccent": "#0000ee",
    },
  },
  {
    name: "Light",
    colors: {
      "--MainBG": "#eeeeee",
      "--MainColor": "#333333",
      "--MainAccent": "#ff0000",
      "--SecondAccent": "#0000ee",
    },
  },
  {
    name: "SoftLight",
    colors: {
      "--MainBG": "#333333",
      "--MainColor": "#F5F5F5",
      "--MainAccent": "#FF6600",
      "--SecondAccent": "#33CC99",
    },
  },
  {
    name: "Energy",
    colors: {
      "--MainBG": "#000000",
      "--MainColor": "#fefefe",
      "--MainAccent": "#27ff25",
      "--SecondAccent": "#ffffff",
    },
  },
  {
    name: "tropical",
    colors: {
      "--MainBG": "#003366",
      "--MainColor": "#FFFFFF",
      "--MainAccent": "#FF9900",
      "--SecondAccent": "#00CC99",
    },
  },
  {
    name: "white",
    colors: {
      "--MainBG": "#FFFFFF",
      "--MainColor": "#1A1A1A",
      "--MainAccent": "#00AAFF",
      "--SecondAccent": "#FF6600",
    },
  },
  {
    name: "modern",
    colors: {
      "--MainBG": "#333333",
      "--MainColor": "#FFFFFF",
      "--MainAccent": "#FF3366",
      "--SecondAccent": "#33CCCC",
    },
  },
  {
    name: "material",
    colors: {
      "--MainBG": "#EEEEEE",
      "--MainColor": "#212121",
      "--MainAccent": "#BB86FC",
      "--SecondAccent": "#03DAC5",
    },
  },
  {
    name: "spring",
    colors: {
      "--MainBG": "#333333",
      "--MainColor": "#F9F9F9",
      "--MainAccent": "#FF6699",
      "--SecondAccent": "#99CC33",
    },
  },
  {
    name: "autumn",
    colors: {
      "--MainBG": "#FFFFFF",
      "--MainColor": "#663300",
      "--MainAccent": "#FF6600",
      "--SecondAccent": "#FFCC00",
    },
  },
  {
    name: "winter",
    colors: {
      "--MainBG": "#FFFFFF",
      "--MainColor": "#003366",
      "--MainAccent": "#66CCFF",
      "--SecondAccent": "#CCCCCC",
    },
  },
  {
    name: "pastel",
    colors: {
      "--MainBG": "#333333",
      "--MainColor": "#F0F0F0",
      "--MainAccent": "#FFB6C1",
      "--SecondAccent": "#B0E0E6",
    },
  },
  {
    name: "mono",
    colors: {
      "--MainBG": "#FFFFFF",
      "--MainColor": "#001133",
      "--MainAccent": "#0066CC",
      "--SecondAccent": "#99CCFF",
    },
  },
  {
    name: "monogr",
    colors: {
      "--MainBG": "#FFFFFF",
      "--MainColor": "#003300",
      "--MainAccent": "#00CC66",
      "--SecondAccent": "#99FFCC",
    },
  },
  {
    name: "china",
    colors: {
      "--MainBG": "#5b0619",
      "--MainColor": "#eeeeee",
      "--MainAccent": "#edd862",
      "--SecondAccent": "#eeeeee",
    },
  },
  {
    name: "moon",
    colors: {
      "--MainBG": "#0a0a3e",
      "--MainColor": "#eeeeee",
      "--MainAccent": "#ecd867",
      "--SecondAccent": "#eeeeee",
    },
  },
  {
    name: "red",
    colors: {
      "--MainBG": "#bf1e2e",
      "--MainColor": "#eeeeee",
      "--MainAccent": "#eeeeee",
      "--SecondAccent": "#eeeeee",
    },
  },

  {
    name: "white red",
    colors: {
      "--MainBG": "#eeeeee",
      "--MainColor": "#bf1e2e",
      "--MainAccent": "#bf1e2e",
      "--SecondAccent": "#bf1e2e",
    },
  },
];

const ColorPalette: React.FC = () => {
  const [, setCurrentTheme] = useState(themes[0].name);

  const applyTheme = (theme: (typeof themes)[0]) => {
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    setCurrentTheme(theme.name);
    updateSetting("colorTheme", {
      name: theme.name,
      colors: {
        MainBG: theme.colors["--MainBG"],
        MainColor: theme.colors["--MainColor"],
        MainAccent: theme.colors["--MainAccent"],
        SecondAccent: theme.colors["--SecondAccent"],
      },
    });
  };

  return (
    <div className="p-4" style={{ zIndex: 1 }}>
      <h1>カラーテーマ</h1>
      <div
        style={{
          overflowX: "auto",
          overflowY: "hidden",
          scrollbarWidth: "thin",
          WebkitOverflowScrolling: "touch",
          paddingBottom: "10px",
          maxWidth: "100%",
        }}
      >
        <div
          className="flex gap-4"
          style={{
            display: "flex",
            flexWrap: "nowrap",
            minWidth: "min-content",
          }}
        >
          {themes.map((theme) => (
            <div key={theme.name} style={{ flexShrink: 0 }}>
              <button onClick={() => applyTheme(theme)}>
                <svg width="100" height="100" viewBox="-100 -100 200 200">
                  <filter id="invert">
                    <feColorMatrix
                      values="-1 0 0 0 1 
                                0 -1 0 0 1 
                                0 0 -1 0 1 
                                0 0 0 1 0"
                    />
                  </filter>

                  <circle
                    cx="0"
                    cy="0"
                    r="100"
                    fill={theme.colors["--MainBG"]}
                    strokeWidth="2"
                    stroke="transparent"
                  />

                  <circle
                    cx="0"
                    cy="0"
                    r="100"
                    fill="none"
                    stroke={theme.colors["--MainBG"]}
                    strokeWidth="2"
                    filter="url(#invert)"
                  />

                  <circle cx="-30" cy="-20" r="40" fill={theme.colors["--MainColor"]} />
                  <circle cx="40" cy="10" r="25" fill={theme.colors["--MainAccent"]} />
                  <circle cx="0" cy="45" r="15" fill={theme.colors["--SecondAccent"]} />
                </svg>
                <br />
                <span>{theme.name}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPalette;

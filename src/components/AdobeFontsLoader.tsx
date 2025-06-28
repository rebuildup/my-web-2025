"use client";

import Script from "next/script";

/**
 * Loads the Adobe Fonts script early in the page lifecycle and triggers `Typekit.load` once the
 * kit has finished downloading. Extracted to its own Client Component so that we can use the
 * `onLoad` event handler without converting the entire root layout to a Client Component.
 */
export function AdobeFontsLoader() {
  return (
    <Script
      strategy="lazyOnload"
      src="https://use.typekit.net/[YOUR-KIT-ID].js"
      onLoad={() => {
        try {
          // `Typekit` is injected by the external script.
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          Typekit.load({ async: true });
        } catch (e) {
          console.error("Error loading Adobe Fonts:", e);
        }
      }}
    />
  );
}

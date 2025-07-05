# 共通スタイル設定 (Style Guide)

## デザインテーマ

- メインカラー：原色の青 (#0000ff)
- ベースカラー：ダークグレー (#222222)
- 背景：単色 ベースカラー
- 1:1.618 比率：基本的な比率
- 装飾：機能のみ強調。影、角丸、グラデーション完全廃止
- ファビコン：青い円形 SVG アイコン(`public\favicons`)
- フォント：Adobe Fonts, Google Fonts
- 基本はグリッドレイアウト(グリッドシステム)

## フォント

#### Adobe Fonts

```hmtl
<script>
  (function(d) {
    var config = {
      kitId: 'blm5pmr',
      scriptTimeout: 3000,
      async: true
    },
    h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\bwf-loading\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
  })(document);
</script>
```

- Neue Haas Grotesk Display：本サイトのテーマフォントとして使用 見出しなどは基本的に太字イタリックのこのフォント

```css
.neue-haas-grotesk-display {
  font-family: neue-haas-grotesk-display, sans-serif;
  font-weight: 700;
  font-style: italic;
}
```

- Zen Kaku Gothic New：アクセントとして稀に使用する 日本語見出し用

```css
.zen-kaku-gothic-new {
  font-family: zen-kaku-gothic-new, sans-serif;
  font-weight: 700;
  font-style: normal;
}
```

#### Google Fonts

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&family=Shippori+Antique+B1&display=swap"
  rel="stylesheet"
/>
```

- Noto Sans JP：テキスト用の基本フォントとして使用 Italic と細字で使用

```css
// <weight>: Use a value from 100 to 900
// <uniquifier>: Use a unique and descriptive class name
.noto-sans-jp- <uniquifier > {
  font-family: "Noto Sans JP", sans-serif;
  font-optical-sizing: auto;
  font-weight: <weight>;
  font-style: normal;
}
```

- Shippori Antique：日本語を強調したい部分に使用

```css
.shippori-antique-b1-regular {
  font-family: "Shippori Antique B1", sans-serif;
  font-weight: 400;
  font-style: normal;
}
```

export interface HistoryEntry {
	date?: string;
	title?: string;
	description?: string;
	muted?: boolean;
	separator?: boolean;
}

export interface SkillItem {
	name: string;
	slug: string;
	bg: string;
}

export const historyData: HistoryEntry[] = [
	{
		date: "2007.10",
		title: "誕生",
		description: "生まれました。覚えていません",
	},
	{
		date: "2014.04",
		title: "山口市立小学校入学",
		description: "小学校に入学しました",
	},
	{
		date: "2020.04",
		title: "発明クラブ",
		description:
			"発明クラブなどというもので、木工や電子工作などしていた記憶があります",
		muted: true,
	},
	{
		date: "2020.03",
		title: "山口市立小学校卒業",
		description: "小学校を卒業",
	},

	{
		date: "2020.04",
		title: "山口市立中学校入学",
	},
	{
		date: "2023~",
		title: "HTML/CSS/JSを習得",
		description: "とほほのWWW入門を読んで試しました",
		muted: true,
	},
	{
		date: "2023~",
		title: "アイビスペイントで絵描き",
		description: "一時期ハマって絵を描いていました",
		muted: true,
	},
	{
		date: "2023~",
		title: "Canvaで映像制作",
		description: "Canvaのスライドショーで文字PVを作った気がします。",
		muted: true,
	},
	{
		date: "2023~",
		title: "U-16 プログラミングコンテスト2023 アイデア賞",
		description: "Scratchでゲームつくりました。掛け算ゲーム",
	},
	{ separator: true },
	{
		date: "2023.04",
		title: "宇部工業高等専門学校入学",
		description: "制御情報工学科に入学しました",
	},
	{
		date: "2023~",
		title: "AviutlとStudioOneでボカロ曲の制作",
		description: "一時期ハマって作ってました。",
		muted: true,
	},
	{
		date: "2023.08",
		title: "ノートPCを購入",
		description:
			"ドスパラのゲーミングノートを自費？(祖父母からの入学祝10万円+アルバイト代数万円)で買いました",
		muted: true,
	},
	{
		date: "2023.08",
		title: "Cubase Elementsを購入",
		description:
			"DTMをしていたので、その流れで買いました。当時はバージョン12だった。ちょうどその後13が出て無料アップグレード出来ました。やったね。",
		muted: true,
	},
	{
		date: "2023.11",
		title: "U-16 プログラミングコンテスト2024 技術賞・企業賞",
		description: "Unityで音ゲーを作りました",
	},
	{
		date: "2023.12",
		title: "AdobeCCを購入",
		description: "何を血迷ったかAdobeを買いました。2万円とかだったかな？",
		muted: true,
	},
	{
		date: "2024.02",
		title: "samuidoとして活動を開始",
		description: "最初は自作音ゲーのプレイ映像とか投稿していました。",
		muted: true,
	},
	{
		date: "2024.03",
		title: "中国地区コンピュータフェスティバル ゲーム部門1位",
		description:
			"U16プロコンで作ったゲームを改善して出しました。投票はユーザー投票です。なにか他に企業賞ももらった気がします",
	},
	{
		date: "2024.08",
		title: "HUIONのペンタブを購入",
		description:
			"Amazonの中古で4000円とか。大きければいいと思っていたので多少大きめのものを買いましたが、別に大きくてもメリットありません。",
		muted: true,
	},
	{
		date: "2024.08",
		title: "ドキュメントエディターのWebアプリを開発",
		description:
			"おそらくここでWeb開発を始めています。なぜか最初flaskで作ろうとして、苦戦するってことをしました。U-22プロコンに応募したけど落選しました。",
		muted: true,
	},
	{
		date: "2024.10",
		title: "オーディオインターフェースを購入",
		description:
			"DTMのため購入しました。Behringer UMC202HDです。今は便利なガジェットと化しています。",
		muted: true,
	},

	{
		date: "2024.09",
		title: "ポートフォリオサイト第1版を公開",
		description:
			"ポートフォリオサイトを作りました。\nそのときにこのサイトのドメインを取得してますね。",
		muted: true,
	},
	{
		date: "2024.10",
		title: "全国高専プロコン 奈良大会",
		description:
			"地球温暖化をICTで解決するというテーマで、コンピュータ部の先輩方とCO2測定をデータ化する教育教材を制作しました。受賞ならず。私はUI担当でした。(開発はしてない...)",
		muted: true,
	},
	{
		date: "2024.12",
		title: "Aulymoを公開",
		description:
			"Aulymoを公開しました。初めて1000円ほど売れたときは驚きました。",
		muted: true,
	},
	{
		date: "2025.01",
		title: "Stretchを公開",
		description:
			"初めてXが伸びて驚きました。一回伸びてからハードルがぐっと下がった気がする。",
		muted: true,
	},
	{
		date: "2025.02",
		title: "Xの映像垢を作成",
		description:
			"Aeのプラグイン開発と映像制作が一緒になって混雑していたので分野でざっくりと分けました。",
		muted: true,
	},
	{
		date: "2025.02",
		title: "Discordサーバーを作成",
		description:
			"しばらく他の方のサーバーにお邪魔していたのですが、私の求めている実益重視のコミュニティというものが無かったので、参加や共有のハードルを極限まで下げたサーバーを作成しました。実働は5~6人程度なのですが、なんだかんだ人は60人くらいいるので気長に続けていくつもりです。",
		muted: true,
	},
	{
		date: "2025.03",
		title: "映像制作依頼",
		description:
			"このくらいで初めて映像制作の依頼がきて、いくらかお金をもらいながらMVの制作などしだしました。",
		muted: true,
	},
	{
		date: "2025.04",
		title: "コンピュータ部部長",
		description:
			"同学年の部員がいつの間にか消えていたので、消去法のようなかたちで部長になりました。何をやらかすかビビってましたが、先輩方がサポートしてくれたのでなんとかなりました。",
		muted: true,
	},

	{
		date: "2025.10",
		title: "全国高専プロコン 米子大会",
		description:
			"スマホアプリで特定空間に向かってノイズキャンセリングをするというものを作りました。途中の段階で物理的に実現不可能かと思われましたが、なんとか形にしてくれた先輩には感謝しかありません。残念ながら受賞ならず。私はスマホアプリのフロント全般を担当しました。",
		muted: true,
	},
	{
		date: "2025.11",
		title: "宇部高専祭2025 公式Webサイト開発",
		description:
			"高専祭実行委員の方から声がかかって、制作しました。仕事?としてウェブサイトをつくるのは初めてでしたが、満足のいくものが作れました。",
		muted: true,
	},
	{
		date: "2026.03",
		title: "コンフェス2026 公式サイト 制作",
		description:
			"コンフェスは中国地区高専内で幹事校をローテーションしているのですが、それがたまたま宇部高専だったので、公式サイトを作成しました。地味に実行委員長も努めました。(挨拶くらいしかしてないですが。)",
		muted: true,
	},
	{
		date: "today",
		title: "宇部工業高等専門学校在学中",
		description: "在学中です",
	},
	{
		date: "2028.03",
		title: "宇部工業高等専門学校卒業見込み",
		description: "就職するつもりです",
	},
];

export const skillRows: SkillItem[][] = [
	[
		{ name: "AfterEffects", slug: "adobeaftereffects", bg: "#00005b" },
		{ name: "Unity", slug: "unity", bg: "#242938" },
		{ name: "Premiere", slug: "adobepremierepro", bg: "#00005b" },
		{ name: "AndroidStudio", slug: "androidstudio", bg: "#f4f2ed" },
		{ name: "React", slug: "react", bg: "#242938" },
		{ name: "Bash", slug: "gnubash", bg: "#242938" },
		{ name: "Blender", slug: "blender", bg: "#242938" },
		{ name: "Bun", slug: "bun", bg: "#f4f2ed" },
		{ name: "C", slug: "c", bg: "#394aab" },
		{ name: "CloudFlare", slug: "cloudflare", bg: "#f4f2ed" },
		{ name: "C++", slug: "cplusplus", bg: "#00599c" },
		{ name: "C#", slug: "csharp", bg: "#953cad" },
	],
	[
		{ name: "CSS", slug: "css3", bg: "#0277bd" },
		{ name: "Debian", slug: "debian", bg: "#242938" },
		{ name: "dotnet", slug: "dotnet", bg: "#512bd4" },
		{ name: "Figma", slug: "figma", bg: "#242938" },
		{ name: "GCP", slug: "googlecloud", bg: "#f4f2ed" },
		{ name: "Git", slug: "git", bg: "#f03c2e" },
		{ name: "Github", slug: "github", bg: "#242938" },
		{ name: "Go", slug: "go", bg: "#00b4e0" },
		{ name: "Gradle", slug: "gradle", bg: "#f4f2ed" },
		{ name: "HTML", slug: "html5", bg: "#e14e1d" },
		{ name: "Illustrator", slug: "adobeillustrator", bg: "#300" },
		{ name: "AdobeXD", slug: "adobexd", bg: "#470137" },
	],
	[
		{ name: "JavaScript", slug: "javascript", bg: "#f0db4f" },
		{ name: "Linux", slug: "linux", bg: "#f4f2ed" },
		{ name: "Markdown", slug: "markdown", bg: "#f4f2ed" },
		{ name: "Nextjs", slug: "nextdotjs", bg: "#f4f2ed" },
		{ name: "Nodejs", slug: "nodedotjs", bg: "#f4f2ed" },
		{ name: "Notion", slug: "notion", bg: "#242938" },
		{ name: "npm", slug: "npm", bg: "#cb3837" },
		{ name: "p5js", slug: "p5dotjs", bg: "#ed225d" },
		{ name: "Photoshop", slug: "adobephotoshop", bg: "#001e36" },
		{ name: "pnpm", slug: "pnpm", bg: "#f69220" },
		{ name: "powershell", slug: "powershell", bg: "#242938" },
		{ name: "Python", slug: "python", bg: "#f4f2ed" },
	],
	[
		{ name: "Rust", slug: "rust", bg: "#e43717" },
		{ name: "sass", slug: "sass", bg: "#cd6799" },
		{ name: "SQLite", slug: "sqlite", bg: "#003b57" },
		{ name: "Supabase", slug: "supabase", bg: "#242938" },
		{ name: "Swift", slug: "swift", bg: "#f05138" },
		{ name: "tailwind css", slug: "tailwindcss", bg: "#f4f2ed" },
		{ name: "TypeScript", slug: "typescript", bg: "#007acc" },
		{ name: "ubuntu", slug: "ubuntu", bg: "#e95420" },
		{ name: "vercel", slug: "vercel", bg: "#f4f2ed" },
		{ name: "visualstudio", slug: "visualstudio", bg: "#f4f2ed" },
		{ name: "vite", slug: "vite", bg: "#f4f2ed" },
		{ name: "vscode", slug: "visualstudiocode", bg: "#f4f2ed" },
	],
];

const _allSkills = skillRows.flat();

export const skillIconIds = [
	"ae",
	"unity",
	"pr",
	"androidstudio",
	"react",
	"bash",
	"blender",
	"bun",
	"c",
	"cloudflare",
	"cpp",
	"cs",
	"css",
	"debian",
	"dotnet",
	"figma",
	"gcp",
	"git",
	"github",
	"go",
	"gradle",
	"html",
	"ai",
	"xd",
	"js",
	"linux",
	"md",
	"nextjs",
	"nodejs",
	"notion",
	"npm",
	"p5js",
	"ps",
	"pnpm",
	"powershell",
	"py",
	"rust",
	"sass",
	"sqlite",
	"supabase",
	"swift",
	"tailwind",
	"ts",
	"ubuntu",
	"vercel",
	"visualstudio",
	"vite",
	"vscode",
].join(",");

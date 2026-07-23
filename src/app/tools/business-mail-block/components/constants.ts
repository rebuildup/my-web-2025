import type { MailBlock, MailTemplate } from "./types";

// Predefined mail blocks with enhanced metadata
export const MAIL_BLOCKS: MailBlock[] = [
	// Greeting blocks
	{
		id: "greeting-first",
		category: "greeting",
		title: "初回挨拶",
		content: "はじめまして、{company}の{name}です.",
		variables: ["company", "name"],
		formality: "formal",
		tags: ["初回", "挨拶", "自己紹介"],
	},
	{
		id: "greeting-regular",
		category: "greeting",
		title: "継続挨拶",
		content: "いつもお世話になっております.{company}の{name}です.",
		variables: ["company", "name"],
		formality: "formal",
		tags: ["継続", "挨拶", "定型"],
	},
	{
		id: "greeting-seasonal",
		category: "greeting",
		title: "季節挨拶",
		content: "暑い日が続いておりますが、いかがお過ごしでしょうか.",
		formality: "formal",
		tags: ["季節", "挨拶", "気遣い"],
	},
	{
		id: "greeting-morning",
		category: "greeting",
		title: "朝の挨拶",
		content: "おはようございます.{company}の{name}です.",
		variables: ["company", "name"],
		formality: "neutral",
		tags: ["朝", "挨拶", "時間"],
	},
	{
		id: "greeting-urgent",
		category: "greeting",
		title: "緊急時挨拶",
		content: "急なご連絡で恐縮です.{company}の{name}です.",
		variables: ["company", "name"],
		formality: "formal",
		tags: ["緊急", "挨拶", "謝罪"],
	},

	// Body blocks
	{
		id: "body-request",
		category: "body",
		title: "依頼",
		content: "つきましては、{content}についてご相談させていただきたく存じます.",
		variables: ["content"],
		formality: "formal",
		tags: ["依頼", "相談", "お願い"],
	},
	{
		id: "body-confirm",
		category: "body",
		title: "確認",
		content: "ご多忙の中恐縮ですが、{content}についてご確認をお願いいたします.",
		variables: ["content"],
		formality: "formal",
		tags: ["確認", "お願い", "謝罪"],
	},
	{
		id: "body-report",
		category: "body",
		title: "報告",
		content: "この度、{content}についてご報告させていただきます.",
		variables: ["content"],
		formality: "formal",
		tags: ["報告", "連絡", "情報"],
	},
	{
		id: "body-apology",
		category: "body",
		title: "謝罪",
		content: "{content}につきまして、心よりお詫び申し上げます.",
		variables: ["content"],
		formality: "formal",
		tags: ["謝罪", "お詫び", "反省"],
	},
	{
		id: "body-thanks",
		category: "body",
		title: "感謝",
		content: "{content}につきまして、心より感謝申し上げます.",
		variables: ["content"],
		formality: "formal",
		tags: ["感謝", "お礼", "謝意"],
	},
	{
		id: "body-schedule",
		category: "body",
		title: "日程調整",
		content: "{date}の{time}からお時間をいただけますでしょうか.",
		variables: ["date", "time"],
		formality: "formal",
		tags: ["日程", "調整", "時間"],
	},

	// Closing blocks
	{
		id: "closing-reply",
		category: "closing",
		title: "返信依頼",
		content: "ご検討のほど、よろしくお願いいたします.",
		formality: "formal",
		tags: ["返信", "検討", "お願い"],
	},
	{
		id: "closing-contact",
		category: "closing",
		title: "連絡依頼",
		content: "ご不明な点がございましたら、お気軽にお声がけください.",
		formality: "formal",
		tags: ["連絡", "質問", "サポート"],
	},
	{
		id: "closing-cooperation",
		category: "closing",
		title: "協力依頼",
		content: "ご協力のほど、よろしくお願いいたします.",
		formality: "formal",
		tags: ["協力", "お願い", "支援"],
	},
	{
		id: "closing-urgent",
		category: "closing",
		title: "急ぎの締め",
		content: "お忙しい中恐縮ですが、お急ぎでご対応いただけますと幸いです.",
		formality: "formal",
		tags: ["急ぎ", "緊急", "謝罪"],
	},
	{
		id: "closing-future",
		category: "closing",
		title: "今後の関係",
		content: "今後ともどうぞよろしくお願いいたします.",
		formality: "formal",
		tags: ["今後", "関係", "継続"],
	},

	// Signature blocks
	{
		id: "signature-basic",
		category: "signature",
		title: "基本署名",
		content: "{company}\n{department}\n{name}\nTEL: {phone}\nEmail: {email}",
		variables: ["company", "department", "name", "phone", "email"],
		formality: "formal",
		tags: ["基本", "連絡先", "会社"],
	},
	{
		id: "signature-detailed",
		category: "signature",
		title: "詳細署名",
		content:
			"{company}\n{department} {position}\n{name}\n〒{zipcode} {address}\nTEL: {phone} / FAX: {fax}\nEmail: {email}\nWebsite: {website}",
		variables: [
			"company",
			"department",
			"position",
			"name",
			"zipcode",
			"address",
			"phone",
			"fax",
			"email",
			"website",
		],
		formality: "formal",
		tags: ["詳細", "住所", "連絡先"],
	},
	{
		id: "signature-simple",
		category: "signature",
		title: "シンプル署名",
		content: "{name}\n{email}",
		variables: ["name", "email"],
		formality: "casual",
		tags: ["シンプル", "最小限", "カジュアル"],
	},
];

// Helper to safely get a predefined block without non-null assertions
export const getMailBlockById = (id: string): MailBlock => {
	const found = MAIL_BLOCKS.find((b) => b.id === id);
	return (
		found || {
			id,
			category: "body",
			title: id,
			content: "",
		}
	);
};

// Built-in email templates
export const BUILT_IN_TEMPLATES: MailTemplate[] = [
	{
		id: "template-business-inquiry",
		name: "ビジネス問い合わせ",
		description: "新規取引先への問い合わせメール",
		category: "inquiry",
		isBuiltIn: true,
		createdAt: new Date().toISOString(),
		blocks: [
			{ ...getMailBlockById("greeting-first"), id: "greeting-first-1" },
			{ ...getMailBlockById("body-request"), id: "body-request-1" },
			{ ...getMailBlockById("closing-reply"), id: "closing-reply-1" },
			{ ...getMailBlockById("signature-basic"), id: "signature-basic-1" },
		],
		variables: {
			company: "株式会社サンプル",
			name: "田中太郎",
			content: "貴社サービスについて",
			department: "営業部",
			phone: "03-1234-5678",
			email: "tanaka@sample.co.jp",
		},
	},
	{
		id: "template-follow-up",
		name: "フォローアップ",
		description: "会議後のフォローアップメール",
		category: "follow-up",
		isBuiltIn: true,
		createdAt: new Date().toISOString(),
		blocks: [
			{ ...getMailBlockById("greeting-regular"), id: "greeting-regular-1" },
			{ ...getMailBlockById("body-thanks"), id: "body-thanks-1" },
			{ ...getMailBlockById("body-confirm"), id: "body-confirm-1" },
			{ ...getMailBlockById("closing-contact"), id: "closing-contact-1" },
			{ ...getMailBlockById("signature-basic"), id: "signature-basic-1" },
		],
		variables: {
			company: "株式会社サンプル",
			name: "田中太郎",
			content: "本日の会議の件",
			department: "営業部",
			phone: "03-1234-5678",
			email: "tanaka@sample.co.jp",
		},
	},
	{
		id: "template-apology",
		name: "謝罪メール",
		description: "ミスやトラブルに対する謝罪メール",
		category: "apology",
		isBuiltIn: true,
		createdAt: new Date().toISOString(),
		blocks: [
			{ ...getMailBlockById("greeting-urgent"), id: "greeting-urgent-1" },
			{ ...getMailBlockById("body-apology"), id: "body-apology-1" },
			{
				...getMailBlockById("closing-cooperation"),
				id: "closing-cooperation-1",
			},
			{ ...getMailBlockById("signature-basic"), id: "signature-basic-1" },
		],
		variables: {
			company: "株式会社サンプル",
			name: "田中太郎",
			content: "この度のご迷惑",
			department: "営業部",
			phone: "03-1234-5678",
			email: "tanaka@sample.co.jp",
		},
	},
];

export const CATEGORY_COLORS = {
	greeting: "  ",
	body: "  ",
	closing: "  ",
	signature: "  ",
};

export const CATEGORY_NAMES = {
	greeting: "挨拶",
	body: "本文",
	closing: "締め",
	signature: "署名",
};

// Professional email guidelines
export const EMAIL_GUIDELINES = {
	structure: [
		"件名は具体的で簡潔に",
		"挨拶から始める",
		"本文は要点を明確に",
		"適切な締めの言葉",
		"署名を忘れずに",
	],
	tone: [
		"敬語を正しく使用",
		"相手の立場を考慮",
		"感謝の気持ちを表現",
		"謙虚な姿勢を保つ",
		"明確で分かりやすい表現",
	],
	formatting: [
		"適切な改行を使用",
		"箇条書きで整理",
		"重要な部分を強調",
		"読みやすい文字数",
		"統一された書式",
	],
};

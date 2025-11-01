export interface TextStats {
	// Basic counts
	totalCharacters: number;
	charactersWithoutSpaces: number;
	charactersWithoutNewlines: number;
	charactersWithoutWhitespace: number;

	// Structure counts
	wordCount: number;
	lineCount: number;
	paragraphCount: number;
	sentenceCount: number;

	// Character types (Japanese support)
	characterTypes: {
		hiragana: number;
		katakana: number;
		kanji: number;
		alphanumeric: number;
		symbols: number;
	};

	// Detailed statistics
	averageCharactersPerLine: number;
	longestLineLength: number;
	characterDensity: number;
	averageWordsPerLine: number;
}

export interface CountSettings {
	includeSpaces: boolean;
	includeNewlines: boolean;
	includeWhitespace: boolean;
	countMethod: "all" | "visible" | "printable";
}

export interface DisplaySettings {
	showBasicStats: boolean;
	showDetailedStats: boolean;
	showCharacterTypes: boolean;
	showStructureStats: boolean;
	showGraphs: boolean;
	theme: "light" | "dark";
	fontSize: "small" | "medium" | "large";
}

export interface CharacterTypeBreakdown {
	hiragana: string[];
	katakana: string[];
	kanji: string[];
	alphanumeric: string[];
	symbols: string[];
}

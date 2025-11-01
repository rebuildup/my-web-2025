/**
 * Search Index Manager
 * Handles search index operations
 */

export interface IndexItem {
	id: string;
	title: string;
	content: string;
	type: string;
	tags?: string[];
}

export class SearchIndexManager {
	private index: Map<string, IndexItem> = new Map();

	async createIndex(item: IndexItem): Promise<void> {
		this.index.set(item.id, item);
	}

	async updateIndex(id: string, item: Partial<IndexItem>): Promise<void> {
		const existing = this.index.get(id);
		if (existing) {
			this.index.set(id, { ...existing, ...item });
		}
	}

	async deleteFromIndex(id: string): Promise<void> {
		this.index.delete(id);
	}

	async search(query: string): Promise<IndexItem[]> {
		const results: IndexItem[] = [];
		for (const item of this.index.values()) {
			if (
				item.title.toLowerCase().includes(query.toLowerCase()) ||
				item.content.toLowerCase().includes(query.toLowerCase())
			) {
				results.push(item);
			}
		}
		return results;
	}

	async getAll(): Promise<IndexItem[]> {
		return Array.from(this.index.values());
	}
}

// Default instance
export const searchIndexManager = new SearchIndexManager();

// Utility functions
export const createIndex = (item: IndexItem) =>
	searchIndexManager.createIndex(item);

export const updateIndex = (id: string, item: Partial<IndexItem>) =>
	searchIndexManager.updateIndex(id, item);

export const deleteFromIndex = (id: string) =>
	searchIndexManager.deleteFromIndex(id);

export const searchIndex = (query: string) => searchIndexManager.search(query);

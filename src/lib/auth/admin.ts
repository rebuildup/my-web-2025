/**
 * Admin Authentication
 * Handles admin authentication and authorization
 */

export interface AdminUser {
	id: string;
	role: string;
	permissions: string[];
}

export class AdminAuth {
	async verifyAdminToken(token: string): Promise<boolean> {
		// Mock implementation for testing
		return token === "mock-admin-token";
	}

	isAdminUser(): boolean {
		// Mock implementation for testing
		return true;
	}

	async getAdminUser(token: string): Promise<AdminUser | null> {
		if (await this.verifyAdminToken(token)) {
			return {
				id: "admin",
				role: "admin",
				permissions: ["read", "write", "delete"],
			};
		}
		return null;
	}
}

// Default instance
export const adminAuth = new AdminAuth();

// Utility functions
export const verifyAdminToken = (token: string) =>
	adminAuth.verifyAdminToken(token);

export const isAdminUser = () => adminAuth.isAdminUser();

export const getAdminUser = (token: string) => adminAuth.getAdminUser(token);

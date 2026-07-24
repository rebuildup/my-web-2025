export const dynamic = "force-static";
import { listCmsDatabases, updateCmsDatabaseMeta } from "@/lib/cms-api/database-registry";
import { requireAdminRequest } from "@/lib/server/admin-auth";

export const runtime = "nodejs";

export async function GET() {
	try {
		const databases = await listCmsDatabases();
		return Response.json(databases);
	} catch (error) {
		console.error("GET /api/cms/databases error:", error);
		return Response.json(
			{ error: "Failed to fetch databases" },
			{ status: 500 },
		);
	}
}

export async function POST(req: Request) {
	const guard = requireAdminRequest(req);
	if (!guard.ok) return guard.response;

	return Response.json(
		{
			error:
				"Database creation and switching are not available from the Next.js layer. Manage runtime DB changes from the Rust CMS side.",
		},
		{ status: 501 },
	);
}

export async function PUT(req: Request) {
	const guard = requireAdminRequest(req);
	if (!guard.ok) return guard.response;

	try {
		const data = (await req.json()) as {
			id?: string;
			name?: string;
			description?: string;
		};
		if (!data.id) {
			return Response.json({ error: "ID is required" }, { status: 400 });
		}

		const updated = await updateCmsDatabaseMeta(data.id, {
			name: data.name,
			description: data.description,
		});
		if (!updated) {
			return Response.json({ error: "Database not found" }, { status: 404 });
		}

		return Response.json(updated);
	} catch (error) {
		console.error("PUT /api/cms/databases error:", error);
		return Response.json(
			{ error: "Failed to update database metadata" },
			{ status: 500 },
		);
	}
}

export async function DELETE(req: Request) {
	const guard = requireAdminRequest(req);
	if (!guard.ok) return guard.response;

	return Response.json(
		{
			error:
				"Database deletion is not available from the Next.js layer. Manage runtime DB files from the Rust CMS side.",
		},
		{ status: 501 },
	);
}

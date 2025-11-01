import { NextResponse } from "next/server";

/**
 * X (Twitter) プロフィール画像取得API
 * X API v2を使用してユーザーのプロフィール画像を取得
 */
export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const username = searchParams.get("username");

		if (!username) {
			return NextResponse.json(
				{ error: "Username parameter is required" },
				{ status: 400 },
			);
		}

		// X APIキーが設定されていない場合は、公開エンドポイントを試す
		const bearerToken = process.env.X_BEARER_TOKEN;

		if (!bearerToken) {
			// APIキーがない場合、フォールバックとして一般的なURLパターンを試す
			// または、公開されているoEmbed APIを試す
			return NextResponse.json(
				{
					error: "X API key not configured",
					fallback: `https://pbs.twimg.com/profile_images/default_profile_normal.png`,
				},
				{ status: 503 },
			);
		}

		// X API v2を使用してユーザー情報を取得
		const apiUrl = `https://api.x.com/2/users/by/username/${username}?user.fields=profile_image_url`;
		const response = await fetch(apiUrl, {
			headers: {
				Authorization: `Bearer ${bearerToken}`,
			},
		});

		if (!response.ok) {
			throw new Error(`X API error: ${response.statusText}`);
		}

		const data = await response.json();

		if (data.data?.profile_image_url) {
			// 通常サイズの画像URLを高解像度に変更（_normal -> _400x400）
			const imageUrl = data.data.profile_image_url.replace(
				/_normal\.(jpg|png|webp)$/,
				"_400x400.$1",
			);

			return NextResponse.json(
				{ imageUrl },
				{
					headers: {
						"Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
					},
				},
			);
		}

		return NextResponse.json(
			{ error: "Profile image not found" },
			{ status: 404 },
		);
	} catch (error) {
		console.error("X profile image API error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch profile image" },
			{ status: 500 },
		);
	}
}


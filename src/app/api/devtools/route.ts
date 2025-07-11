export async function GET() {
  // Chrome DevToolsの/.well-known/appspecific/com.chrome.devtools.jsonリクエストに対して
  // 204 No Contentを返してログの404エラーを防ぐ
  return new Response(null, { status: 204 });
}

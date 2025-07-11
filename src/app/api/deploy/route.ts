import { NextRequest } from 'next/server';
import { writeFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest): Promise<Response> {
  try {
    // 認証チェック
    const authHeader = request.headers.get('authorization');
    const deployToken = process.env.DEPLOY_TOKEN;

    if (!authHeader || !deployToken || authHeader !== `Bearer ${deployToken}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ファイルアップロードの処理
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // ファイルを一時ディレクトリに保存
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempPath = `/tmp/deployment-${Date.now()}.tar.gz`;
    await writeFile(tempPath, buffer);

    // デプロイ処理を実行
    try {
      // バックアップ作成
      await execAsync('sudo mkdir -p /var/www/backups');
      await execAsync(`sudo cp -r /var/www/html /var/www/backups/html-$(date +%Y%m%d-%H%M%S)`);

      // ファイル展開
      await execAsync(`sudo tar -xzf ${tempPath} -C /var/www/html`);

      // 依存関係インストール
      await execAsync('cd /var/www/html && npm install --omit=dev');

      // アプリケーション再起動
      await execAsync('cd /var/www/html && (pm2 restart all || npm run start &)');

      // 一時ファイル削除
      await execAsync(`rm -f ${tempPath}`);

      return Response.json({
        success: true,
        message: 'Deployment completed successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Deployment error:', error);
      return Response.json(
        {
          error: 'Deployment failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return Response.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

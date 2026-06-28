# 岡田モデル Public Prototype

DAO型プロジェクトで、参加者の貢献を「金銭的貢献」「人的資本価値」「組織影響」の3軸で可視化する公開プロトタイプです。

## What This Prototype Does

- プロジェクト概要からPPMフェーズとWBSを生成
- ガントチャートを表示
- 8つのプロジェクト評価パラメータを調整
- 会議文字起こしから貢献度を分析
- 報酬配分だけでなく、人的資本価値と組織影響を測定
- 役割別に「どの役割を果たすと評価がどれくらい上がるか」をレポート
- Markdown形式の報告書を出力

## Public Demo Mode

GitHub Pagesでは、静的UIとして動きます。

- 入口に簡易合言葉ゲートがあります。初期合言葉は `okada-test-2026` です。
- 検索避けの `robots.txt` と `noindex` メタタグを入れています。
- AI接続がない場合も、ローカルルールベースで動作します。
- `AIでPPM計画を生成` や `会議貢献を分析` は、AIサーバーがない環境ではローカルロジックにフォールバックします。
- APIキーはブラウザに保存・表示しません。

## Access Control Note

この公開版の合言葉ゲートは、テスト参加者向けの簡易制限です。GitHub Pagesは静的ホスティングのため、サーバー側の認証や完全な非公開化はできません。

機密情報、実名の評価データ、APIキーを扱う場合は、Cloudflare Access、Vercel/Netlifyの保護付きデプロイ、または認証付きバックエンドで運用してください。

## Local AI Mode

実AIを使う場合は、ローカルでAIプロキシサーバーを起動します。

```bash
cp .env.example .env
```

`.env` に自分のOpenAI APIキーを入れます。

```text
DYNAMIC_PPM_OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.5
```

起動:

```bash
node ai-server.mjs
```

Open:

```text
http://127.0.0.1:4181/
```

## Vercel AI Mode

Vercelにデプロイすると、`api/` 配下のサーバーレス関数がOpenAI APIを呼びます。APIキーはブラウザへ出さず、Vercelの環境変数に保存します。

1. Vercelで `ikeda1028/okada-model-public-prototype` をImport
2. Framework Presetは `Other`
3. Build Commandは空、Output Directoryも空のまま
4. Environment Variablesに以下を追加

```text
DYNAMIC_PPM_OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.5
```

5. Deploy
6. デプロイ後のURLで「AI接続確認」を押す

本番URLを保護したい場合は、VercelのDeployment Protectionを有効化してください。公開テストの段階では、Vercel側の保護とアプリ内の合言葉ゲートを併用できます。

## Security

- `.env` はGitHubへアップロードしないでください。
- APIキーをフロントエンドのJavaScriptへ直接書かないでください。
- 公開版では `.env.example` のみを含めます。
- VercelではOpenAIキーをEnvironment Variablesにだけ保存してください。

## Suggested GitHub Pages Setup

1. GitHubで新しい公開リポジトリを作成
2. このフォルダ内のファイルをリポジトリ直下へ配置
3. GitHub repository settings を開く
4. `Pages` を選択
5. Sourceを `Deploy from a branch` に設定
6. Branchを `main`、folderを `/root` に設定

## Files

- `index.html`: UI
- `styles.css`: Layout and visual design
- `app.js`: Prototype logic
- `ai-server.mjs`: Optional local OpenAI proxy
- `api/`: Vercel serverless API routes for OpenAI
- `vercel.json`: Vercel function and noindex header settings
- `.env.example`: Local AI setup template
- `.gitignore`: Prevents `.env` from being committed

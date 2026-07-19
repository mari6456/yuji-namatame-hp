# 生田目勇司 LP（Astro）

既存のワンページLP（`index.html`）を **Astro プロジェクト化**したもの。デザインは元のまま、ビルド・SEO・セキュリティ・デプロイの土台を追加。

## 構成

```
HP/
├── package.json          Astro 依存・スクリプト
├── astro.config.mjs      site / static 出力 / sitemap
├── vercel.json           セキュリティヘッダ・CSP・キャッシュ・リダイレクト
├── src/pages/index.astro LP本体（元 index.html を移植。CSSは <style is:global>）
├── public/
│   ├── uploads/          画像一式（元 uploads/ を移動）
│   └── robots.txt
├── _backup/              元 index.html のバックアップ（デプロイ不要）
└── index.html            ※元ファイル。ビルドには未使用（消してOK）
```

## ローカル開発

```bash
npm install
npm run dev        # → http://localhost:4321/
npm run build      # 本番ビルド（dist/ に出力）
npm run preview    # ビルド結果を確認
```

## デプロイ（Vercel）

1. このフォルダを git 化して GitHub に push
2. Vercel → New Project → import（Framework は Astro 自動検出 / Output = `dist`）
3. `main` への push で自動デプロイ

または CLI: `npm i -g vercel && vercel --prod`

## 公開前にやること（TODO）

- [ ] `astro.config.mjs` の `site` を本番ドメインに変更
- [ ] `public/robots.txt` の Sitemap URL を本番ドメインに変更
- [ ] `src/pages/index.astro` の `og:image` を絶対URLに（SNSシェア用）。必要なら `twitter:card` / `canonical` / JSON-LD を追加
- [ ] favicon 一式・og-image を `public/` に配置
- [ ] `npm run build` 後、`grep -rn "{{" src public` でプレースホルダ残ゼロ確認（このLPは元々プレースホルダ無し）

## ⚠️ iCloud について

このフォルダは iCloud Drive 上にあります。`npm install` で作られる **`node_modules/` は数万ファイル**あり、iCloud が同期しようとして重くなります。おすすめ:

- 開発用のコピーは **iCloud 外**（例 `~/dev/yuji-lp/`）に置いて作業する、または
- `node_modules/` と `dist/` は `.gitignore` 済みなので、GitHub+Vercel 運用なら手元に残っても支障なし（同期の重さだけ注意）

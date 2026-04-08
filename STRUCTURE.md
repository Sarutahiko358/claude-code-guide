# Next.js プロジェクト構造ガイド

このプロジェクト（claude-code-guide）の構成と、何を修正すればどこが変わるかを説明します。

---

## 全体のファイル構成

```
claude-code-guide/
├── app/                  ← ★ アプリ本体（ほぼここだけ触る）
│   ├── layout.tsx        ← 全ページ共通の外枠（HTML/head/bodyなど）
│   ├── page.tsx          ← トップページの中身（メインコンテンツ）
│   └── globals.css       ← 全体に適用されるCSS
├── public/               ← 画像やアイコンなどの静的ファイル
│   ├── file.svg
│   ├── globe.svg
│   └── ...
├── package.json          ← 依存パッケージとスクリプト定義
├── next.config.ts        ← Next.jsの設定ファイル
├── tsconfig.json         ← TypeScriptの設定
├── eslint.config.mjs     ← コード品質チェックの設定
├── postcss.config.mjs    ← CSS処理の設定（Tailwind用）
├── CLAUDE.md             ← Claude Code用のプロジェクトルール
└── AGENTS.md             ← エージェント用の指示ファイル
```

---

## よくある修正パターン

### 1. ページの内容（テキスト・UI）を変えたい

**→ `app/page.tsx` を編集する**

このファイルがトップページのすべてです。現在のアプリでは：
- セクション一覧（`SECTIONS` 配列）
- クイズデータ（`QUIZ_DATA` 配列）
- 表示ロジックとUI

がすべてこの1ファイルに入っています。

```
例）セクションのタイトルを変えたい場合：
→ SECTIONS 配列の title / subtitle を書き換える

例）クイズの問題を追加したい場合：
→ QUIZ_DATA 配列に新しいオブジェクトを追加する
```

### 2. ページのデザイン・色・フォントを変えたい

**→ `app/globals.css` を編集する**

- `--background` / `--foreground` で基本の背景色・文字色を設定
- ダークモード対応は `@media (prefers-color-scheme: dark)` で制御
- Tailwind CSSのクラス（`flex`, `p-4` 等）は `page.tsx` 内で直接指定

### 3. サイト全体のタイトル・メタ情報を変えたい

**→ `app/layout.tsx` を編集する**

```typescript
export const metadata: Metadata = {
  title: "ここがブラウザタブに表示されるタイトル",
  description: "検索エンジン向けの説明文",
};
```

また、`<html lang="en">` を `<html lang="ja">` にすると日本語サイトとして正しくなります。

### 4. 画像を追加・差し替えたい

**→ `public/` フォルダに画像を置く**

`public/` に置いたファイルは `/ファイル名` でアクセスできます。
例：`public/logo.png` → `<img src="/logo.png" />`

### 5. 新しいページを追加したい

**→ `app/` の下にフォルダとファイルを作る**

Next.jsの **App Router** ではフォルダ構造 = URLになります：

```
app/
├── page.tsx              → http://localhost:3000/
├── about/
│   └── page.tsx          → http://localhost:3000/about
└── guide/
    └── page.tsx          → http://localhost:3000/guide
```

各フォルダ内の `page.tsx` がそのURLのページになります。

---

## Next.js の基本的な仕組み（App Router）

### ファイルの役割ルール

| ファイル名       | 役割                                       |
|------------------|--------------------------------------------|
| `page.tsx`       | そのURLで表示されるページ本体               |
| `layout.tsx`     | 共通の外枠（ヘッダー・フッター等を置く場所） |
| `globals.css`    | 全体に適用されるスタイル                     |
| `loading.tsx`    | ロード中に表示するUI（任意）                 |
| `error.tsx`      | エラー時に表示するUI（任意）                 |
| `not-found.tsx`  | 404ページ（任意）                            |

### サーバーコンポーネント vs クライアントコンポーネント

- **デフォルトはサーバーコンポーネント**（サーバー側でHTMLを生成）
- `useState` や `useEffect` を使いたい場合はファイル先頭に `"use client";` を書く
- 現在の `page.tsx` は `"use client"` なのでクライアントコンポーネント

---

## 開発コマンド

```bash
npm run dev      # 開発サーバー起動（http://localhost:3000）
npm run build    # 本番ビルド
npm run start    # ビルド後の本番サーバー起動
npm run lint     # コード品質チェック
```

---

## まとめ：「何を変えたい？」→「どのファイル？」

| やりたいこと                   | 編集するファイル        |
|-------------------------------|------------------------|
| ページの内容・テキスト変更      | `app/page.tsx`         |
| デザイン・色の変更              | `app/globals.css`      |
| サイトタイトル変更              | `app/layout.tsx`       |
| 画像の追加                     | `public/` に配置       |
| 新ページの追加                 | `app/新フォルダ/page.tsx` を作成 |
| パッケージの追加               | `npm install パッケージ名` |
| Next.jsの設定変更              | `next.config.ts`       |

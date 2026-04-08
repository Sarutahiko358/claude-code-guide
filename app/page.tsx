"use client";
// ↑ これが必須（useState等を使うため）

// ここにアーティファクトのコード全体を貼り付け
// ただし先頭の import 行はそのまま残す
import { useState, useEffect, useRef } from "react";

const SECTIONS = [
  {
    id: "overview",
    icon: "⚡",
    title: "概要",
    subtitle: "Claude Codeとは？",
  },
  {
    id: "install",
    icon: "📦",
    title: "インストール",
    subtitle: "セットアップ手順",
  },
  {
    id: "ui",
    icon: "🖥️",
    title: "UI解説",
    subtitle: "画面の見方",
  },
  {
    id: "commands",
    icon: "⌨️",
    title: "コマンド",
    subtitle: "スラッシュコマンド",
  },
  {
    id: "shortcuts",
    icon: "🎹",
    title: "ショートカット",
    subtitle: "キーボード操作",
  },
  {
    id: "workflow",
    icon: "🔄",
    title: "ワークフロー",
    subtitle: "実践的な使い方",
  },
  {
    id: "advanced",
    icon: "🚀",
    title: "上級編",
    subtitle: "MCP・Hooks・Skills",
  },
  {
    id: "quiz",
    icon: "🧠",
    title: "理解度チェック",
    subtitle: "クイズ",
  },
];

const QUIZ_DATA = [
  {
    q: "Claude Code VS Code拡張をインストールする最も簡単な方法は？",
    opts: [
      "ターミナルでclaudeコマンドを実行する",
      "拡張機能マーケットプレイスで検索",
      "GitHubからソースをクローン",
      "npmでグローバルインストールのみ",
    ],
    ans: 1,
    hint: "Ctrl+Shift+X → 「Claude Code」で検索 → Anthropic公式を選択",
  },
  {
    q: "会話のコンテキストが大きくなりすぎた時に使うコマンドは？",
    opts: ["/clear", "/compact", "/reset", "/shrink"],
    ans: 1,
    hint: "/compactは会話履歴を要約して圧縮します",
  },
  {
    q: "Effort（労力）設定のLowは何を意味する？",
    opts: [
      "モデルが低品質な回答を返す",
      "推論を最小限にして高速応答する",
      "無料プランのみで使える",
      "コード生成を無効にする",
    ],
    ans: 1,
    hint: "Effortは推論の深さを制御します。Lowは素早い回答向き",
  },
  {
    q: "Claudeの変更を元に戻すショートカットは？",
    opts: ["Ctrl+Z", "Esc × 2回", "Ctrl+R", "/undo"],
    ans: 1,
    hint: "Escを2回押すとRewindメニューが開きます",
  },
  {
    q: "Thinkingモードの切り替えショートカットは？",
    opts: ["Ctrl+T", "Alt+T", "Shift+T", "Tab+T"],
    ans: 1,
    hint: "Alt+T（Option+T）でトグルできます",
  },
  {
    q: "@メンションで出来ることは？",
    opts: [
      "チームメンバーにメッセージ送信",
      "特定ファイルをコンテキストに追加",
      "外部APIを呼び出す",
      "スクリーンショットを撮る",
    ],
    ans: 1,
    hint: "@ファイル名 で特定ファイルの内容をClaudeに渡せます",
  },
  {
    q: "CLAUDE.mdファイルの役割は？",
    opts: [
      "Claudeのインストール設定",
      "プロジェクト固有のコンテキスト・ルール定義",
      "APIキーの保存場所",
      "ログファイルの出力先",
    ],
    ans: 1,
    hint: "プロジェクトルートに置くとClaudeが毎回読み込みます",
  },
  {
    q: "MCPとは何の略？",
    opts: [
      "Model Context Protocol",
      "Multiple Code Parser",
      "Machine Coding Platform",
      "Managed Cloud Provider",
    ],
    ans: 0,
    hint: "AI と外部ツールを標準化して接続するプロトコルです",
  },
];

// ---------- sub-components ----------

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 20px" }}>
      <div
        style={{
          flex: 1,
          height: 4,
          borderRadius: 2,
          background: "rgba(120,120,120,0.15)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 2,
            background: "linear-gradient(90deg,#d4956b,#c67a48)",
            transition: "width .4s ease",
          }}
        />
      </div>
      <span style={{ fontSize: 11, color: "#999", minWidth: 38, textAlign: "right" }}>
        {pct}%
      </span>
    </div>
  );
}

function CodeBlock({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div
      style={{
        margin: "12px 0",
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid rgba(120,120,120,0.12)",
      }}
    >
      {title && (
        <div
          style={{
            background: "#1e1e2e",
            color: "#a6adc8",
            fontSize: 11,
            padding: "6px 14px",
            letterSpacing: 0.5,
          }}
        >
          {title}
        </div>
      )}
      <pre
        style={{
          background: "#1e1e2e",
          color: "#cdd6f4",
          padding: "14px 16px",
          margin: 0,
          fontSize: 13,
          lineHeight: 1.6,
          overflowX: "auto",
          fontFamily: "'SF Mono','Fira Code',monospace",
        }}
      >
        {children}
      </pre>
    </div>
  );
}

function Tip({ children, type = "tip" }: { children: React.ReactNode; type?: "tip" | "warn" | "info" | "key" }) {
  const colors: Record<string, { bg: string; border: string; icon: string; accent: string }> = {
    tip: { bg: "#f0fdf4", border: "#86efac", icon: "💡", accent: "#16a34a" },
    warn: { bg: "#fefce8", border: "#fde047", icon: "⚠️", accent: "#ca8a04" },
    info: { bg: "#eff6ff", border: "#93c5fd", icon: "ℹ️", accent: "#2563eb" },
    key: { bg: "#fdf2f8", border: "#f9a8d4", icon: "🔑", accent: "#db2777" },
  };
  const c = colors[type] || colors.tip;
  return (
    <div
      style={{
        margin: "14px 0",
        padding: "12px 16px",
        background: c.bg,
        borderLeft: `3px solid ${c.border}`,
        borderRadius: "0 8px 8px 0",
        fontSize: 13,
        lineHeight: 1.7,
        color: "#374151",
      }}
    >
      <span style={{ marginRight: 6 }}>{c.icon}</span>
      {children}
    </div>
  );
}

function Tag({ children, color = "#c67a48" }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 600,
        background: `${color}18`,
        color,
        marginRight: 6,
        marginBottom: 4,
      }}
    >
      {children}
    </span>
  );
}

function UIAnnotation({ label, description, color = "#c67a48" }: { label: string; description: React.ReactNode; color?: string }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "10px 0",
        borderBottom: "1px solid rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          minWidth: 8,
          height: 8,
          borderRadius: 4,
          background: color,
          marginTop: 6,
        }}
      />
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b", marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{description}</div>
      </div>
    </div>
  );
}

function CommandCard({ cmd, desc, example }: { cmd: string; desc: string; example?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        padding: "12px 16px",
        marginBottom: 8,
        borderRadius: 10,
        background: open ? "#faf5f0" : "#fafafa",
        border: open ? "1px solid #e8d5c4" : "1px solid rgba(0,0,0,0.06)",
        cursor: "pointer",
        transition: "all .2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <code
          style={{
            fontFamily: "'SF Mono','Fira Code',monospace",
            fontWeight: 700,
            color: "#c67a48",
            fontSize: 14,
          }}
        >
          {cmd}
        </code>
        <span style={{ fontSize: 12, color: "#aaa", transform: open ? "rotate(180deg)" : "none", transition: ".2s" }}>
          ▼
        </span>
      </div>
      <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>{desc}</div>
      {open && example && (
        <div style={{ marginTop: 8 }}>
          <CodeBlock>{example}</CodeBlock>
        </div>
      )}
    </div>
  );
}

// ---------- Section contents ----------

function OverviewSection() {
  return (
    <div>
      <h2 style={h2Style}>Claude Codeとは？</h2>
      <p style={pStyle}>
        Claude Codeは、Anthropicが開発した<strong>エージェント型AIコーディングツール</strong>です。
        ターミナルやVS Codeの中で動作し、コードベース全体を理解しながら、
        自然言語の指示でコードの生成・修正・リファクタリング・デバッグを行います。
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "16px 0" }}>
        {[
          { icon: "🤖", title: "エージェント型", desc: "ファイルの読み書き・ターミナル実行を自律的に行う" },
          { icon: "👁️", title: "コンテキスト認識", desc: "開いているファイル・選択範囲を自動認識" },
          { icon: "📝", title: "Diff表示", desc: "変更をインラインDiffで表示、Accept/Reject" },
          { icon: "🔌", title: "MCP対応", desc: "外部ツール（GitHub, DB等）と標準接続" },
        ].map((f) => (
          <div
            key={f.title}
            style={{
              padding: 16,
              borderRadius: 12,
              background: "linear-gradient(135deg,#faf5f0,#fff)",
              border: "1px solid #e8d5c4",
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>{f.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{f.title}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <h3 style={h3Style}>利用可能な環境</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 0" }}>
        {["CLI（ターミナル）", "VS Code拡張", "JetBrains", "デスクトップアプリ", "claude.ai/code（Web）"].map((e) => (
          <Tag key={e}>{e}</Tag>
        ))}
      </div>

      <Tip type="key">
        VS Code拡張は CLIの<strong>グラフィカルUI</strong>です。
        裏側ではCLIが動いており、拡張はDiff表示やファイルナビゲーションなどの
        IDE機能と統合する「ブリッジ」の役割を果たします。
      </Tip>
    </div>
  );
}

function InstallSection() {
  return (
    <div>
      <h2 style={h2Style}>インストール手順</h2>

      <h3 style={h3Style}>Step 1：前提条件を確認</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "8px 0 16px" }}>
        {[
          { label: "Node.js 18+", check: "node -v" },
          { label: "VS Code 1.98+", check: "code --version" },
          { label: "Anthropicアカウント", check: "Pro / Max / Team / Enterprise" },
        ].map((r) => (
          <div
            key={r.label}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              flex: "1 1 200px",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13 }}>✅ {r.label}</div>
            <code style={{ fontSize: 11, color: "#64748b" }}>{r.check}</code>
          </div>
        ))}
      </div>
      <Tip type="warn">
        Windowsユーザーは<strong>WSL2</strong>が必要です。ネイティブWindowsでは直接動作しません。
      </Tip>

      <h3 style={h3Style}>Step 2：CLIをグローバルインストール</h3>
      <CodeBlock title="ターミナル">
        {`npm install -g @anthropic-ai/claude-code`}
      </CodeBlock>

      <h3 style={h3Style}>Step 3：認証</h3>
      <CodeBlock title="ターミナル">
        {`claude   # 初回起動で認証フローが開始
# ブラウザが開き、OAuthでログイン`}
      </CodeBlock>

      <h3 style={h3Style}>Step 4：VS Code拡張をインストール</h3>
      <CodeBlock title="VS Code内">
        {`Ctrl+Shift+X → 「Claude Code」で検索
→ Anthropic公式のものをインストール`}
      </CodeBlock>

      <Tip>
        CLIインストール後、VS Codeのターミナルで<code>claude</code>を実行すると
        拡張が<strong>自動検出・自動インストール</strong>されることもあります。
      </Tip>

      <h3 style={h3Style}>Step 5：動作確認</h3>
      <p style={pStyle}>
        サイドバーに ✨（Sparkアイコン）が表示されれば成功です。
        クリックしてセッション一覧を開き、新しい会話を始めましょう。
      </p>
      <CodeBlock title="最初のテスト">
        {`# VS Codeでプロジェクトフォルダを開いて
claude
> このプロジェクトの構造を説明して`}
      </CodeBlock>
    </div>
  );
}

function UISection() {
  return (
    <div>
      <h2 style={h2Style}>UI解説：画面の見方</h2>
      <p style={pStyle}>
        以下は VS Code拡張のアクションパレット（コマンドメニュー）の各項目です。
        入力欄で<code>/</code>を打つか、パレットを開くと表示されます。
      </p>

      <h3 style={h3Style}>📂 Context セクション</h3>
      <UIAnnotation
        label="Attach file..."
        description="ローカルファイルを会話に添付。画像やPDF、テキストファイルなどを直接Claudeに渡せます。大きなファイルの内容を読ませたい場合に便利。"
      />
      <UIAnnotation
        label="Mention file from this project..."
        description="プロジェクト内のファイルを @メンション形式で参照。Claudeがそのファイルの内容を自動的に読み込みます。行範囲の指定も可能（例：@src/app.ts:10-50）。"
        color="#d4956b"
      />
      <UIAnnotation
        label="Clear conversation"
        description="会話履歴を全消去してコンテキストをリセット。タスクの切り替え時に使用。/clear や /reset と同じ動作。"
      />
      <UIAnnotation
        label="Rewind"
        description="会話を過去のチェックポイントまで巻き戻し。コードの変更も元に戻せます。「コードのみ」「会話のみ」「両方」の3つのモードから選択可能。"
        color="#e85d04"
      />

      <h3 style={h3Style}>🤖 Model セクション</h3>
      <UIAnnotation
        label="Switch model..."
        description="使用するAIモデルを切り替え。Opus 4.6（最高性能）、Sonnet 4.6（高速）、Haiku 4.5（最速・Pro向け）などから選択。Default (recommended) はプラン最適のモデルを自動選択。"
      />
      <UIAnnotation
        label="Effort (Low / Medium / High / Max)"
        description={
          <>
            モデルの推論の深さを制御するスライダー。
            <br />
            <strong>Low</strong> = 最小限の推論で素早く回答（簡単な質問向き）
            <br />
            <strong>Medium</strong> = バランス型（デフォルト）
            <br />
            <strong>High</strong> = 深い推論（複雑なタスク向き）
            <br />
            <strong>Max</strong> = 最大限の推論力（難問・設計レベル）
          </>
        }
        color="#7c3aed"
      />
      <UIAnnotation
        label="Thinking"
        description="Extended Thinking（拡張思考）のON/OFF。ONにするとClaudeが段階的に思考プロセスを展開し、複雑な問題により正確に対応します。トグルスイッチで切り替え。"
        color="#2563eb"
      />
      <UIAnnotation
        label="Account & usage..."
        description="アカウント情報とレート制限の状態を確認。使用量の確認、残りのクォータ、プラン情報が表示されます。"
      />
      <UIAnnotation
        label="Toggle fast mode (Opus 4.6 only)"
        description="Opus 4.6使用時のみ利用可能。高速モードに切り替えて応答速度を優先。Team/Enterpriseプランで利用可能。"
        color="#059669"
      />

      <h3 style={h3Style}>📝 入力エリア</h3>
      <UIAnnotation
        label="Ask Claude to edit..."
        description="メインの入力欄。自然言語でコードの修正・生成・質問を入力します。選択中のコードがあれば自動的にコンテキストに含まれます。"
      />
      <UIAnnotation
        label="+ ボタン"
        description="新しいファイルやコンテキストの追加メニュー"
      />
      <UIAnnotation
        label="📎 ファイル表示（例：sw.js）"
        description="現在コンテキストに含まれているファイル。クリックで除外も可能。"
      />
      <UIAnnotation
        label="Ask before edits"
        description="ONにすると、Claudeがファイルを編集する前に毎回確認を求めます。安全性重視のモード。OFFだと自動で編集が適用されます。"
        color="#dc2626"
      />

      <Tip type="key">
        <strong>「Ask before edits」は重要な安全設定です。</strong>
        プロダクション環境のコードや重要なファイルを扱う時はONにしましょう。
        学習・実験中はOFFでも便利です。
      </Tip>
    </div>
  );
}

function CommandsSection() {
  const groups = [
    {
      title: "🧹 コンテキスト管理",
      cmds: [
        { cmd: "/compact", desc: "会話を要約して圧縮。トークン節約", example: `/compact 認証モジュールのバグ修正に集中して` },
        { cmd: "/clear", desc: "会話を全消去してリセット", example: `/clear\n# /reset, /new も同じ動作` },
        { cmd: "/context", desc: "現在のコンテキストウィンドウの使用状況を表示" },
        { cmd: "/rewind", desc: "チェックポイントまで巻き戻し", example: `Esc + Esc  # ショートカットで即座に呼び出し` },
      ],
    },
    {
      title: "🔧 モデル・設定",
      cmds: [
        { cmd: "/model", desc: "使用モデルを切り替え", example: `/model sonnet  # Sonnetに変更` },
        { cmd: "/effort", desc: "推論の深さを設定", example: `/effort high  # low / medium / high / max` },
        { cmd: "/plan", desc: "プランモード：変更前に計画を提示", example: `Shift+Tab  # トグルショートカット` },
      ],
    },
    {
      title: "📊 情報・確認",
      cmds: [
        { cmd: "/diff", desc: "現在のセッションの変更差分を表示" },
        { cmd: "/cost", desc: "トークン使用量とコスト表示（API利用時）" },
        { cmd: "/usage", desc: "プラン制限とレート制限を確認" },
        { cmd: "/stats", desc: "使用統計（Pro/Max向け）" },
      ],
    },
    {
      title: "🛠️ ワークフロー",
      cmds: [
        { cmd: "/btw", desc: "コンテキストを汚さないサイド質問", example: `/btw TypeScriptのRecord型の構文は？` },
        { cmd: "/fork", desc: "現在の会話を分岐させて別の実験", example: `/fork  # 実験的なアプローチを試す` },
        { cmd: "/copy", desc: "最後の回答をクリップボードにコピー" },
        { cmd: "/voice", desc: "音声入力モード" },
      ],
    },
    {
      title: "📦 組み込みスキル",
      cmds: [
        { cmd: "/review", desc: "コードレビューを実行" },
        { cmd: "/simplify", desc: "コードの簡略化を提案" },
        { cmd: "/debug", desc: "バグの原因を分析" },
        { cmd: "/batch", desc: "複数ファイルに一括変更" },
        { cmd: "/loop", desc: "定期的にタスクを繰り返し実行", example: `/loop 5m テストが全部通るか確認して` },
      ],
    },
  ];

  return (
    <div>
      <h2 style={h2Style}>スラッシュコマンド一覧</h2>
      <p style={pStyle}>
        入力欄で<code>/</code>を打つとコマンド一覧が表示されます。
        60以上のコマンドがありますが、ここでは最重要なものを紹介します。
      </p>
      {groups.map((g) => (
        <div key={g.title} style={{ marginBottom: 20 }}>
          <h3 style={h3Style}>{g.title}</h3>
          {g.cmds.map((c) => (
            <CommandCard key={c.cmd} {...c} />
          ))}
        </div>
      ))}
    </div>
  );
}

function ShortcutsSection() {
  const shortcuts = [
    { keys: "Esc × 2", action: "Rewind（巻き戻し）メニューを開く", cat: "制御" },
    { keys: "Ctrl+C", action: "現在の処理を中断", cat: "制御" },
    { keys: "Shift+Tab", action: "Plan Mode のON/OFF切り替え", cat: "制御" },
    { keys: "Alt+T / Option+T", action: "Extended Thinking のON/OFF", cat: "モデル" },
    { keys: "Alt+P / Option+P", action: "モデル切り替えピッカー", cat: "モデル" },
    { keys: "Tab", action: "Thinking表示のトグル（セッション間で記憶）", cat: "モデル" },
    { keys: "Ctrl+R", action: "プロンプト履歴の検索", cat: "入力" },
    { keys: "Ctrl+G", action: "外部エディタで入力を編集", cat: "入力" },
    { keys: "Cmd+Esc / Ctrl+Esc", action: "VS CodeでClaude Codeを起動", cat: "VS Code" },
    { keys: "@ファイル名", action: "ファイルをコンテキストに追加", cat: "VS Code" },
  ];
  const cats = [...new Set(shortcuts.map((s) => s.cat))];
  const catColors: Record<string, string> = { "制御": "#dc2626", "モデル": "#7c3aed", "入力": "#059669", "VS Code": "#2563eb" };

  return (
    <div>
      <h2 style={h2Style}>キーボードショートカット</h2>
      {cats.map((cat) => (
        <div key={cat} style={{ marginBottom: 20 }}>
          <Tag color={catColors[cat]}>{cat}</Tag>
          {shortcuts
            .filter((s) => s.cat === cat)
            .map((s) => (
              <div
                key={s.keys}
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(0,0,0,0.04)",
                }}
              >
                <kbd
                  style={{
                    minWidth: 140,
                    padding: "4px 12px",
                    borderRadius: 6,
                    background: "#1e1e2e",
                    color: "#cdd6f4",
                    fontFamily: "'SF Mono',monospace",
                    fontSize: 12,
                    fontWeight: 600,
                    textAlign: "center",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                  }}
                >
                  {s.keys}
                </kbd>
                <span style={{ fontSize: 13, color: "#374151" }}>{s.action}</span>
              </div>
            ))}
        </div>
      ))}
      <Tip>
        <strong>Esc×2（Rewind）</strong>は最も重要なショートカットです。
        Claudeが間違った方向に進んだ時、すぐに巻き戻して別のアプローチを試せます。
      </Tip>
    </div>
  );
}

function WorkflowSection() {
  const steps = [
    {
      num: 1,
      title: "プロジェクトを開く",
      desc: "VS Codeでプロジェクトフォルダを開き、ターミナルまたはSparkアイコンからClaudeを起動",
      code: `cd my-project\ncode .\n# Sparkアイコンをクリック or ターミナルで claude`,
    },
    {
      num: 2,
      title: "CLAUDE.mdを作成",
      desc: "プロジェクトルートにCLAUDE.mdを置き、プロジェクトのルールやコンテキストを定義",
      code: `# CLAUDE.md\n## プロジェクト概要\nNext.js 14 + TypeScript のWebアプリ\n\n## コーディング規約\n- 関数はアロー関数で統一\n- コメントは日本語で記述\n- テストは必ずvitest で書く`,
    },
    {
      num: 3,
      title: "Plan Modeで計画を立てる",
      desc: "大きなタスクは最初にPlan Modeで計画を確認してから実行",
      code: `# Shift+Tab でPlan Mode ON\n> ユーザー認証機能を実装して\n# → Claudeが計画を提示\n# → 確認後、Shift+Tab でPlan Mode OFF\n# → 実装開始`,
    },
    {
      num: 4,
      title: "段階的にタスクを実行",
      desc: "一度に大きな変更を頼まず、小さなステップに分割",
      code: `> 1. まずUserモデルのスキーマを作成して\n> 2. 次にCRUD APIエンドポイントを追加して\n> 3. バリデーションを追加して\n> 4. テストを書いて`,
    },
    {
      num: 5,
      title: "Diffを確認してAccept/Reject",
      desc: "Claudeの変更がDiffビューで表示される。問題なければAccept、やり直しならEsc×2でRewind",
    },
    {
      num: 6,
      title: "コンテキスト管理",
      desc: "セッションが長くなったら /compact で圧縮。タスク完了なら /clear でリセット",
      code: `/compact テスト修正に関連する部分だけ保持\n# or\n/clear   # 次のタスクへ`,
    },
  ];

  return (
    <div>
      <h2 style={h2Style}>実践ワークフロー</h2>
      <p style={pStyle}>
        効率的に Claude Code を使うための推奨ワークフローです。
      </p>
      {steps.map((s) => (
        <div
          key={s.num}
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 20,
            position: "relative",
          }}
        >
          <div
            style={{
              minWidth: 36,
              height: 36,
              borderRadius: 18,
              background: "linear-gradient(135deg,#c67a48,#d4956b)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 15,
              flexShrink: 0,
            }}
          >
            {s.num}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", marginBottom: 4 }}>
              {s.title}
            </div>
            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{s.desc}</div>
            {s.code && <CodeBlock>{s.code}</CodeBlock>}
          </div>
        </div>
      ))}
      <Tip type="key">
        <strong>Boris Cherny（Claude Code開発者）の助言：</strong>
        「計画が良ければ、コードも良くなる。」Effortレベルを上げる前に、
        まず明確な計画を立てることが最も重要です。
      </Tip>
    </div>
  );
}

function AdvancedSection() {
  return (
    <div>
      <h2 style={h2Style}>上級機能</h2>

      <h3 style={h3Style}>🔌 MCP（Model Context Protocol）</h3>
      <p style={pStyle}>
        MCPは「AIのUSB-C」と呼ばれる標準プロトコル。
        外部ツール（GitHub, DB, Slack等）をClaudeに接続できます。
      </p>
      <CodeBlock title=".mcp.json（プロジェクトルート）">
        {`{
  "servers": {
    "github": {
      "type": "url",
      "url": "https://mcp.github.com"
    }
  }
}`}
      </CodeBlock>
      <CodeBlock title="CLIからMCPサーバー追加">
        {`claude mcp add --transport http github https://mcp.github.com`}
      </CodeBlock>

      <h3 style={h3Style}>🪝 Hooks</h3>
      <p style={pStyle}>
        Hooksはライフサイクルの特定のタイミングで実行されるシェルスクリプト。
        「編集後に自動フォーマット」や「.envファイルの変更をブロック」など、
        決定的な自動化ルールを定義できます。
      </p>
      <CodeBlock title="settings.json - 自動フォーマットHook">
        {`{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit",
      "command": "npx prettier --write $CLAUDE_FILE_PATH"
    }]
  }
}`}
      </CodeBlock>
      <Tip type="warn">
        Hookの終了コード: <strong>0</strong> = 許可, <strong>2</strong> = ブロック
      </Tip>

      <h3 style={h3Style}>📚 Skills（スキル）</h3>
      <p style={pStyle}>
        Skillsはマークダウンファイルによる再利用可能なワークフロー。
        従来のcommands（.claude/commands/）を進化させたもので、
        テンプレート、スクリプト、参照ドキュメントを含むディレクトリとして定義します。
      </p>
      <CodeBlock title=".claude/skills/deploy-check/SKILL.md">
        {`---
name: deploy-check
description: デプロイ前のチェックリストを実行
---
以下のチェックを実行してください：
1. 全テストがパスするか確認
2. TypeScriptの型エラーがないか確認
3. lint警告がないか確認
4. 結果をサマリーで報告`}
      </CodeBlock>

      <h3 style={h3Style}>📋 CLAUDE.md と .claudeignore</h3>
      <p style={pStyle}>
        <strong>CLAUDE.md</strong>はプロジェクトルートに置く設定ファイル。
        毎回の会話でClaudeが自動的に読み込みます（200行以下推奨）。
      </p>
      <p style={pStyle}>
        <strong>.claudeignore</strong>は.gitignoreと同様に、
        Claudeに読ませたくないファイル（.env, lockファイル等）を指定します。
      </p>
    </div>
  );
}

function QuizSection() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = QUIZ_DATA[current];

  function handleSelect(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.ans) setScore((s) => s + 1);
    setAnswered((a) => a + 1);
  }

  function next() {
    if (current < QUIZ_DATA.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowHint(false);
    } else {
      setFinished(true);
    }
  }

  function restart() {
    setCurrent(0);
    setSelected(null);
    setShowHint(false);
    setScore(0);
    setAnswered(0);
    setFinished(false);
  }

  if (finished) {
    const pct = Math.round((score / QUIZ_DATA.length) * 100);
    const grade = pct >= 80 ? "🎉 素晴らしい！" : pct >= 50 ? "👍 いい調子！" : "📖 復習しましょう";
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{pct >= 80 ? "🏆" : pct >= 50 ? "⭐" : "📚"}</div>
        <h2 style={{ ...h2Style, textAlign: "center" }}>結果: {score} / {QUIZ_DATA.length}</h2>
        <div style={{ fontSize: 20, color: "#c67a48", fontWeight: 700, marginBottom: 8 }}>{grade}</div>
        <div style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>正答率 {pct}%</div>
        <button onClick={restart} style={btnStyle}>
          もう一度チャレンジ
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 style={h2Style}>理解度チェック</h2>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: "#64748b" }}>
          問題 {current + 1} / {QUIZ_DATA.length}
        </span>
        <span style={{ fontSize: 13, color: "#c67a48", fontWeight: 700 }}>
          スコア: {score}
        </span>
      </div>
      <ProgressBar current={current + 1} total={QUIZ_DATA.length} />
      <div
        style={{
          background: "#faf5f0",
          padding: 20,
          borderRadius: 14,
          marginTop: 16,
          border: "1px solid #e8d5c4",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.6, marginBottom: 16, color: "#1e293b" }}>
          {q.q}
        </div>
        {q.opts.map((opt, i) => {
          let bg = "#fff";
          let border = "1px solid #e2e8f0";
          let color = "#374151";
          if (selected !== null) {
            if (i === q.ans) {
              bg = "#dcfce7";
              border = "1px solid #86efac";
              color = "#166534";
            } else if (i === selected) {
              bg = "#fee2e2";
              border = "1px solid #fca5a5";
              color = "#991b1b";
            }
          }
          return (
            <div
              key={i}
              onClick={() => handleSelect(i)}
              style={{
                padding: "12px 16px",
                marginBottom: 8,
                borderRadius: 10,
                background: bg,
                border,
                color,
                cursor: selected === null ? "pointer" : "default",
                fontSize: 14,
                transition: "all .2s",
                fontWeight: selected !== null && i === q.ans ? 700 : 400,
              }}
            >
              {String.fromCharCode(65 + i)}. {opt}
            </div>
          );
        })}

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {selected === null && (
            <button
              onClick={() => setShowHint(true)}
              style={{ ...btnStyle, background: "#f1f5f9", color: "#475569" }}
            >
              💡 ヒント
            </button>
          )}
          {selected !== null && (
            <button onClick={next} style={btnStyle}>
              {current < QUIZ_DATA.length - 1 ? "次の問題 →" : "結果を見る"}
            </button>
          )}
        </div>
        {showHint && selected === null && (
          <Tip>{q.hint}</Tip>
        )}
        {selected !== null && (
          <Tip type={selected === q.ans ? "tip" : "info"}>
            {q.hint}
          </Tip>
        )}
      </div>
    </div>
  );
}

// ---------- Styles ----------
const h2Style = { fontSize: 22, fontWeight: 800, color: "#1e293b", margin: "0 0 12px", letterSpacing: -0.5 };
const h3Style = { fontSize: 16, fontWeight: 700, color: "#475569", margin: "20px 0 8px", borderBottom: "2px solid #e8d5c4", paddingBottom: 6 };
const pStyle = { fontSize: 14, color: "#475569", lineHeight: 1.8, margin: "8px 0" };
const btnStyle = {
  padding: "10px 24px",
  borderRadius: 10,
  border: "none",
  background: "linear-gradient(135deg,#c67a48,#d4956b)",
  color: "#fff",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};

// ---------- Main ----------
export default function App() {
  const [activeSection, setActiveSection] = useState("overview");
  const [visited, setVisited] = useState(new Set(["overview"]));
  const contentRef = useRef<HTMLDivElement>(null);

  function navigate(id: string) {
    setActiveSection(id);
    setVisited((v) => new Set([...v, id]));
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }

  const sectionMap: Record<string, () => React.ReactElement> = {
    overview: OverviewSection,
    install: InstallSection,
    ui: UISection,
    commands: CommandsSection,
    shortcuts: ShortcutsSection,
    workflow: WorkflowSection,
    advanced: AdvancedSection,
    quiz: QuizSection,
  };
  const SectionComponent = sectionMap[activeSection] ?? OverviewSection;

  const curIdx = SECTIONS.findIndex((s) => s.id === activeSection);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#faf5f0 0%,#f5ebe0 100%)",
        fontFamily:
          "'Hiragino Kaku Gothic ProN','Noto Sans JP','Segoe UI',system-ui,sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg,#1e1e2e 0%,#2d2040 100%)",
          padding: "24px 20px 18px",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 28 }}>✨</span>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: -0.5,
                background: "linear-gradient(90deg,#f5d0a9,#e8a76c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Claude Code ガイド
            </h1>
            <div style={{ fontSize: 12, color: "#a6adc8", marginTop: 2 }}>
              VS Code で始めるAIペアプログラミング
            </div>
          </div>
        </div>
        <ProgressBar current={visited.size} total={SECTIONS.length} />
      </div>

      {/* Tab Nav */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: 2,
          padding: "8px 8px 0",
          background: "#f5ebe0",
          borderBottom: "1px solid #e8d5c4",
        }}
      >
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => navigate(s.id)}
            style={{
              flex: "0 0 auto",
              padding: "10px 14px",
              border: "none",
              borderRadius: "10px 10px 0 0",
              background: activeSection === s.id ? "#fff" : "transparent",
              color: activeSection === s.id ? "#c67a48" : "#78716c",
              fontWeight: activeSection === s.id ? 700 : 500,
              fontSize: 12,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              transition: "all .2s",
              position: "relative",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: 18 }}>{s.icon}</span>
            <span>{s.title}</span>
            {visited.has(s.id) && s.id !== activeSection && (
              <div
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  background: "#86efac",
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        style={{
          padding: "20px 18px 100px",
          maxWidth: 720,
          margin: "0 auto",
          background: "#fff",
          minHeight: "60vh",
          borderRadius: "0 0 16px 16px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
        }}
      >
        <SectionComponent />
      </div>

      {/* Bottom Nav */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          padding: "12px 20px",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid #e8d5c4",
        }}
      >
        <button
          onClick={() => curIdx > 0 && navigate(SECTIONS[curIdx - 1].id)}
          disabled={curIdx === 0}
          style={{
            ...btnStyle,
            opacity: curIdx === 0 ? 0.3 : 1,
            background: "#f1f5f9",
            color: "#475569",
          }}
        >
          ← 前へ
        </button>
        <span style={{ fontSize: 12, color: "#999", alignSelf: "center" }}>
          {curIdx + 1} / {SECTIONS.length}
        </span>
        <button
          onClick={() => curIdx < SECTIONS.length - 1 && navigate(SECTIONS[curIdx + 1].id)}
          disabled={curIdx === SECTIONS.length - 1}
          style={{ ...btnStyle, opacity: curIdx === SECTIONS.length - 1 ? 0.3 : 1 }}
        >
          次へ →
        </button>
      </div>
    </div>
  );
}
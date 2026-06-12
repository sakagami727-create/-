"use client";

import { useState } from "react";

type CopyState = { [key: number]: boolean };

export default function Home() {
  const [draft, setDraft] = useState("");
  const [titles, setTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedStates, setCopiedStates] = useState<CopyState>({});

  const charCount = draft.length;

  async function handleGenerate() {
    if (!draft.trim()) {
      setError("記事の本文・ドラフトを入力してください");
      return;
    }
    setError("");
    setTitles([]);
    setLoading(true);

    try {
      const res = await fetch("/api/generate-titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "エラーが発生しました");
      setTitles(data.titles);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(title: string, idx: number) {
    await navigator.clipboard.writeText(title);
    setCopiedStates((prev) => ({ ...prev, [idx]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [idx]: false }));
    }, 2000);
  }

  return (
    <main className="min-h-screen bg-[#0f0f13] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f0f13]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm font-bold">
            N
          </div>
          <div>
            <h1 className="text-base font-semibold leading-none">
              noteタイトルジェネレーター
            </h1>
            <p className="text-xs text-white/40 mt-0.5">powered by Claude AI · 亮仁スタイル</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-xs text-violet-300">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            あなたの文体を学習済み
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            記事ドラフトから
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              {" "}タイトル10本
            </span>
            を生成
          </h2>
          <p className="text-white/50 text-sm">
            過去の投稿スタイルを分析。語りかけ・数字・詩的ワンライナーなど
            <br />
            あなたらしいタイトルを自動生成します。
          </p>
        </div>

        {/* Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-white/70">
              記事の本文 / ドラフト
            </label>
            <span className={`text-xs ${charCount > 0 ? "text-violet-400" : "text-white/30"}`}>
              {charCount.toLocaleString()} 文字
            </span>
          </div>
          <div className="relative">
            <textarea
              className="w-full h-56 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white/90 placeholder-white/20 resize-none focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all duration-200 leading-relaxed"
              placeholder={"ここに記事の本文やドラフトを貼り付けてください…\n\n例：原神のガチャシステムについて解説します。天井（ソフト天井）は75連から確率アップが始まり、90連で必ずピックアップキャラが当たります。私は実際に240連引いてモチーフ武器を入手した経験から…"}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            {draft && (
              <button
                onClick={() => setDraft("")}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/40 hover:text-white/70 transition-all text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !draft.trim()}
            className={[
              "w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "bg-gradient-to-r from-violet-600 to-fuchsia-600",
              "enabled:hover:from-violet-500 enabled:hover:to-fuchsia-500",
              "enabled:active:scale-[0.98]",
              "shadow-lg shadow-violet-500/20",
            ].join(" ")}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                タイトルを生成中…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                タイトルを10本生成する
              </span>
            )}
          </button>
        </div>

        {/* Results */}
        {titles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                生成されたタイトル
              </h3>
              <span className="text-xs text-white/30">{titles.length}本</span>
            </div>

            <div className="space-y-2.5">
              {titles.map((title, idx) => (
                <div
                  key={idx}
                  className="group flex items-start gap-3 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-violet-500/30 rounded-2xl px-5 py-4 transition-all duration-200"
                >
                  <span className="shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border border-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-300 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="flex-1 text-sm text-white/85 leading-relaxed group-hover:text-white transition-colors">
                    {title}
                  </p>
                  <button
                    onClick={() => handleCopy(title, idx)}
                    className="shrink-0 mt-0.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 bg-white/5 hover:bg-violet-500/20 border border-white/10 hover:border-violet-500/30 text-white/40 hover:text-violet-300"
                  >
                    {copiedStates[idx] ? "✓ コピー済" : "コピー"}
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm text-white/40 hover:text-white/60 border border-white/10 hover:border-white/20 transition-all duration-200 disabled:opacity-40"
            >
              再生成する
            </button>
          </div>
        )}

        {/* Style guide (shown only before first generation) */}
        {titles.length === 0 && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              {
                icon: "💬",
                label: "語りかけ型",
                desc: "「あなたはまさか〜していませんよね？」読者に直接問いかける",
              },
              {
                icon: "🔢",
                label: "数字＋体験型",
                desc: "「240連引いた私がおすすめする〜7選」実績で信頼感を演出",
              },
              {
                icon: "✨",
                label: "詩的ワンライナー",
                desc: "「AIに丸投げした瞬間、魂が抜ける」刺さる比喩・対比",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 space-y-2"
              >
                <div className="text-xl">{item.icon}</div>
                <div className="text-xs font-semibold text-white/60">{item.label}</div>
                <div className="text-xs text-white/30 leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-16 py-6">
        <p className="text-center text-xs text-white/20">
          亮仁さんのnoteスタイルを学習したAIタイトルジェネレーター
        </p>
      </footer>
    </main>
  );
}

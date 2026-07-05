"use client";

import { useEffect, useState } from "react";

interface FunnelSummary {
  lpVisits: number;
  lineRegistrations: number;
  meetingsDone: number;
  lpToLineRate: number | null;
  lineToMeetingRate: number | null;
  lpToMeetingRate: number | null;
}

function formatRate(rate: number | null): string {
  return rate === null ? "-" : `${(rate * 100).toFixed(1)}%`;
}

export default function FunnelPage() {
  const [summary, setSummary] = useState<FunnelSummary | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [recording, setRecording] = useState(false);

  const loadSummary = async () => {
    const res = await fetch("/api/funnel/event");
    if (res.ok) setSummary(await res.json());
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const recordMeetingDone = async () => {
    setRecording(true);
    try {
      await fetch("/api/funnel/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: "meeting_done" }),
      });
      await loadSummary();
    } finally {
      setRecording(false);
    }
  };

  const runAnalysis = async () => {
    setLoadingAnalysis(true);
    setAnalysis(null);
    try {
      const res = await fetch("/api/funnel/analyze", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSummary(data.summary);
        setAnalysis(data.analysis);
      } else {
        setAnalysis(data.error || "分析に失敗しました");
      }
    } catch {
      setAnalysis("通信エラーが発生しました");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-blue-600 text-white p-4 shadow">
        <h1 className="text-2xl font-bold text-center">LINE ファネル分析</h1>
        <p className="text-center text-sm text-blue-100 mt-1">LP → LINE登録 → 面談の転換率をClaudeが分析</p>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <section className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">📊 ファネル実績</h2>
          <div className="grid grid-cols-3 gap-3 text-center mb-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-blue-600">{summary?.lpVisits ?? "-"}</p>
              <p className="text-xs text-gray-500 mt-1">LP訪問</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-600">{summary?.lineRegistrations ?? "-"}</p>
              <p className="text-xs text-gray-500 mt-1">LINE登録</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-orange-600">{summary?.meetingsDone ?? "-"}</p>
              <p className="text-xs text-gray-500 mt-1">面談実施</p>
            </div>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between"><span>LP → LINE登録</span><span className="font-semibold">{formatRate(summary?.lpToLineRate ?? null)}</span></div>
            <div className="flex justify-between"><span>LINE登録 → 面談</span><span className="font-semibold">{formatRate(summary?.lineToMeetingRate ?? null)}</span></div>
            <div className="flex justify-between"><span>LP → 面談（全体）</span><span className="font-semibold">{formatRate(summary?.lpToMeetingRate ?? null)}</span></div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">✅ 面談完了を記録</h2>
          <p className="text-xs text-gray-400 mb-3">面談が完了したら手動でカウントを記録してください（LINE Messaging APIには面談実施を自動検知する手段がないため）</p>
          <button
            onClick={recordMeetingDone}
            disabled={recording}
            className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50"
          >
            {recording ? "記録中..." : "+ 面談完了を1件記録"}
          </button>
        </section>

        <section className="bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-700">🤖 Claudeによる分析</h2>
            <button
              onClick={runAnalysis}
              disabled={loadingAnalysis}
              className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loadingAnalysis ? "分析中..." : "✨ 分析する"}
            </button>
          </div>
          {analysis && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800 whitespace-pre-wrap">
              {analysis}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

"use client";

import { useState, useRef } from "react";

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface AnalysisResult {
  foods: FoodItem[];
  totalCalories: number;
  notes: string;
}

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalIntake, setTotalIntake] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const goalCalories = 2000;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResult(null);
    setError(null);
    setMediaType(file.type);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!preview) return;

    setAnalyzing(true);
    setError(null);

    try {
      const base64 = preview.split(",")[1];
      const res = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "エラーが発生しました");
      } else {
        setResult(data);
        setTotalIntake((prev) => prev + data.totalCalories);
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setAnalyzing(false);
    }
  };

  const remaining = goalCalories - totalIntake;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white p-4 shadow">
        <h1 className="text-2xl font-bold text-center">BodyMake Food Tracker</h1>
        <p className="text-center text-sm text-green-100 mt-1">カロリー管理・ボディメイクをサポート</p>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <section className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">今日の記録</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-600">{totalIntake}</p>
              <p className="text-xs text-gray-500 mt-1">摂取カロリー</p>
              <p className="text-xs text-gray-400">kcal</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-blue-600">{goalCalories}</p>
              <p className="text-xs text-gray-500 mt-1">目標カロリー</p>
              <p className="text-xs text-gray-400">kcal</p>
            </div>
            <div className={`rounded-lg p-3 ${remaining >= 0 ? "bg-orange-50" : "bg-red-50"}`}>
              <p className={`text-2xl font-bold ${remaining >= 0 ? "text-orange-600" : "text-red-600"}`}>
                {remaining}
              </p>
              <p className="text-xs text-gray-500 mt-1">残り</p>
              <p className="text-xs text-gray-400">kcal</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">📷 写真でカロリー計算</h2>

          <div
            className="border-2 border-dashed border-green-300 rounded-xl p-6 text-center cursor-pointer hover:bg-green-50 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="食事の写真" className="max-h-48 mx-auto rounded-lg object-contain" />
            ) : (
              <div className="text-green-500">
                <p className="text-4xl mb-2">🍱</p>
                <p className="text-sm">タップして写真を選択</p>
                <p className="text-xs text-gray-400 mt-1">食事の写真をアップロードするとカロリーを自動計算します</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />

          {preview && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="mt-3 w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? "🔍 AI解析中..." : "✨ カロリーを計算する"}
            </button>
          )}

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-4 space-y-3">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">合計カロリー</p>
                <p className="text-3xl font-bold text-green-600">{result.totalCalories} kcal</p>
              </div>

              <div className="space-y-2">
                {result.foods.map((food, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-semibold text-gray-700">{food.name}</p>
                      <p className="text-green-600 font-bold">{food.calories} kcal</p>
                    </div>
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>たんぱく質 {food.protein}g</span>
                      <span>炭水化物 {food.carbs}g</span>
                      <span>脂質 {food.fat}g</span>
                    </div>
                  </div>
                ))}
              </div>

              {result.notes && (
                <p className="text-xs text-gray-400 italic">{result.notes}</p>
              )}

              <button
                onClick={() => {
                  setPreview(null);
                  setResult(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="w-full border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                別の写真を追加
              </button>
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">体重を記録する</h2>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="例: 65.5"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <span className="self-center text-gray-500 text-sm">kg</span>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition">
              記録
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

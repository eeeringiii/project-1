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

interface MealLog extends FoodItem {
  id: string;
  mealType: string;
}

const MEAL_TYPES = ["朝食", "昼食", "夕食", "間食"];

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [selectedMealType, setSelectedMealType] = useState("朝食");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const goalCalories = 2000;
  const totalIntake = mealLogs.reduce((sum, m) => sum + m.calories, 0);
  const remaining = goalCalories - totalIntake;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    setError(null);
    setMediaType(file.type);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
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
      if (!res.ok) setError(data.error || "エラーが発生しました");
      else setResult(data);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setAnalyzing(false);
    }
  };

  const addToLog = (food: FoodItem) => {
    const log: MealLog = {
      ...food,
      id: `${Date.now()}-${Math.random()}`,
      mealType: selectedMealType,
    };
    setMealLogs((prev) => [...prev, log]);
    setFeedback(null);
  };

  const removeFromLog = (id: string) => {
    setMealLogs((prev) => prev.filter((m) => m.id !== id));
    setFeedback(null);
  };

  const handleFeedback = async () => {
    if (mealLogs.length === 0) return;
    setLoadingFeedback(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meals: mealLogs }),
      });
      const data = await res.json();
      if (res.ok) setFeedback(data.feedback);
    } catch {
      setFeedback("フィードバックの取得に失敗しました");
    } finally {
      setLoadingFeedback(false);
    }
  };

  const resetPhoto = () => {
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white p-4 shadow">
        <h1 className="text-2xl font-bold text-center">BodyMake Food Tracker</h1>
        <p className="text-center text-sm text-green-100 mt-1">カロリー管理・ボディメイクをサポート</p>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* 今日の記録 */}
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

        {/* 食事ログ */}
        {mealLogs.length > 0 && (
          <section className="bg-white rounded-xl shadow p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-700">今日の食事</h2>
              <button
                onClick={handleFeedback}
                disabled={loadingFeedback}
                className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-purple-700 transition disabled:opacity-50"
              >
                {loadingFeedback ? "分析中..." : "✨ AIアドバイス"}
              </button>
            </div>

            {feedback && (
              <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800">
                🤖 {feedback}
              </div>
            )}

            <div className="space-y-1">
              {MEAL_TYPES.map((type) => {
                const items = mealLogs.filter((m) => m.mealType === type);
                if (items.length === 0) return null;
                return (
                  <div key={type}>
                    <p className="text-xs font-semibold text-gray-400 mt-2 mb-1">{type}</p>
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{item.name}</p>
                          <p className="text-xs text-gray-400">P:{item.protein}g C:{item.carbs}g F:{item.fat}g</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-green-600">{item.calories}kcal</p>
                          <button
                            onClick={() => removeFromLog(item.id)}
                            className="text-gray-300 hover:text-red-400 text-lg leading-none"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 写真でカロリー計算 */}
        <section className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">📷 写真でカロリー計算</h2>

          {/* 食事タイプ選択 */}
          <div className="flex gap-2 mb-3">
            {MEAL_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedMealType(type)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition ${
                  selectedMealType === type
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

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

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

          {preview && !result && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="mt-3 w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {analyzing ? "🔍 AI解析中..." : "✨ カロリーを計算する"}
            </button>
          )}

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
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
                    <div className="flex justify-between items-center">
                      <div className="flex gap-3 text-xs text-gray-500">
                        <span>たんぱく質 {food.protein}g</span>
                        <span>炭水化物 {food.carbs}g</span>
                        <span>脂質 {food.fat}g</span>
                      </div>
                      <button
                        onClick={() => { addToLog(food); }}
                        className="text-xs bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 transition"
                      >
                        + 記録
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {result.notes && <p className="text-xs text-gray-400 italic">{result.notes}</p>}

              <button
                onClick={resetPhoto}
                className="w-full border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                別の写真を追加
              </button>
            </div>
          )}
        </section>

        {/* 体重記録 */}
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

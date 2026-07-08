"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import CalorieChart from "./components/CalorieChart";
import WeightChart from "./components/WeightChart";

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
  time: string;
}

interface DayRecord {
  date: string;
  meals: MealLog[];
  weight?: number;
}

interface WeightEntry {
  date: string;
  weight: number;
}

interface Settings {
  goalCalories: number;
  goalWeight: number;
}

const MEAL_TYPES = ["朝食", "昼食", "夕食", "間食"];
const today = () => new Date().toISOString().split("T")[0];

function todayStr() { return today(); }

export default function Home() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<"today" | "history" | "settings">("today");
  const [records, setRecords, recordsLoaded] = useLocalStorage<DayRecord[]>("food-records", []);
  const [favorites, setFavorites] = useLocalStorage<FoodItem[]>("favorites", []);
  const [weightHistory, setWeightHistory] = useLocalStorage<WeightEntry[]>("weight-history", []);
  const [settings, setSettings] = useLocalStorage<Settings>("settings", { goalCalories: 2000, goalWeight: 60 });

  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState("朝食");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [goalCalInput, setGoalCalInput] = useState(String(settings.goalCalories));
  const [goalWeightInput, setGoalWeightInput] = useState(String(settings.goalWeight));
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setGoalCalInput(String(settings.goalCalories));
    setGoalWeightInput(String(settings.goalWeight));
  }, [settings]);

  const todayRecord = records.find((r) => r.date === todayStr()) ?? { date: todayStr(), meals: [] };
  const todayMeals = todayRecord.meals;

  const updateTodayMeals = (meals: MealLog[]) => {
    setRecords((prev) => {
      const existing = prev.find((r) => r.date === todayStr());
      if (existing) return prev.map((r) => r.date === todayStr() ? { ...r, meals } : r);
      return [...prev, { date: todayStr(), meals }];
    });
  };

  const totalIntake = todayMeals.reduce((s, m) => s + m.calories, 0);
  const remaining = settings.goalCalories - totalIntake;

  // streak
  const streak = (() => {
    let count = 0;
    const d = new Date();
    while (true) {
      const dateStr = d.toISOString().split("T")[0];
      const rec = records.find((r) => r.date === dateStr);
      if (!rec || rec.meals.length === 0) break;
      const cal = rec.meals.reduce((s, m) => s + m.calories, 0);
      if (cal > settings.goalCalories) break;
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  // 7-day chart data
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    const dateStr = d.toISOString().split("T")[0];
    const rec = records.find((r) => r.date === dateStr);
    const calories = rec ? rec.meals.reduce((s, m) => s + m.calories, 0) : 0;
    return { date: dateStr, calories };
  });

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
    } catch { setError("通信エラーが発生しました"); }
    finally { setAnalyzing(false); }
  };

  const addToLog = (food: FoodItem) => {
    const log: MealLog = {
      ...food,
      id: `${Date.now()}-${Math.random()}`,
      mealType: selectedMealType,
      time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
    };
    updateTodayMeals([...todayMeals, log]);
    setFeedback(null);
  };

  const removeFromLog = (id: string) => {
    updateTodayMeals(todayMeals.filter((m) => m.id !== id));
    setFeedback(null);
  };

  const toggleFavorite = (food: FoodItem) => {
    const exists = favorites.some((f) => f.name === food.name);
    if (exists) setFavorites(favorites.filter((f) => f.name !== food.name));
    else setFavorites([...favorites, food]);
  };

  const isFavorite = (name: string) => favorites.some((f) => f.name === name);

  const handleFeedback = async () => {
    if (todayMeals.length === 0) return;
    setLoadingFeedback(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meals: todayMeals }),
      });
      const data = await res.json();
      if (res.ok) setFeedback(data.feedback);
    } catch { setFeedback("フィードバックの取得に失敗しました"); }
    finally { setLoadingFeedback(false); }
  };

  const handleWeightSave = () => {
    const w = parseFloat(weightInput);
    if (isNaN(w) || w <= 0) return;
    const entry = { date: todayStr(), weight: w };
    setWeightHistory((prev) => {
      const filtered = prev.filter((e) => e.date !== todayStr());
      return [...filtered, entry].sort((a, b) => a.date.localeCompare(b.date));
    });
    setWeightInput("");
  };

  const handleSettingsSave = () => {
    const cal = parseInt(goalCalInput);
    const weight = parseFloat(goalWeightInput);
    if (!isNaN(cal) && cal > 0 && !isNaN(weight) && weight > 0) {
      setSettings({ goalCalories: cal, goalWeight: weight });
    }
  };

  const resetPhoto = () => {
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!recordsLoaded) return null;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-green-600 text-white p-4 shadow">
        <h1 className="text-2xl font-bold text-center">BodyMake Food Tracker</h1>
        <p className="text-center text-sm text-green-100 mt-1">カロリー管理・ボディメイクをサポート</p>
        <div className="flex justify-center items-center gap-2 mt-3">
          {status === "authenticated" ? (
            <>
              {session.user?.image && (
                <img src={session.user.image} alt="" className="w-6 h-6 rounded-full" />
              )}
              <span className="text-xs text-green-100">{session.user?.email}</span>
              <button
                onClick={() => signOut()}
                className="text-xs bg-green-700 hover:bg-green-800 px-2 py-1 rounded-full"
              >
                ログアウト
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="text-xs bg-white text-green-700 hover:bg-green-50 px-3 py-1 rounded-full font-semibold"
            >
              Googleでログイン
            </button>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* ========== TODAY TAB ========== */}
        {tab === "today" && (
          <>
            {/* サマリー */}
            <section className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-lg font-semibold text-gray-700">今日の記録</h2>
                {streak > 0 && (
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-semibold">
                    🔥 {streak}日連続達成中
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-green-600">{totalIntake}</p>
                  <p className="text-xs text-gray-500 mt-1">摂取カロリー</p>
                  <p className="text-xs text-gray-400">kcal</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-blue-600">{settings.goalCalories}</p>
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

              {/* progress bar */}
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${totalIntake > settings.goalCalories ? "bg-red-400" : "bg-green-400"}`}
                  style={{ width: `${Math.min((totalIntake / settings.goalCalories) * 100, 100)}%` }}
                />
              </div>
            </section>

            {/* 食事ログ */}
            {todayMeals.length > 0 && (
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

                {/* タイムライン */}
                <div className="space-y-1">
                  {MEAL_TYPES.map((type) => {
                    const items = todayMeals.filter((m) => m.mealType === type);
                    if (items.length === 0) return null;
                    return (
                      <div key={type}>
                        <p className="text-xs font-semibold text-gray-400 mt-2 mb-1">{type}</p>
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">{item.time}</span>
                              <div>
                                <p className="text-sm font-medium text-gray-700">{item.name}</p>
                                <p className="text-xs text-gray-400">P:{item.protein}g C:{item.carbs}g F:{item.fat}g</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => toggleFavorite(item)} className="text-lg">
                                {isFavorite(item.name) ? "⭐" : "☆"}
                              </button>
                              <p className="text-sm font-bold text-green-600">{item.calories}kcal</p>
                              <button onClick={() => removeFromLog(item.id)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* お気に入り */}
            {favorites.length > 0 && (
              <section className="bg-white rounded-xl shadow p-4">
                <button
                  className="flex justify-between items-center w-full"
                  onClick={() => setShowFavorites((v) => !v)}
                >
                  <h2 className="text-lg font-semibold text-gray-700">⭐ お気に入り</h2>
                  <span className="text-gray-400">{showFavorites ? "▲" : "▼"}</span>
                </button>
                {showFavorites && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {MEAL_TYPES.map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedMealType(type)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition ${selectedMealType === type ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    {favorites.map((food, i) => (
                      <div key={i} className="flex justify-between items-center bg-yellow-50 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{food.name}</p>
                          <p className="text-xs text-gray-400">{food.calories}kcal</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => addToLog(food)}
                            className="text-xs bg-green-600 text-white px-2 py-1 rounded-lg"
                          >
                            + 記録
                          </button>
                          <button onClick={() => toggleFavorite(food)} className="text-yellow-400 hover:text-gray-400 text-lg">⭐</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* 写真でカロリー計算 */}
            <section className="bg-white rounded-xl shadow p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">📷 写真でカロリー計算</h2>
              <div className="flex gap-1 mb-3">
                {MEAL_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedMealType(type)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${selectedMealType === type ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
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
                    <p className="text-xs text-gray-400 mt-1">食事の写真でカロリーを自動計算</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

              {preview && !result && (
                <button onClick={handleAnalyze} disabled={analyzing} className="mt-3 w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50">
                  {analyzing ? "🔍 AI解析中..." : "✨ カロリーを計算する"}
                </button>
              )}

              {error && <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

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
                          <div className="flex gap-2 text-xs text-gray-500">
                            <span>P:{food.protein}g</span>
                            <span>C:{food.carbs}g</span>
                            <span>F:{food.fat}g</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => toggleFavorite(food)} className="text-lg">{isFavorite(food.name) ? "⭐" : "☆"}</button>
                            <button onClick={() => addToLog(food)} className="text-xs bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 transition">
                              + 記録
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {result.notes && <p className="text-xs text-gray-400 italic">{result.notes}</p>}
                  <button onClick={resetPhoto} className="w-full border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
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
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="例: 65.5"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <span className="self-center text-gray-500 text-sm">kg</span>
                <button onClick={handleWeightSave} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition">
                  記録
                </button>
              </div>
              {weightHistory.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">最新: {weightHistory[weightHistory.length - 1].weight}kg ({weightHistory[weightHistory.length - 1].date})</p>
              )}
            </section>
          </>
        )}

        {/* ========== HISTORY TAB ========== */}
        {tab === "history" && (
          <>
            <section className="bg-white rounded-xl shadow p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">📊 週間カロリー</h2>
              <CalorieChart data={weekData} goal={settings.goalCalories} />
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400 rounded inline-block" />目標以内</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded inline-block" />目標超過</span>
                <span className="flex items-center gap-1"><span className="w-3 h-2 border-t-2 border-blue-300 border-dashed inline-block" />目標ライン</span>
              </div>
            </section>

            <section className="bg-white rounded-xl shadow p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">📈 体重グラフ</h2>
              <WeightChart data={weightHistory.slice(-14)} />
              {weightHistory.length >= 2 && (
                <div className="mt-2 flex gap-4 text-xs text-gray-500">
                  <span>開始: {weightHistory[0].weight}kg</span>
                  <span>最新: {weightHistory[weightHistory.length - 1].weight}kg</span>
                  <span className={weightHistory[weightHistory.length - 1].weight < weightHistory[0].weight ? "text-green-600" : "text-red-500"}>
                    {(weightHistory[weightHistory.length - 1].weight - weightHistory[0].weight).toFixed(1)}kg
                  </span>
                </div>
              )}
            </section>

            <section className="bg-white rounded-xl shadow p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">📅 食事履歴</h2>
              {records.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">まだ記録がありません</p>
              ) : (
                <div className="space-y-3">
                  {[...records].reverse().slice(0, 7).map((rec) => {
                    const cal = rec.meals.reduce((s, m) => s + m.calories, 0);
                    return (
                      <div key={rec.date} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-semibold text-gray-700">{rec.date}</p>
                          <p className={`text-sm font-bold ${cal <= settings.goalCalories ? "text-green-600" : "text-red-500"}`}>
                            {cal} kcal {cal <= settings.goalCalories ? "✓" : "↑"}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400">{rec.meals.map((m) => m.name).join("・")}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {/* ========== SETTINGS TAB ========== */}
        {tab === "settings" && (
          <>
            <section className="bg-white rounded-xl shadow p-4 space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">⚙️ 目標設定</h2>
              <div>
                <label className="text-sm text-gray-600 block mb-1">目標カロリー (kcal/日)</label>
                <input
                  type="number"
                  value={goalCalInput}
                  onChange={(e) => setGoalCalInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">目標体重 (kg)</label>
                <input
                  type="number"
                  value={goalWeightInput}
                  onChange={(e) => setGoalWeightInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <button
                onClick={handleSettingsSave}
                className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
              >
                保存する
              </button>
            </section>

            <section className="bg-white rounded-xl shadow p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">⭐ お気に入り管理</h2>
              {favorites.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-2">食品のカロリー計算後、☆マークでお気に入り登録できます</p>
              ) : (
                <div className="space-y-2">
                  {favorites.map((food, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{food.name}</p>
                        <p className="text-xs text-gray-400">{food.calories}kcal / P:{food.protein}g C:{food.carbs}g F:{food.fat}g</p>
                      </div>
                      <button onClick={() => toggleFavorite(food)} className="text-yellow-400 hover:text-gray-400 text-lg">⭐</button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white rounded-xl shadow p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">データ</h2>
              <p className="text-xs text-gray-400 mb-3">記録件数: {records.length}日 / 体重記録: {weightHistory.length}件</p>
              <button
                onClick={() => {
                  if (confirm("全てのデータを削除しますか？")) {
                    setRecords([]);
                    setWeightHistory([]);
                    setFavorites([]);
                  }
                }}
                className="text-sm text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
              >
                データをリセット
              </button>
            </section>
          </>
        )}
      </div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex">
        {([
          { key: "today", label: "今日", icon: "🍽️" },
          { key: "history", label: "グラフ", icon: "📊" },
          { key: "settings", label: "設定", icon: "⚙️" },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium transition ${tab === t.key ? "text-green-600" : "text-gray-400"}`}
          >
            <span className="text-xl">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </main>
  );
}

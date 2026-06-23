export default function Home() {
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
              <p className="text-2xl font-bold text-green-600">0</p>
              <p className="text-xs text-gray-500 mt-1">摂取カロリー</p>
              <p className="text-xs text-gray-400">kcal</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-blue-600">2000</p>
              <p className="text-xs text-gray-500 mt-1">目標カロリー</p>
              <p className="text-xs text-gray-400">kcal</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-orange-600">2000</p>
              <p className="text-xs text-gray-500 mt-1">残り</p>
              <p className="text-xs text-gray-400">kcal</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">食事を記録する</h2>
          <div className="grid grid-cols-2 gap-3">
            {["朝食", "昼食", "夕食", "間食"].map((meal) => (
              <button
                key={meal}
                className="border-2 border-dashed border-green-300 text-green-600 rounded-lg p-4 hover:bg-green-50 transition"
              >
                + {meal}を追加
              </button>
            ))}
          </div>
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

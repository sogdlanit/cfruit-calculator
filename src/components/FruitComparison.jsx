import React, { useState } from 'react';
import { Scale, ArrowRight, Trophy, Plus, Check } from 'lucide-react';
import { calculateItemNutrition } from '../utils/nutritionCalculator';

export default function FruitComparison({ fruits, onAddToPlate }) {
  const [fruitAId, setFruitAId] = useState(fruits[0]?.id || 'guava_pearl');
  const [fruitBId, setFruitBId] = useState(fruits[2]?.id || 'apple_fuji');
  const [weight, setWeight] = useState(100);
  const [addedA, setAddedA] = useState(false);
  const [addedB, setAddedB] = useState(false);

  const fruitA = fruits.find((f) => f.id === fruitAId) || fruits[0];
  const fruitB = fruits.find((f) => f.id === fruitBId) || fruits[1];

  const nutA = calculateItemNutrition(fruitA, weight);
  const nutB = calculateItemNutrition(fruitB, weight);

  const metrics = [
    { label: '熱量 (Calories)', key: 'calories', unit: 'kcal', preferLower: true },
    { label: '總糖量 (Sugar)', key: 'sugar', unit: 'g', preferLower: true },
    { label: '膳食纖維 (Fiber)', key: 'dietary_fiber', unit: 'g', preferLower: false },
    { label: '維生素 C (Vitamin C)', key: 'vitamin_c', unit: 'mg', preferLower: false },
    { label: '鉀離子 (Potassium)', key: 'potassium', unit: 'mg', preferLower: false },
    { label: '蛋白質 (Protein)', key: 'protein', unit: 'g', preferLower: false },
    { label: '水分 (Water)', key: 'water', unit: 'g', preferLower: false },
  ];

  const handleAddA = () => {
    onAddToPlate(fruitA, weight);
    setAddedA(true);
    setTimeout(() => setAddedA(false), 1200);
  };

  const handleAddB = () => {
    onAddToPlate(fruitB, weight);
    setAddedB(true);
    setTimeout(() => setAddedB(false), 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            <span>雙果營養 PK 橫向對比</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            任選兩種水果，在相同重量下對比熱量、糖分、維生素 C 與膳食纖維差異。
          </p>
        </div>

        {/* Comparison Weight Selector */}
        <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 pl-2">對比重量：</span>
          <button
            onClick={() => setWeight(100)}
            className={`px-3 py-1 text-xs rounded-xl font-medium transition ${
              weight === 100 ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            100g 基準
          </button>
          <button
            onClick={() => setWeight(200)}
            className={`px-3 py-1 text-xs rounded-xl font-medium transition ${
              weight === 200 ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            200g (約 1 碗)
          </button>
        </div>
      </div>

      {/* Selectors & Fruit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fruit A Card */}
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-400 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              選手 A
            </span>
            <select
              value={fruitAId}
              onChange={(e) => setFruitAId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              {fruits.map((f) => (
                <option key={f.id} value={f.id} disabled={f.id === fruitBId}>
                  {f.emoji} {f.name} ({f.category})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-4xl shadow-inner">
              {fruitA.emoji}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">{fruitA.name}</h3>
              <p className="text-xs text-slate-400 font-medium">{fruitA.english_name}</p>
              <div className="mt-1 flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-600">
                  GI 指數：<strong className="text-emerald-700">{fruitA.gi_value} ({fruitA.gi_level === 'low' ? '低' : fruitA.gi_level === 'medium' ? '中' : '高'})</strong>
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">{fruitA.description}</p>

          <button
            onClick={handleAddA}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center justify-center space-x-1.5 shadow-sm shadow-emerald-600/20"
          >
            {addedA ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{addedA ? '已加入拼盤！' : `將 ${fruitA.name} (${weight}g) 加到拼盤`}</span>
          </button>
        </div>

        {/* Fruit B Card */}
        <div className="bg-white rounded-3xl p-6 border-2 border-indigo-400 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
              選手 B
            </span>
            <select
              value={fruitBId}
              onChange={(e) => setFruitBId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {fruits.map((f) => (
                <option key={f.id} value={f.id} disabled={f.id === fruitAId}>
                  {f.emoji} {f.name} ({f.category})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-4xl shadow-inner">
              {fruitB.emoji}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">{fruitB.name}</h3>
              <p className="text-xs text-slate-400 font-medium">{fruitB.english_name}</p>
              <div className="mt-1 flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-600">
                  GI 指數：<strong className="text-indigo-700">{fruitB.gi_value} ({fruitB.gi_level === 'low' ? '低' : fruitB.gi_level === 'medium' ? '中' : '高'})</strong>
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">{fruitB.description}</p>

          <button
            onClick={handleAddB}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center justify-center space-x-1.5 shadow-sm shadow-indigo-600/20"
          >
            {addedB ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{addedB ? '已加入拼盤！' : `將 ${fruitB.name} (${weight}g) 加到拼盤`}</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/60 overflow-hidden">
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center justify-between">
          <span>相同重量 ({weight}g) 數值比較</span>
          <span className="text-xs font-normal text-slate-500">🏆 標示勝出或更推薦項目</span>
        </h3>

        <div className="divide-y divide-slate-100">
          {metrics.map((m) => {
            const valA = nutA[m.key];
            const valB = nutB[m.key];

            let winner = null;
            if (valA !== valB) {
              if (m.preferLower) {
                winner = valA < valB ? 'A' : 'B';
              } else {
                winner = valA > valB ? 'A' : 'B';
              }
            }

            const maxVal = Math.max(valA, valB, 0.1);
            const percentA = Math.round((valA / maxVal) * 100);
            const percentB = Math.round((valB / maxVal) * 100);

            return (
              <div key={m.key} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="w-44 font-semibold text-xs sm:text-sm text-slate-700">
                  {m.label}
                </div>

                <div className="flex-1 grid grid-cols-2 gap-4 items-center">
                  {/* Val A */}
                  <div className="flex items-center justify-end space-x-2">
                    <span className={`text-xs sm:text-sm font-bold ${winner === 'A' ? 'text-emerald-700' : 'text-slate-600'}`}>
                      {valA} {m.unit}
                    </span>
                    {winner === 'A' && (
                      <span className="text-xs" title="更優">
                        🏆
                      </span>
                    )}
                    <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                      <div
                        style={{ width: `${percentA}%` }}
                        className={`h-full ${winner === 'A' ? 'bg-emerald-500' : 'bg-slate-400'}`}
                      />
                    </div>
                  </div>

                  {/* Val B */}
                  <div className="flex items-center justify-start space-x-2">
                    <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                      <div
                        style={{ width: `${percentB}%` }}
                        className={`h-full ${winner === 'B' ? 'bg-indigo-500' : 'bg-slate-400'}`}
                      />
                    </div>
                    {winner === 'B' && (
                      <span className="text-xs" title="更優">
                        🏆
                      </span>
                    )}
                    <span className={`text-xs sm:text-sm font-bold ${winner === 'B' ? 'text-indigo-700' : 'text-slate-600'}`}>
                      {valB} {m.unit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

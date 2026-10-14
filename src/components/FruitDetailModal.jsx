import React, { useState } from 'react';
import { X, Plus, Check, Info, Flame, Sparkles, Activity } from 'lucide-react';
import { calculateItemNutrition } from '../utils/nutritionCalculator';

export default function FruitDetailModal({ fruit, onClose, onAddToPlate, isAlreadyInPlate }) {
  if (!fruit) return null;

  const defaultGrams = fruit.serving_unit?.grams || 100;
  const [selectedGrams, setSelectedGrams] = useState(defaultGrams);
  const [added, setAdded] = useState(false);

  const nut100 = fruit.nutrition_per_100g;
  const nutServing = calculateItemNutrition(fruit, selectedGrams);

  const handleAdd = () => {
    onAddToPlate(fruit, selectedGrams);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const getGiBadge = (level) => {
    switch (level) {
      case 'low':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">低升糖 (低 GI: {fruit.gi_value})</span>;
      case 'medium':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">中升糖 (中 GI: {fruit.gi_value})</span>;
      case 'high':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800">高升糖 (高 GI: {fruit.gi_value})</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50 p-6 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-4xl border border-slate-100">
              {fruit.emoji}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-2xl font-bold text-slate-800">{fruit.name}</h3>
                <span className="text-xs px-2.5 py-0.5 font-medium rounded-full bg-slate-200/80 text-slate-700">
                  {fruit.category}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium">{fruit.english_name}</p>
              <div className="mt-2 flex items-center space-x-2">
                {getGiBadge(fruit.gi_level)}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Description & Tags */}
          <div>
            <p className="text-slate-600 text-sm leading-relaxed mb-3">{fruit.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {fruit.tags.map((tag, idx) => (
                <span key={idx} className="px-2.5 py-0.8 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Portion Selector */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  快速換算自訂份量
                </label>
                <div className="flex items-center space-x-2 mt-1">
                  <button 
                    onClick={() => setSelectedGrams(100)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                      selectedGrams === 100 ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    100g (基準)
                  </button>
                  {fruit.serving_unit && (
                    <button 
                      onClick={() => setSelectedGrams(fruit.serving_unit.grams)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                        selectedGrams === fruit.serving_unit.grams ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      1 {fruit.serving_unit.name} ({fruit.serving_unit.grams}g)
                    </button>
                  )}
                  {fruit.serving_unit && (
                    <button 
                      onClick={() => setSelectedGrams(Math.round(fruit.serving_unit.grams / 2))}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                        selectedGrams === Math.round(fruit.serving_unit.grams / 2) ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      半{fruit.serving_unit.name.charAt(0)} ({Math.round(fruit.serving_unit.grams / 2)}g)
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="10"
                  max="1000"
                  step="5"
                  value={selectedGrams}
                  onChange={(e) => setSelectedGrams(Math.max(1, Number(e.target.value) || 0))}
                  className="w-24 px-3 py-1.5 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-center"
                />
                <span className="text-sm font-medium text-slate-600">公克 (g)</span>
              </div>
            </div>
          </div>

          {/* Nutrition Table */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>完整營養成分表</span>
              </span>
              <span className="text-xs font-normal text-slate-500">
                換算數值為：<strong className="text-emerald-700">{selectedGrams}g</strong>
              </span>
            </h4>

            <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-2xs">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-2xs border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">營養項目</th>
                    <th className="py-2.5 px-3 text-right">每 100g 基準</th>
                    <th className="py-2.5 px-4 text-right bg-emerald-50 text-emerald-900 font-bold">當前份量 ({selectedGrams}g)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-medium text-slate-800">熱量 (Calories)</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{nut100.calories} kcal</td>
                    <td className="py-2.5 px-4 text-right font-bold text-emerald-700 bg-emerald-50/40">{nutServing.calories} kcal</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-medium text-slate-800">總碳水化合物</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{nut100.carbohydrates} g</td>
                    <td className="py-2.5 px-4 text-right font-semibold text-slate-900 bg-emerald-50/40">{nutServing.carbohydrates} g</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-medium text-slate-800 pl-8">↳ 其中總糖量 (Sugar)</td>
                    <td className="py-2.5 px-3 text-right text-amber-600 font-medium">{nut100.sugar} g</td>
                    <td className="py-2.5 px-4 text-right font-semibold text-amber-700 bg-emerald-50/40">{nutServing.sugar} g</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-medium text-slate-800 pl-8">↳ 膳食纖維 (Fiber)</td>
                    <td className="py-2.5 px-3 text-right text-emerald-600 font-medium">{nut100.dietary_fiber} g</td>
                    <td className="py-2.5 px-4 text-right font-semibold text-emerald-700 bg-emerald-50/40">{nutServing.dietary_fiber} g</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-medium text-slate-800">蛋白質 (Protein)</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{nut100.protein} g</td>
                    <td className="py-2.5 px-4 text-right text-slate-800 bg-emerald-50/40">{nutServing.protein} g</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-medium text-slate-800">脂肪 (Fat)</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{nut100.fat} g</td>
                    <td className="py-2.5 px-4 text-right text-slate-800 bg-emerald-50/40">{nutServing.fat} g</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-medium text-slate-800">維生素 C</td>
                    <td className="py-2.5 px-3 text-right text-orange-600 font-semibold">{nut100.vitamin_c} mg</td>
                    <td className="py-2.5 px-4 text-right font-bold text-orange-600 bg-emerald-50/40">{nutServing.vitamin_c} mg</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-medium text-slate-800">鉀 (Potassium)</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{nut100.potassium} mg</td>
                    <td className="py-2.5 px-4 text-right text-slate-800 bg-emerald-50/40">{nutServing.potassium} mg</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-medium text-slate-800">鎂 (Magnesium)</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{nut100.magnesium} mg</td>
                    <td className="py-2.5 px-4 text-right text-slate-800 bg-emerald-50/40">{nutServing.magnesium} mg</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-medium text-slate-800">水分</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{nut100.water} g</td>
                    <td className="py-2.5 px-4 text-right text-slate-800 bg-emerald-50/40">{nutServing.water} g</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition"
          >
            關閉
          </button>
          <button
            onClick={handleAdd}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition shadow-sm ${
              added
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>已加入拼盤！</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>加入今日拼盤 ({selectedGrams}g)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

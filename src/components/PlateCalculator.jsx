import React from 'react';
import { Trash2, Plus, Sparkles, RefreshCw, ShoppingBag, Utensils } from 'lucide-react';
import NutritionSummaryCard from './NutritionSummaryCard';
import { calculatePlateTotals, calculateItemNutrition } from '../utils/nutritionCalculator';

export default function PlateCalculator({
  plateItems,
  onUpdateGrams,
  onRemoveItem,
  onClearPlate,
  onApplyPreset,
  onGoToCatalog,
  onOpenDetail,
}) {
  const totals = calculatePlateTotals(plateItems);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Plate Item List (8 cols) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Header & Controls */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-800">今日水果拼盤</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                {plateItems.length} 種水果
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">自由調整公克數或使用常見份量快速計算攝取量</p>
          </div>

          <div className="flex items-center space-x-2">
            {plateItems.length > 0 && (
              <button
                onClick={onClearPlate}
                className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>清空拼盤</span>
              </button>
            )}
            <button
              onClick={onGoToCatalog}
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>加新水果</span>
            </button>
          </div>
        </div>

        {/* Empty State with Presets */}
        {plateItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-soft text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl shadow-inner">
              🥗
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">您的水果盤目前是空的</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                您可以從水果百科挑選水果加入，或直接點選下方為您準備的「經典健康營養組合」！
              </p>
            </div>

            {/* Presets Grid */}
            <div className="pt-2 text-left">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3 text-center">
                推薦健康拼盤快速試算
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => onApplyPreset('weight_loss')}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 text-left transition group"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xl">🍐</span>
                    <span className="font-bold text-sm text-slate-800 group-hover:text-emerald-700">
                      減脂高纖低糖盤
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">珍珠芭樂 150g + 綠奇異果 85g + 藍莓 50g</p>
                  <div className="text-3xs text-emerald-600 font-semibold mt-2">約 133 kcal · 6.6g 膳食纖維</div>
                </button>

                <button
                  onClick={() => onApplyPreset('vitamin_c')}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/30 text-left transition group"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xl">🥝</span>
                    <span className="font-bold text-sm text-slate-800 group-hover:text-orange-700">
                      美顏高 C 抗氧化盤
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">黃金奇異果 90g + 草莓 100g + 紅心芭樂 100g</p>
                  <div className="text-3xs text-orange-600 font-semibold mt-2">約 138 kcal · 428mg 維生素C (超高)</div>
                </button>

                <button
                  onClick={() => onApplyPreset('workout')}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 text-left transition group"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xl">🍌</span>
                    <span className="font-bold text-sm text-slate-800 group-hover:text-amber-700">
                      運動前後能量補給盤
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">香蕉 120g + 富士蘋果 (帶皮) 100g</p>
                  <div className="text-3xs text-amber-600 font-semibold mt-2">約 158 kcal · 536mg 高鉀補充電解質</div>
                </button>

                <button
                  onClick={() => onApplyPreset('hydration')}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 text-left transition group"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xl">🍉</span>
                    <span className="font-bold text-sm text-slate-800 group-hover:text-teal-700">
                      清爽水潤消暑盤
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">黑珍珠蓮霧 110g + 紅肉西瓜 150g</p>
                  <div className="text-3xs text-teal-600 font-semibold mt-2">約 86 kcal · 超低卡水分充足</div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {plateItems.map((item, index) => {
              const itemNut = calculateItemNutrition(item.fruit, item.grams);
              const servingUnit = item.fruit.serving_unit;

              return (
                <div
                  key={`${item.fruit.id}-${index}`}
                  className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-soft hover:shadow-card transition"
                >
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex items-center space-x-3 cursor-pointer group"
                      onClick={() => onOpenDetail(item.fruit)}
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-3xl border border-slate-100 group-hover:scale-105 transition-transform">
                        {item.fruit.emoji}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-800 text-base group-hover:text-emerald-600 transition-colors">
                            {item.fruit.name}
                          </h4>
                          <span className="text-2xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                            {item.fruit.category}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          每 100g 約 {item.fruit.nutrition_per_100g.calories} kcal · 糖 {item.fruit.nutrition_per_100g.sugar}g
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(index)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="移除此水果"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Weight Controls */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Preset buttons */}
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <button
                        onClick={() => onUpdateGrams(index, 100)}
                        className={`px-2.5 py-1 text-2xs font-medium rounded-lg transition ${
                          item.grams === 100
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        100g
                      </button>

                      {servingUnit && (
                        <button
                          onClick={() => onUpdateGrams(index, servingUnit.grams)}
                          className={`px-2.5 py-1 text-2xs font-medium rounded-lg transition ${
                            item.grams === servingUnit.grams
                              ? 'bg-slate-800 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          1 {servingUnit.name} ({servingUnit.grams}g)
                        </button>
                      )}

                      {servingUnit && (
                        <button
                          onClick={() => onUpdateGrams(index, Math.round(servingUnit.grams / 2))}
                          className={`px-2.5 py-1 text-2xs font-medium rounded-lg transition ${
                            item.grams === Math.round(servingUnit.grams / 2)
                              ? 'bg-slate-800 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          半{servingUnit.name.charAt(0)} ({Math.round(servingUnit.grams / 2)}g)
                        </button>
                      )}
                    </div>

                    {/* Number input and slider */}
                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <input
                        type="range"
                        min="10"
                        max="500"
                        step="5"
                        value={item.grams}
                        onChange={(e) => onUpdateGrams(index, Number(e.target.value))}
                        className="w-24 sm:w-32 accent-emerald-600 cursor-pointer"
                      />
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min="5"
                          max="1000"
                          value={item.grams}
                          onChange={(e) => onUpdateGrams(index, Math.max(1, Number(e.target.value) || 0))}
                          className="w-16 px-2 py-1 text-xs font-bold text-center bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                        <span className="text-xs font-medium text-slate-500">g</span>
                      </div>
                    </div>
                  </div>

                  {/* Subtotal metrics badge */}
                  <div className="mt-3 flex items-center justify-between text-2xs bg-emerald-50/50 rounded-xl px-3 py-2 border border-emerald-100/50">
                    <span className="font-medium text-emerald-900">
                      本項攝取：<strong>{itemNut.calories}</strong> kcal
                    </span>
                    <div className="flex items-center space-x-3 text-slate-600">
                      <span>糖: <strong className="text-amber-700">{itemNut.sugar}g</strong></span>
                      <span>纖維: <strong className="text-emerald-700">{itemNut.dietary_fiber}g</strong></span>
                      <span>維C: <strong className="text-orange-700">{itemNut.vitamin_c}mg</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: Nutrition Dashboard (5 cols) */}
      <div className="lg:col-span-5 sticky top-20">
        <NutritionSummaryCard totals={totals} plateItems={plateItems} />
      </div>
    </div>
  );
}

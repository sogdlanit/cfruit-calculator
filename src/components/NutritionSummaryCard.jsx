import React, { useState } from 'react';
import { Flame, Droplet, Sparkles, AlertTriangle, CheckCircle2, Info, Copy, Check } from 'lucide-react';
import { DRI_STANDARDS, generateHealthInsights } from '../utils/nutritionCalculator';

export default function NutritionSummaryCard({ totals, plateItems }) {
  const [copied, setCopied] = useState(false);
  const insights = generateHealthInsights(plateItems, totals);

  // 計算百分比
  const vitCPercent = Math.min(250, Math.round((totals.vitamin_c / DRI_STANDARDS.VITAMIN_C_MG) * 100));
  const fiberPercent = Math.min(200, Math.round((totals.dietary_fiber / DRI_STANDARDS.FRUIT_FIBER_GOAL_G) * 100));
  const sugarPercent = Math.min(150, Math.round((totals.sugar / DRI_STANDARDS.SUGAR_MAX_RECOMMENDED_G) * 100));
  const servingRatio = Math.min(200, Math.round((totals.servings / DRI_STANDARDS.DAILY_FRUIT_SERVINGS) * 100));

  const copySummary = () => {
    if (plateItems.length === 0) return;
    const lines = [
      `🥗 我的今日水果拼盤營養報告`,
      `----------------------------`,
      ...plateItems.map(
        (item) => `• ${item.fruit.name} ${item.grams}g (約 ${(item.fruit.nutrition_per_100g.calories * item.grams / 100).toFixed(1)} kcal)`
      ),
      `----------------------------`,
      `總重量: ${totals.totalWeightGrams} g`,
      `總熱量: ${totals.calories} kcal (約 ${totals.servings} 份水果)`,
      `總碳水: ${totals.carbohydrates} g (含糖量: ${totals.sugar} g)`,
      `膳食纖維: ${totals.dietary_fiber} g`,
      `蛋白質: ${totals.protein} g | 脂肪: ${totals.fat} g`,
      `維生素 C: ${totals.vitamin_c} mg (達每日 ${Math.round((totals.vitamin_c / 100) * 100)}%)`,
      `鉀離子: ${totals.potassium} mg`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/60 space-y-6">
      {/* Card Header & Total Calories */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
            拼盤綜合營養統計
          </span>
          <h3 className="text-lg font-bold text-slate-800 mt-2">健康攝取儀表板</h3>
        </div>

        <button
          onClick={copySummary}
          disabled={plateItems.length === 0}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 transition disabled:opacity-40 disabled:pointer-events-none flex items-center space-x-1 text-xs font-medium"
          title="複製文字摘要"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? '已複製！' : '複製摘要'}</span>
        </button>
      </div>

      {/* Main Calories & Servings Display */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-300 font-medium flex items-center space-x-1">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>總熱量累計</span>
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
            {totals.calories}
            <span className="text-sm sm:text-base font-normal text-slate-300 ml-1.5">kcal</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            總重 {totals.totalWeightGrams} g · 水分約 {totals.water} g
          </div>
        </div>

        <div className="text-right border-l border-slate-700/80 pl-5">
          <div className="text-xs text-slate-300 font-medium">水果份量估算</div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">
            {totals.servings}
            <span className="text-xs text-slate-300 font-normal ml-1">份</span>
          </div>
          <div className="text-3xs text-slate-400 mt-0.5">建議每日 2~3 份</div>
        </div>
      </div>

      {/* Macronutrients Bar */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
          <span>三大營養素熱量佔比</span>
          <span className="text-slate-400 text-3xs font-normal">碳水 / 蛋白 / 脂肪</span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${totals.macroPercentages.carb}%` }}
            className="bg-amber-400 h-full transition-all duration-300"
            title={`碳水化合物: ${totals.macroPercentages.carb}%`}
          />
          <div
            style={{ width: `${totals.macroPercentages.protein}%` }}
            className="bg-emerald-500 h-full transition-all duration-300"
            title={`蛋白質: ${totals.macroPercentages.protein}%`}
          />
          <div
            style={{ width: `${totals.macroPercentages.fat}%` }}
            className="bg-rose-400 h-full transition-all duration-300"
            title={`脂肪: ${totals.macroPercentages.fat}%`}
          />
        </div>
        <div className="flex items-center justify-between text-2xs mt-2 text-slate-500">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>碳水: {totals.carbohydrates}g ({totals.macroPercentages.carb}%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>蛋白質: {totals.protein}g ({totals.macroPercentages.protein}%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>脂肪: {totals.fat}g ({totals.macroPercentages.fat}%)</span>
          </div>
        </div>
      </div>

      {/* Key Health Goals Progress */}
      <div className="space-y-3.5 pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          關鍵指標達成度 (對照每日建議值)
        </h4>

        {/* Vitamin C */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium text-slate-700 flex items-center space-x-1">
              <span>維生素 C</span>
              <span className="text-slate-400 text-3xs font-normal">(每日目標 100mg)</span>
            </span>
            <span className="font-bold text-orange-600">
              {totals.vitamin_c} mg
              <span className="text-slate-400 text-2xs font-normal ml-1">({vitCPercent}%)</span>
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, vitCPercent)}%` }}
              className="bg-orange-500 h-full rounded-full transition-all duration-300"
            />
          </div>
        </div>

        {/* Dietary Fiber */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium text-slate-700 flex items-center space-x-1">
              <span>膳食纖維</span>
              <span className="text-slate-400 text-3xs font-normal">(水果建議目標 ~6g)</span>
            </span>
            <span className="font-bold text-emerald-600">
              {totals.dietary_fiber} g
              <span className="text-slate-400 text-2xs font-normal ml-1">({fiberPercent}%)</span>
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, fiberPercent)}%` }}
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            />
          </div>
        </div>

        {/* Sugar Warning Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium text-slate-700 flex items-center space-x-1">
              <span>總糖含量</span>
              <span className="text-slate-400 text-3xs font-normal">(單次建議量 &lt; 30g)</span>
            </span>
            <span className={`font-bold ${totals.sugar > 30 ? 'text-rose-600' : 'text-amber-600'}`}>
              {totals.sugar} g
              {totals.sugar > 30 && <span className="text-3xs font-semibold text-rose-500 ml-1">高糖注意</span>}
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, sugarPercent)}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                totals.sugar > 30 ? 'bg-rose-500' : 'bg-amber-400'
              }`}
            />
          </div>
        </div>

        {/* Potassium */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="font-medium text-slate-600">鉀離子 (電解質)</span>
          <span className="font-bold text-slate-800">{totals.potassium} mg</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600">鎂元素 (放鬆神經)</span>
          <span className="font-bold text-slate-800">{totals.magnesium} mg</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600">鈣質</span>
          <span className="font-bold text-slate-800">{totals.calcium} mg</span>
        </div>
      </div>

      {/* Health Insights / Tips Box */}
      {insights.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>智能飲食建議</span>
          </h4>
          <div className="space-y-2">
            {insights.map((ins, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl text-xs flex items-start space-x-2.5 ${
                  ins.type === 'warning'
                    ? 'bg-amber-50 border border-amber-200/70 text-amber-900'
                    : ins.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200/70 text-emerald-900'
                    : 'bg-sky-50 border border-sky-200/70 text-sky-900'
                }`}
              >
                {ins.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                ) : ins.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">{ins.title}</div>
                  <div className="text-3xs sm:text-xs mt-0.5 opacity-90 leading-relaxed">{ins.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

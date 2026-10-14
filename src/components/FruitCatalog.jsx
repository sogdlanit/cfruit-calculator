import React, { useState, useMemo } from 'react';
import { Search, Plus, Check, Info, Filter, Sparkles } from 'lucide-react';

export default function FruitCatalog({ fruits, onSelectFruit, onAddToPlate, plateFruitIds }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedTag, setSelectedTag] = useState('全部');

  const categories = useMemo(() => {
    const set = new Set(fruits.map((f) => f.category));
    return ['全部', ...Array.from(set)];
  }, [fruits]);

  const quickFilterTags = [
    '全部',
    '低GI推薦',
    '超高維生素C',
    '高纖維',
    '低糖推薦',
    '低卡首選',
    '高鉀補充電解質',
  ];

  const filteredFruits = useMemo(() => {
    return fruits.filter((fruit) => {
      // 搜尋文字比對 (中文、英文、標籤)
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        fruit.name.toLowerCase().includes(term) ||
        fruit.english_name.toLowerCase().includes(term) ||
        fruit.tags.some((t) => t.toLowerCase().includes(term));

      // 分類過濾
      const matchCategory = selectedCategory === '全部' || fruit.category === selectedCategory;

      // 標籤過濾
      const matchTag =
        selectedTag === '全部' ||
        (selectedTag === '低GI推薦' && fruit.gi_level === 'low') ||
        fruit.tags.some((t) => t.includes(selectedTag.replace('推薦', '').replace('首選', '')));

      return matchSearch && matchCategory && matchTag;
    });
  }, [fruits, searchTerm, selectedCategory, selectedTag]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
              <span>水果營養資料庫</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                共收錄 {fruits.length} 種
              </span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              以衛生福利部食藥署 (TFDA) 與 USDA 為標準，提供完整每 100g 基準與熱量試算。
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜尋水果名稱、英文或功效 (如：芭樂、維生素C)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>
        </div>

        {/* Filter Badges */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          {/* Categories */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-medium shrink-0 flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5" />
              <span>分類：</span>
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
                  selectedCategory === cat
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Health Tags */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-medium shrink-0 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>速選：</span>
            </span>
            {quickFilterTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
                  selectedTag === tag
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fruit Cards Grid */}
      {filteredFruits.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60 shadow-soft">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-bold text-slate-700">找不到符合條件的水果</h3>
          <p className="text-sm text-slate-400 mt-1">請嘗試更換搜尋關鍵字或清除篩選條件</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('全部');
              setSelectedTag('全部');
            }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            重設篩選條件
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFruits.map((fruit) => {
            const inPlate = plateFruitIds.includes(fruit.id);
            return (
              <div
                key={fruit.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/70 hover:border-emerald-300 hover:shadow-card transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:scale-105 transition-transform flex items-center justify-center text-3xl border border-slate-100">
                        {fruit.emoji}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-emerald-700 transition-colors">
                          {fruit.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">{fruit.english_name}</p>
                      </div>
                    </div>
                    {/* GI Badge */}
                    <span
                      className={`text-2xs font-bold px-2 py-0.5 rounded-full ${
                        fruit.gi_level === 'low'
                          ? 'bg-emerald-100 text-emerald-800'
                          : fruit.gi_level === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {fruit.gi_level === 'low' ? '低 GI' : fruit.gi_level === 'medium' ? '中 GI' : '高 GI'}
                    </span>
                  </div>

                  {/* Primary Nutrition Grid (Per 100g) */}
                  <div className="grid grid-cols-4 gap-1.5 py-2.5 px-2 bg-slate-50/80 rounded-xl mb-3 text-center">
                    <div>
                      <div className="text-2xs text-slate-400 font-medium">熱量</div>
                      <div className="text-xs font-bold text-slate-700">
                        {fruit.nutrition_per_100g.calories}
                        <span className="text-3xs text-slate-400 font-normal block -mt-0.5">kcal</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-2xs text-slate-400 font-medium">糖分</div>
                      <div className="text-xs font-bold text-amber-600">
                        {fruit.nutrition_per_100g.sugar}
                        <span className="text-3xs text-slate-400 font-normal block -mt-0.5">g</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-2xs text-slate-400 font-medium">纖維</div>
                      <div className="text-xs font-bold text-emerald-600">
                        {fruit.nutrition_per_100g.dietary_fiber}
                        <span className="text-3xs text-slate-400 font-normal block -mt-0.5">g</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-2xs text-slate-400 font-medium">維C</div>
                      <div className="text-xs font-bold text-orange-600">
                        {fruit.nutrition_per_100g.vitamin_c}
                        <span className="text-3xs text-slate-400 font-normal block -mt-0.5">mg</span>
                      </div>
                    </div>
                  </div>

                  {/* Highlight Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {fruit.tags.slice(0, 2).map((tag, i) => (
                      <span key={i} className="text-3xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
                  <button
                    onClick={() => onSelectFruit(fruit)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-600 transition flex items-center justify-center space-x-1"
                  >
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>查看詳情</span>
                  </button>

                  <button
                    onClick={() => onAddToPlate(fruit, fruit.serving_unit?.grams || 100)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center space-x-1 transition shadow-xs ${
                      inPlate
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    }`}
                  >
                    {inPlate ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{inPlate ? '再加一份' : '加到拼盤'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

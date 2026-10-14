import React, { useState } from 'react';
import fruitsData from './data/fruits.json';
import Navbar from './components/Navbar';
import PlateCalculator from './components/PlateCalculator';
import FruitCatalog from './components/FruitCatalog';
import FruitComparison from './components/FruitComparison';
import FruitDetailModal from './components/FruitDetailModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('plate');
  const [plateItems, setPlateItems] = useState([
    { fruit: fruitsData.find((f) => f.id === 'guava_pearl') || fruitsData[0], grams: 150 },
    { fruit: fruitsData.find((f) => f.id === 'kiwi_gold') || fruitsData[6], grams: 90 },
  ]);
  const [selectedModalFruit, setSelectedModalFruit] = useState(null);

  // 加水果到拼盤 (若已存在則累加重量，若不存在則新增)
  const handleAddToPlate = (fruit, grams) => {
    setPlateItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.fruit.id === fruit.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].grams = Math.min(1000, updated[existingIdx].grams + grams);
        return updated;
      }
      return [...prev, { fruit, grams }];
    });
  };

  const handleUpdateGrams = (index, newGrams) => {
    setPlateItems((prev) => {
      const updated = [...prev];
      updated[index].grams = newGrams;
      return updated;
    });
  };

  const handleRemoveItem = (index) => {
    setPlateItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearPlate = () => {
    setPlateItems([]);
  };

  const handleApplyPreset = (presetKey) => {
    const findF = (id) => fruitsData.find((f) => f.id === id);

    switch (presetKey) {
      case 'weight_loss':
        setPlateItems([
          { fruit: findF('guava_pearl'), grams: 150 },
          { fruit: findF('kiwi_green'), grams: 85 },
          { fruit: findF('blueberry'), grams: 50 },
        ].filter(item => item.fruit));
        break;
      case 'vitamin_c':
        setPlateItems([
          { fruit: findF('kiwi_gold'), grams: 90 },
          { fruit: findF('strawberry'), grams: 100 },
          { fruit: findF('guava_red'), grams: 100 },
        ].filter(item => item.fruit));
        break;
      case 'workout':
        setPlateItems([
          { fruit: findF('banana'), grams: 120 },
          { fruit: findF('apple_fuji'), grams: 100 },
        ].filter(item => item.fruit));
        break;
      case 'hydration':
        setPlateItems([
          { fruit: findF('wax_apple'), grams: 110 },
          { fruit: findF('watermelon_red'), grams: 150 },
        ].filter(item => item.fruit));
        break;
      default:
        break;
    }
  };

  const plateFruitIds = plateItems.map((item) => item.fruit.id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        plateCount={plateItems.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'plate' && (
          <PlateCalculator
            plateItems={plateItems}
            onUpdateGrams={handleUpdateGrams}
            onRemoveItem={handleRemoveItem}
            onClearPlate={handleClearPlate}
            onApplyPreset={handleApplyPreset}
            onGoToCatalog={() => setActiveTab('catalog')}
            onOpenDetail={(fruit) => setSelectedModalFruit(fruit)}
          />
        )}

        {activeTab === 'catalog' && (
          <FruitCatalog
            fruits={fruitsData}
            onSelectFruit={(fruit) => setSelectedModalFruit(fruit)}
            onAddToPlate={handleAddToPlate}
            plateFruitIds={plateFruitIds}
          />
        )}

        {activeTab === 'comparison' && (
          <FruitComparison
            fruits={fruitsData}
            onAddToPlate={handleAddToPlate}
          />
        )}
      </main>

      {/* Fruit Detail Modal */}
      {selectedModalFruit && (
        <FruitDetailModal
          fruit={selectedModalFruit}
          onClose={() => setSelectedModalFruit(null)}
          onAddToPlate={handleAddToPlate}
          isAlreadyInPlate={plateFruitIds.includes(selectedModalFruit.id)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>
            🍎 <strong>FruitNutri 水果營養計算機</strong> · 守護您的日常飲食健康
          </p>
          <p className="text-3xs sm:text-xs text-slate-400">
            資料來源標準參考：衛生福利部食品藥物管理署 (TFDA) 台灣食品成分資料庫 & 美國農業部 (USDA FoodData Central)。本程式提供一般營養與健康飲食參考，如有特殊慢性疾病或特殊飲食限制，請遵照專業醫師與營養師指導。
          </p>
        </div>
      </footer>
    </div>
  );
}

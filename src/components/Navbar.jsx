import React from 'react';
import { Apple, Scale, BookOpen, UtensilsCrossed } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, plateCount }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div 
            onClick={() => setActiveTab('plate')}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <span className="text-2xl">🥝</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl text-slate-800 tracking-tight">
                  Fruit<span className="text-emerald-600">Nutri</span>
                </span>
                <span className="text-xs px-2 py-0.5 font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                  衛福部 & USDA 資料庫
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">水果營養成分計算與健康攝取評估</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('plate')}
              className={`relative px-3 sm:px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center space-x-1.5 ${
                activeTab === 'plate'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>水果拼盤計算</span>
              {plateCount > 0 && (
                <span className={`ml-1 px-1.5 py-0.2 rounded-full text-xs font-bold ${
                  activeTab === 'plate' ? 'bg-white text-emerald-700' : 'bg-emerald-500 text-white'
                }`}>
                  {plateCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 sm:px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center space-x-1.5 ${
                activeTab === 'catalog'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>水果百科圖鑑</span>
            </button>

            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3 sm:px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center space-x-1.5 ${
                activeTab === 'comparison'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>雙果 PK 對比</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

import React, { useState } from 'react';
import { TaiwanCounty, RegionCategory } from '../types/travel';
import { TAIWAN_COUNTIES } from '../data/taiwanData';
import { Search, MapPin, Compass, Utensils, Bus } from 'lucide-react';

interface RegionSelectorProps {
  selectedCountyId: string;
  onSelectCounty: (county: TaiwanCounty) => void;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({
  selectedCountyId,
  onSelectCounty,
}) => {
  const [activeTab, setActiveTab] = useState<RegionCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const tabs: { key: RegionCategory | 'all'; label: string }[] = [
    { key: 'all', label: '全台灣 (本島與外島)' },
    { key: 'north', label: '北部地區' },
    { key: 'central', label: '中部地區' },
    { key: 'south', label: '南部地區' },
    { key: 'east', label: '東部地區' },
    { key: 'islands', label: '外島地區 (澎湖/金門/馬祖/綠島/蘭嶼/小琉球)' },
  ];

  const filteredCounties = TAIWAN_COUNTIES.filter(c => {
    const matchesTab = activeTab === 'all' || c.category === activeTab;
    const matchesSearch =
      searchTerm.trim() === '' ||
      c.name.includes(searchTerm) ||
      c.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tagline.includes(searchTerm) ||
      c.famousFoods.some(f => f.includes(searchTerm)) ||
      c.famousAttractions.some(a => a.includes(searchTerm));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search and Tabs Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium scrollbar-none">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="搜尋縣市、小吃 (例: 牛肉湯、澎湖)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* Grid of Counties */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {filteredCounties.map(county => {
          const isSelected = county.id === selectedCountyId;

          return (
            <button
              key={county.id}
              onClick={() => onSelectCounty(county)}
              className={`group text-left rounded-xl overflow-hidden border transition-all flex flex-col h-full ${
                isSelected
                  ? 'border-amber-600 ring-2 ring-amber-600/20 bg-amber-50/30 shadow-md'
                  : 'border-stone-200 hover:border-amber-400/80 bg-white hover:shadow-sm'
              }`}
            >
              {/* Photo */}
              <div className="relative h-28 w-full overflow-hidden bg-stone-100">
                <img
                  src={county.coverImage}
                  alt={county.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent"></div>

                {county.isIsland && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 bg-blue-600/90 text-white rounded">
                    外島名勝
                  </span>
                )}

                <div className="absolute bottom-2 left-2.5 right-2">
                  <h4 className="text-sm font-bold text-white drop-shadow-sm">
                    {county.name}
                  </h4>
                  <p className="text-[10px] text-stone-200 font-mono">
                    {county.nameEn}
                  </p>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-2.5 flex-1 flex flex-col justify-between text-xs space-y-2">
                <p className="text-stone-600 line-clamp-2 text-[11px] leading-relaxed">
                  {county.tagline}
                </p>

                <div className="space-y-1 pt-1 border-t border-stone-100 text-[10px] text-stone-500">
                  <div className="flex items-center gap-1 text-amber-700 truncate">
                    <Utensils className="w-3 h-3 shrink-0" />
                    <span className="truncate">{county.famousFoods.slice(0, 2).join('、')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-700 truncate">
                    <Compass className="w-3 h-3 shrink-0" />
                    <span className="truncate">{county.famousAttractions.slice(0, 2).join('、')}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

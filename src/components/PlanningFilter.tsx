import React from 'react';
import { TransportMode, TravelTheme } from '../types/travel';
import { Calendar, Bus, Car, Bike, Footprints, Sparkles, SlidersHorizontal } from 'lucide-react';

interface PlanningFilterProps {
  days: number;
  onSelectDays: (days: number) => void;
  transportMode: TransportMode;
  onSelectTransportMode: (mode: TransportMode) => void;
  theme: TravelTheme;
  onSelectTheme: (theme: TravelTheme) => void;
  onOpenAICustom: () => void;
}

export const PlanningFilter: React.FC<PlanningFilterProps> = ({
  days,
  onSelectDays,
  transportMode,
  onSelectTransportMode,
  theme,
  onSelectTheme,
  onOpenAICustom,
}) => {
  const dayOptions = [
    { value: 1, label: '1天快閃' },
    { value: 2, label: '2天1夜' },
    { value: 3, label: '3天2夜' },
    { value: 4, label: '4天3夜' },
    { value: 5, label: '5天深度' },
  ];

  const transportOptions: { mode: TransportMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { mode: 'public', label: '大眾運輸', icon: <Bus className="w-4 h-4" />, desc: '捷運/台鐵/台灣好行' },
    { mode: 'car', label: '租車自駕', icon: <Car className="w-4 h-4" />, desc: '行程自由/遠離市區' },
    { mode: 'scooter', label: '機車漫遊', icon: '🛵', desc: '穿梭巷弄/外島必選' },
    { mode: 'cycling', label: '單車鐵馬', icon: <Bike className="w-4 h-4" />, desc: '綠道慢活/低碳運動' },
    { mode: 'walking', label: '散策健行', icon: <Footprints className="w-4 h-4" />, desc: '古蹟老街/純粹步行' },
  ];

  const themeOptions: { key: TravelTheme; label: string; icon: string }[] = [
    { key: 'food', label: '道地美食', icon: '🍜' },
    { key: 'nature', label: '自然山海', icon: '🌲' },
    { key: 'culture', label: '歷史古蹟', icon: '🏛️' },
    { key: 'relax', label: '溫泉療癒', icon: '♨️' },
    { key: 'family', label: '親子同行', icon: '👨‍👩‍👧' },
    { key: 'photo', label: '網美打卡', icon: '📸' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-amber-600" />
          <h3 className="font-bold text-stone-900 text-sm">客製化行程參數設定</h3>
        </div>
        <button
          onClick={onOpenAICustom}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          進階 AI 專屬微調需求
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Days Selector */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-2">
            📅 預計停留天數
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {dayOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => onSelectDays(opt.value)}
                className={`py-2 text-xs font-semibold rounded-lg transition-all text-center ${
                  days === opt.value
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-50 border border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transport Mode */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-2">
            🚗 出行與交通方式
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {transportOptions.map(opt => (
              <button
                key={opt.mode}
                onClick={() => onSelectTransportMode(opt.mode)}
                className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-all flex flex-col items-center justify-center gap-1 border ${
                  transportMode === opt.mode
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
                title={opt.desc}
              >
                <span className="text-base">{opt.icon}</span>
                <span className="text-[11px] whitespace-nowrap">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theme Preferences */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-2">
            🎯 偏好旅遊主題
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {themeOptions.map(th => (
              <button
                key={th.key}
                onClick={() => onSelectTheme(th.key)}
                className={`py-1.5 px-1 text-xs font-medium rounded-lg transition-all flex flex-col items-center justify-center gap-1 border ${
                  theme === th.key
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span>{th.icon}</span>
                <span className="text-[11px] whitespace-nowrap">{th.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

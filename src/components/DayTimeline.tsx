import React, { useState } from 'react';
import { DayItinerary, Spot, TransportMode } from '../types/travel';
import { Clock, MapPin, Utensils, Bed, Bus, ChevronDown, ChevronUp, AlertCircle, Compass } from 'lucide-react';

interface DayTimelineProps {
  dayData: DayItinerary;
  transportMode: TransportMode;
  selectedSpotId?: string;
  onSelectSpot?: (spotId: string) => void;
}

export const DayTimeline: React.FC<DayTimelineProps> = ({
  dayData,
  transportMode,
  selectedSpotId,
  onSelectSpot,
}) => {
  const [expandedSpots, setExpandedSpots] = useState<Record<string, boolean>>({
    [dayData.spots[0]?.id || '']: true,
  });

  const toggleExpand = (id: string) => {
    setExpandedSpots(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4">
      {/* Day Overview Banner */}
      <div className="bg-amber-500/10 border border-amber-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            Day {dayData.dayNumber} 核心摘要
          </span>
          <h3 className="text-base font-bold text-stone-900 mt-0.5">
            {dayData.dayTitle}
          </h3>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl">
            {dayData.summary}
          </p>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-stone-500 block">當日預估花費 (含餐食交通)</span>
          <span className="text-base font-bold text-amber-700">
            約 NT$ {dayData.dailyBudgetEstimate.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Spot Timeline Cards */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
        {dayData.spots.map((spot, idx) => {
          const isExpanded = expandedSpots[spot.id] ?? false;
          const isSelected = spot.id === selectedSpotId;

          const badgeConfig = {
            food: { bg: 'bg-orange-500', text: 'text-orange-700', label: '🍜 美食推薦', border: 'border-orange-200' },
            stay: { bg: 'bg-indigo-600', text: 'text-indigo-700', label: '🏨 精選旅宿', border: 'border-indigo-200' },
            transport: { bg: 'bg-sky-600', text: 'text-sky-700', label: '🚌 交通接駁', border: 'border-sky-200' },
            attraction: { bg: 'bg-emerald-600', text: 'text-emerald-700', label: '📍 名勝景點', border: 'border-emerald-200' },
          }[spot.category];

          return (
            <div key={spot.id} className="relative group">
              {/* Timeline Node Dot */}
              <div
                className={`absolute -left-6 top-4 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-xs z-10 ${badgeConfig.bg}`}
              >
                {idx + 1}
              </div>

              {/* Transit Notice above card if available */}
              {spot.transitFromPrev && (
                <div className="mb-2 pl-3 py-1.5 text-xs text-stone-600 bg-stone-100 rounded-lg flex items-center gap-2 border border-stone-200/80">
                  <Bus className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="font-semibold text-sky-700">
                    {spot.transitFromPrev.lineName || '接駁指引'}：
                  </span>
                  <span className="truncate">{spot.transitFromPrev.instructions}</span>
                  {spot.transitFromPrev.estimatedFare && (
                    <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-stone-200 text-stone-500 ml-auto mr-2 shrink-0">
                      {spot.transitFromPrev.estimatedFare}
                    </span>
                  )}
                </div>
              )}

              {/* Main Spot Card */}
              <div
                onClick={() => {
                  toggleExpand(spot.id);
                  if (onSelectSpot) onSelectSpot(spot.id);
                }}
                className={`bg-white rounded-xl border transition-all cursor-pointer overflow-hidden ${
                  isSelected
                    ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                    : 'border-stone-200 hover:border-amber-300 hover:shadow-xs'
                }`}
              >
                <div className="p-4 flex flex-col md:flex-row gap-4 items-start">
                  {/* Photo */}
                  <img
                    src={spot.photoUrl}
                    alt={spot.name}
                    className="w-full md:w-36 h-28 object-cover rounded-lg shrink-0 bg-stone-100"
                    loading="lazy"
                  />

                  {/* Header Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`font-bold ${badgeConfig.text}`}>
                          {badgeConfig.label}
                        </span>
                        <span className="text-stone-300">·</span>
                        <span className="text-stone-500 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {spot.timeSlot}
                        </span>
                      </div>

                      <div className="text-stone-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-stone-900 mt-1">
                      {spot.name}
                    </h4>

                    <p className="text-xs text-stone-500 flex items-center gap-1 mt-1 truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-stone-400" />
                      {spot.address}
                    </p>

                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      {spot.description}
                    </p>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-stone-100 bg-stone-50/50 space-y-3 text-xs">
                    {/* Specific Food Detail Box */}
                    {spot.foodDetail && (
                      <div className="bg-orange-50 border border-orange-200/80 rounded-lg p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-orange-900 flex items-center gap-1.5">
                            <Utensils className="w-3.5 h-3.5 text-orange-600" />
                            招牌推薦：{spot.foodDetail.signatureDish}
                          </span>
                          <span className="text-orange-700 font-semibold text-[11px]">
                            {spot.foodDetail.priceRange}
                          </span>
                        </div>
                        <p className="text-orange-800 text-[11px] leading-relaxed">
                          <strong>特色亮點：</strong>
                          {spot.foodDetail.mustTryReason}
                        </p>
                      </div>
                    )}

                    {/* Specific Stay Detail Box */}
                    {spot.stayDetail && (
                      <div className="bg-indigo-50 border border-indigo-200/80 rounded-lg p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                            <Bed className="w-3.5 h-3.5 text-indigo-600" />
                            房型價位：{spot.stayDetail.pricePerNight}
                          </span>
                          <span className="text-indigo-700 font-semibold text-[11px]">
                            {spot.stayDetail.type === 'bnb' ? '特色民宿' : '精選飯店'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {spot.stayDetail.features.map((feat, fIdx) => (
                            <span
                              key={fIdx}
                              className="text-[10px] bg-white border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded"
                            >
                              ✓ {feat}
                            </span>
                          ))}
                        </div>
                        <p className="text-indigo-800 text-[11px] pt-1">
                          <strong>預約建議：</strong>
                          {spot.stayDetail.bookingAdvice}
                        </p>
                      </div>
                    )}

                    {/* Highlights tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-stone-400 font-semibold text-[11px]">亮點：</span>
                      {spot.highlights.map((hl, hIdx) => (
                        <span
                          key={hIdx}
                          className="bg-white border border-stone-200 text-stone-700 px-2 py-0.5 rounded text-[11px]"
                        >
                          {hl}
                        </span>
                      ))}
                    </div>

                    {/* Travel tips */}
                    {spot.tips && (
                      <div className="flex items-start gap-1.5 text-amber-800 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200/60">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                        <span className="text-[11px] leading-relaxed">
                          <strong>貼心叮嚀：</strong>
                          {spot.tips}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

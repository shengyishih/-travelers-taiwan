import React from 'react';
import { TravelPlan, Spot } from '../types/travel';
import { Utensils, Bed, MapPin, DollarSign, Sparkles, CheckCircle2 } from 'lucide-react';

interface FoodAndStaySectionProps {
  plan: TravelPlan;
}

export const FoodAndStaySection: React.FC<FoodAndStaySectionProps> = ({ plan }) => {
  // Collect all food spots across all days
  const allFoodSpots: Spot[] = [];
  const allStaySpots: Spot[] = [];

  plan.itinerary.forEach(day => {
    day.spots.forEach(spot => {
      if (spot.category === 'food') allFoodSpots.push(spot);
    });
    if (day.dayStay) allStaySpots.push(day.dayStay);
  });

  return (
    <div className="space-y-8">
      {/* Food Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-sm">
              🍜
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-lg">
                {plan.destinationName}・饕客必吃道地美饌
              </h3>
              <p className="text-xs text-stone-500">
                嚴選名店、夜市攤商與老字號招牌風味
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
            共精選 {allFoodSpots.length} 間味蕾體驗
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allFoodSpots.map((spot, idx) => (
            <div
              key={`${spot.id}-${idx}`}
              className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:border-orange-300 hover:shadow-sm transition-all flex flex-col"
            >
              <div className="relative h-44 w-full bg-stone-100">
                <img
                  src={spot.photoUrl}
                  alt={spot.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-2.5 left-2.5 bg-orange-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-xs">
                  必吃推薦 #{idx + 1}
                </div>
                {spot.foodDetail?.priceRange && (
                  <div className="absolute bottom-2.5 right-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded">
                    {spot.foodDetail.priceRange}
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-stone-900 text-base">
                    {spot.name}
                  </h4>
                  <p className="text-xs text-stone-500 flex items-center gap-1 mt-1 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-stone-400" />
                    {spot.address}
                  </p>
                </div>

                {spot.foodDetail && (
                  <div className="bg-orange-50/70 border border-orange-200/60 rounded-lg p-3 space-y-1 text-xs">
                    <div className="font-semibold text-orange-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      招牌必點：{spot.foodDetail.signatureDish}
                    </div>
                    <p className="text-orange-900 text-[11px] leading-relaxed">
                      {spot.foodDetail.mustTryReason}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                  {spot.highlights.map((h, hIdx) => (
                    <span
                      key={hIdx}
                      className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accommodations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-sm">
              🏨
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-lg">
                {plan.destinationName}・精選住宿評選
              </h3>
              <p className="text-xs text-stone-500">
                兼具交通便利、在地氛圍與舒適休憩的優質旅店
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
            推薦下榻指南
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allStaySpots.map((stay, idx) => (
            <div
              key={`${stay.id}-${idx}`}
              className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col"
            >
              <div className="relative h-48 w-full bg-stone-100">
                <img
                  src={stay.photoUrl}
                  alt={stay.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-2.5 left-2.5 bg-indigo-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-xs">
                  Day {idx + 1} 下榻旅宿
                </div>
                {stay.stayDetail?.pricePerNight && (
                  <div className="absolute bottom-2.5 right-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded">
                    每晚 {stay.stayDetail.pricePerNight}
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-stone-900 text-base">
                    {stay.name}
                  </h4>
                  <p className="text-xs text-stone-500 flex items-center gap-1 mt-1 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-stone-400" />
                    {stay.address}
                  </p>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    {stay.description}
                  </p>
                </div>

                {stay.stayDetail && (
                  <div className="bg-indigo-50/60 border border-indigo-200/60 rounded-lg p-3 space-y-2 text-xs">
                    <div className="flex flex-wrap gap-1.5">
                      {stay.stayDetail.features.map((feat, fIdx) => (
                        <span
                          key={fIdx}
                          className="text-[11px] bg-white border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded flex items-center gap-1 font-medium"
                        >
                          <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                          {feat}
                        </span>
                      ))}
                    </div>
                    <p className="text-indigo-900 text-[11px]">
                      <strong>預約攻略：</strong>
                      {stay.stayDetail.bookingAdvice}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

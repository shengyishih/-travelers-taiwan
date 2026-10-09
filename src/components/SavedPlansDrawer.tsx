import React from 'react';
import { TravelPlan } from '../types/travel';
import { X, Trash2, Calendar, MapPin, ExternalLink, BookmarkCheck } from 'lucide-react';

interface SavedPlansDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedPlans: TravelPlan[];
  onSelectPlan: (plan: TravelPlan) => void;
  onDeletePlan: (planId: string) => void;
}

export const SavedPlansDrawer: React.FC<SavedPlansDrawerProps> = ({
  isOpen,
  onClose,
  savedPlans,
  onSelectPlan,
  onDeletePlan,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex justify-end bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-stone-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-stone-900 text-base">我的收藏行程 ({savedPlans.length})</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of plans */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedPlans.length === 0 ? (
            <div className="text-center py-16 text-stone-400 space-y-2">
              <BookmarkCheck className="w-12 h-12 mx-auto stroke-[1.5] text-stone-300" />
              <p className="text-sm font-medium text-stone-600">尚無收藏的行程</p>
              <p className="text-xs text-stone-400">
                點擊主頁面上的「收藏此行程」按鈕即可保存。
              </p>
            </div>
          ) : (
            savedPlans.map(plan => (
              <div
                key={plan.id}
                className="bg-white border border-stone-200 rounded-xl p-3 hover:border-amber-400 transition-all shadow-2xs group flex flex-col justify-between gap-2"
              >
                <div className="flex gap-3">
                  <img
                    src={plan.coverImage}
                    alt={plan.title}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-stone-900 text-sm truncate group-hover:text-amber-700 transition-colors">
                      {plan.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        {plan.destinationName}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {plan.days} 天
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 truncate mt-1">
                      預算約 NT$ {plan.totalBudgetEstimate.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <button
                    onClick={() => {
                      onSelectPlan(plan);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-amber-700 hover:text-amber-800 font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    載入此行程
                  </button>
                  <button
                    onClick={() => onDeletePlan(plan.id)}
                    className="text-stone-400 hover:text-red-600 p-1 rounded transition-colors"
                    title="刪除收藏"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

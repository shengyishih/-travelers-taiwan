import React from 'react';
import { Compass, Bookmark, Printer, Sparkles, MapPin, Volume2 } from 'lucide-react';

interface NavbarProps {
  onPrint: () => void;
  savedCount: number;
  onOpenSavedDrawer: () => void;
  onScrollToExplore: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onPrint,
  savedCount,
  onOpenSavedDrawer,
  onScrollToExplore,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-stone-900 text-lg tracking-tight">
                島嶼行旅
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                台灣全島 · 離島探尋
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              台灣全境各縣市旅遊規劃師 · Canvas 視覺儀表板 · 語音導覽
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onScrollToExplore}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>探索縣市</span>
          </button>

          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200"
            title="列印或另存為 PDF"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">列印行程</span>
          </button>

          <button
            onClick={onOpenSavedDrawer}
            className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-600" />
            <span>我的收藏</span>
            {savedCount > 0 && (
              <span className="ml-0.5 w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-bold">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

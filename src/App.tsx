import React, { useState, useEffect, useRef } from 'react';
import { TaiwanCounty, TravelPlan, TransportMode, TravelTheme } from './types/travel';
import { TAIWAN_COUNTIES } from './data/taiwanData';
import { buildItinerary } from './services/plannerService';
import { Navbar } from './components/Navbar';
import { RegionSelector } from './components/RegionSelector';
import { PlanningFilter } from './components/PlanningFilter';
import { CanvasDashboard } from './components/CanvasDashboard';
import { TravelMap } from './components/TravelMap';
import { DayTimeline } from './components/DayTimeline';
import { FoodAndStaySection } from './components/FoodAndStaySection';
import { VoiceGuidePlayer } from './components/VoiceGuidePlayer';
import { AICustomModal } from './components/AICustomModal';
import { SavedPlansDrawer } from './components/SavedPlansDrawer';
import {
  Sparkles,
  MapPin,
  Calendar,
  Bus,
  Bookmark,
  Share2,
  Check,
  Umbrella,
  Briefcase,
  ChevronRight,
  TrendingUp,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Current settings
  const [selectedCounty, setSelectedCounty] = useState<TaiwanCounty>(
    TAIWAN_COUNTIES.find(c => c.id === 'tainan') || TAIWAN_COUNTIES[0]
  );
  const [days, setDays] = useState<number>(2);
  const [transportMode, setTransportMode] = useState<TransportMode>('public');
  const [theme, setTheme] = useState<TravelTheme>('food');
  const [activeDay, setActiveDay] = useState<number>(1);
  const [selectedSpotId, setSelectedSpotId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'canvas' | 'map' | 'timeline' | 'foodstay'>('canvas');

  // Plan state
  const [currentPlan, setCurrentPlan] = useState<TravelPlan>(() =>
    buildItinerary('tainan', 2, 'public', 'food')
  );

  // Saved plans
  const [savedPlans, setSavedPlans] = useState<TravelPlan[]>([]);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState<boolean>(false);
  const [isAICustomOpen, setIsAICustomOpen] = useState<boolean>(false);
  const [isAILoading, setIsAILoading] = useState<boolean>(false);
  const [justCopied, setJustCopied] = useState<boolean>(false);

  const exploreRef = useRef<HTMLDivElement | null>(null);

  // Load saved plans from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('taiwan_saved_plans');
      if (stored) {
        setSavedPlans(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load saved plans:', e);
    }
  }, []);

  // Update plan when county, days, transport, or theme change
  useEffect(() => {
    const updated = buildItinerary(selectedCounty.id, days, transportMode, theme);
    setCurrentPlan(updated);
    setActiveDay(1);
    setSelectedSpotId(undefined);
  }, [selectedCounty.id, days, transportMode, theme]);

  const handleSelectCounty = (county: TaiwanCounty) => {
    setSelectedCounty(county);
    // If island, default scooter is common, else preserve or choose public
    if (county.isIsland && transportMode === 'cycling') {
      setTransportMode('scooter');
    }
  };

  const handleSaveCurrentPlan = () => {
    setSavedPlans(prev => {
      const exists = prev.some(p => p.id === currentPlan.id);
      let next;
      if (exists) {
        next = prev.filter(p => p.id !== currentPlan.id);
      } else {
        next = [currentPlan, ...prev];
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
        });
      }
      localStorage.setItem('taiwan_saved_plans', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteSavedPlan = (id: string) => {
    setSavedPlans(prev => {
      const next = prev.filter(p => p.id !== id);
      localStorage.setItem('taiwan_saved_plans', JSON.stringify(next));
      return next;
    });
  };

  const handleSelectSavedPlan = (plan: TravelPlan) => {
    setCurrentPlan(plan);
    setDays(plan.days);
    setTransportMode(plan.transportMode);
    setTheme(plan.theme);
    const county = TAIWAN_COUNTIES.find(c => c.id === plan.destinationId);
    if (county) setSelectedCounty(county);
    setActiveDay(1);
  };

  const handleShareLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToExplore = () => {
    exploreRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle AI Custom Prompt
  const handleAICustomPrompt = async (prompt: string) => {
    setIsAILoading(true);
    try {
      const response = await fetch('/api/ai-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: selectedCounty.name,
          days,
          transportMode,
          theme,
          customPrompt: prompt,
        }),
      });

      const data = await response.json();
      if (data.success && data.plan) {
        // Merge generated fields into plan
        const aiPlan = data.plan;
        setCurrentPlan(prev => ({
          ...prev,
          title: aiPlan.title || prev.title,
          summary: aiPlan.summary || prev.summary,
          voiceScript: aiPlan.voiceScript || prev.voiceScript,
          totalBudgetEstimate: aiPlan.totalBudgetEstimate || prev.totalBudgetEstimate,
          packingAdvice: aiPlan.packingAdvice || prev.packingAdvice,
          transportAdvice: aiPlan.transportAdvice || prev.transportAdvice,
        }));
      } else {
        // Local synthesis fallback with user custom note applied
        const customPlan = buildItinerary(selectedCounty.id, days, transportMode, theme, prompt);
        setCurrentPlan(customPlan);
      }
      setIsAICustomOpen(false);
      confetti({ particleCount: 50, spread: 60 });
    } catch (err) {
      console.error(err);
      const customPlan = buildItinerary(selectedCounty.id, days, transportMode, theme, prompt);
      setCurrentPlan(customPlan);
      setIsAICustomOpen(false);
    } finally {
      setIsAILoading(false);
    }
  };

  const isCurrentPlanSaved = savedPlans.some(p => p.id === currentPlan.id);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col selection:bg-amber-200">
      {/* Navigation */}
      <Navbar
        onPrint={handlePrint}
        savedCount={savedPlans.length}
        onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
        onScrollToExplore={scrollToExplore}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 w-full">
        {/* Hero Banner */}
        <section className="relative rounded-3xl overflow-hidden bg-stone-900 text-white shadow-xl">
          <div className="absolute inset-0">
            <img
              src={selectedCounty.coverImage}
              alt={selectedCounty.name}
              className="w-full h-full object-cover opacity-40 mix-blend-luminosity scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/80 to-stone-900/40"></div>
          </div>

          <div className="relative p-6 sm:p-10 max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-500 text-stone-950 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                {selectedCounty.name}
              </span>
              {selectedCounty.isIsland && (
                <span className="bg-blue-600/90 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  外島海島巡禮
                </span>
              )}
              <span className="text-stone-300 text-xs font-mono">
                {selectedCounty.nameEn}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {currentPlan.title}
            </h1>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              {currentPlan.summary}
            </p>

            {/* Quick summary stats */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-stone-300 border-t border-stone-800">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>
                  <strong>天數：</strong>{days} 天
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bus className="w-4 h-4 text-amber-400" />
                <span>
                  <strong>方式：</strong>
                  {transportMode === 'public'
                    ? '大眾運輸 (捷運/公車)'
                    : transportMode === 'car'
                    ? '自駕租車'
                    : '機車自由行'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>
                  <strong>預算：</strong>約 NT$ {currentPlan.totalBudgetEstimate.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Save & Share actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleSaveCurrentPlan}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  isCurrentPlanSaved
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{isCurrentPlanSaved ? '已收藏此行程' : '收藏此行程'}</span>
              </button>

              <button
                onClick={handleShareLink}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
              >
                {justCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{justCopied ? '已複製連結！' : '分享行程'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Voice Assistant Speech Synthesis Bar */}
        <VoiceGuidePlayer
          script={currentPlan.voiceScript}
          title={currentPlan.title}
          destination={selectedCounty.name}
        />

        {/* Planning Filter Controls (Days, Transport, Theme) */}
        <section>
          <PlanningFilter
            days={days}
            onSelectDays={setDays}
            transportMode={transportMode}
            onSelectTransportMode={setTransportMode}
            theme={theme}
            onSelectTheme={setTheme}
            onOpenAICustom={() => setIsAICustomOpen(true)}
          />
        </section>

        {/* Interactive Workspace Navigation Tabs */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('canvas')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'canvas'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80 hover:bg-stone-50'
              }`}
            >
              <span>🎨</span>
              <span>Canvas 視覺化儀表板</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'map'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80 hover:bg-stone-50'
              }`}
            >
              <span>🗺️</span>
              <span>路線互動地圖</span>
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'timeline'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80 hover:bg-stone-50'
              }`}
            >
              <span>📅</span>
              <span>每日詳細時程與轉乘</span>
            </button>

            <button
              onClick={() => setActiveTab('foodstay')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'foodstay'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80 hover:bg-stone-50'
              }`}
            >
              <span>🍜</span>
              <span>必吃美食與旅宿專區</span>
            </button>
          </div>

          {/* Tab Panes */}
          <div>
            {activeTab === 'canvas' && (
              <div className="space-y-6">
                <CanvasDashboard
                  plan={currentPlan}
                  activeDay={activeDay}
                  onSelectDay={setActiveDay}
                />
              </div>
            )}

            {activeTab === 'map' && (
              <div className="space-y-6">
                <TravelMap
                  plan={currentPlan}
                  activeDay={activeDay}
                  onSelectDay={setActiveDay}
                  selectedSpotId={selectedSpotId}
                  onSelectSpot={setSelectedSpotId}
                />
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-6">
                {/* Day selector buttons */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  {currentPlan.itinerary.map(day => (
                    <button
                      key={day.dayNumber}
                      onClick={() => setActiveDay(day.dayNumber)}
                      className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${
                        activeDay === day.dayNumber
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      Day {day.dayNumber} 行程
                    </button>
                  ))}
                </div>

                {currentPlan.itinerary
                  .filter(d => d.dayNumber === activeDay)
                  .map(day => (
                    <DayTimeline
                      key={day.dayNumber}
                      dayData={day}
                      transportMode={transportMode}
                      selectedSpotId={selectedSpotId}
                      onSelectSpot={setSelectedSpotId}
                    />
                  ))}
              </div>
            )}

            {activeTab === 'foodstay' && (
              <FoodAndStaySection plan={currentPlan} />
            )}
          </div>
        </section>

        {/* Travel Prep Tips (Packing, Weather, Public Transit Tips) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-stone-200">
          <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-2">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
              <Umbrella className="w-4 h-4 text-blue-600" />
              <span>氣候與穿搭叮嚀</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {currentPlan.weatherAdvice}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-2">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
              <Bus className="w-4 h-4 text-emerald-600" />
              <span>大眾運輸與交通概況</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {currentPlan.transportAdvice}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-2">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
              <Briefcase className="w-4 h-4 text-amber-600" />
              <span>必備隨身清單建議</span>
            </div>
            <ul className="text-xs text-stone-600 space-y-1 list-disc list-inside">
              {currentPlan.packingAdvice.map((item, idx) => (
                <li key={idx} className="truncate">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Taiwan Explorer Region Selector Section */}
        <section ref={exploreRef} className="pt-8 border-t border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                探索台灣本島與外島全境各縣市
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                點選下方任一縣市或離島，即可即時切換產生專屬客製旅遊路線
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
              全台 22 縣市與離島全面收錄
            </span>
          </div>

          <RegionSelector
            selectedCountyId={selectedCounty.id}
            onSelectCounty={handleSelectCounty}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-8 mt-16 text-center text-xs text-stone-500 space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Compass className="w-4 h-4 text-amber-600" />
          <span className="font-bold text-stone-800">島嶼行旅 · 台灣智慧旅遊規劃師</span>
        </div>
        <p>
          專為台灣本島各縣市與外島量身規劃 · 包含美食特色店家、精選旅宿、大眾運輸路線、Canvas 視覺儀表板與語音行程導覽
        </p>
        <p className="text-stone-400">
          Designed with ❤️ for travelers in Taiwan
        </p>
      </footer>

      {/* AI Customization Modal */}
      <AICustomModal
        isOpen={isAICustomOpen}
        onClose={() => setIsAICustomOpen(false)}
        destination={selectedCounty.name}
        days={days}
        transportMode={transportMode === 'public' ? '大眾運輸' : transportMode === 'car' ? '自駕租車' : '機車漫遊'}
        theme={theme}
        onSubmitCustomPrompt={handleAICustomPrompt}
        isLoading={isAILoading}
      />

      {/* Saved Plans Drawer */}
      <SavedPlansDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedPlans={savedPlans}
        onSelectPlan={handleSelectSavedPlan}
        onDeletePlan={handleDeleteSavedPlan}
      />
    </div>
  );
}

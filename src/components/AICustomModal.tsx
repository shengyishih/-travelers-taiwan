import React, { useState } from 'react';
import { X, Sparkles, Loader2, Send } from 'lucide-react';

interface AICustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
  days: number;
  transportMode: string;
  theme: string;
  onSubmitCustomPrompt: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

export const AICustomModal: React.FC<AICustomModalProps> = ({
  isOpen,
  onClose,
  destination,
  days,
  transportMode,
  theme,
  onSubmitCustomPrompt,
  isLoading,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');

  if (!isOpen) return null;

  const quickPicks = [
    '同行有長輩與小孩，希望行程步調放慢、避開長途爬坡與樓梯',
    '熱愛品嚐手搖飲與夜市傳統小吃，請多安排在地排隊名店',
    '重視放鬆療癒，希望能有溫泉泡湯與景觀咖啡廳下午茶',
    '喜愛攝影與網美打卡，想要在日出與夕陽時段安排絕景機位',
    '全程依靠大眾運輸捷運與公車，希望轉乘步行時間越短越好',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim() && !isLoading) return;
    await onSubmitCustomPrompt(customPrompt);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">AI 專屬客製化微調</h3>
              <p className="text-xs text-stone-500">
                以 Gemini 智慧生成更貼合個人喜好的專屬細節
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 text-xs text-stone-700">
            <strong>目前設定：</strong>
            <span className="text-amber-900">
              {destination} · {days}天 · {transportMode} · {theme}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              請描述您的特殊同行人員或喜好需求：
            </label>
            <textarea
              rows={4}
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              placeholder="例如：我們是情侶出遊，希望在黃昏時能欣賞夕陽海景，晚上想吃精緻居酒屋，且第二天早上不想太早起..."
              className="w-full p-3 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 resize-none text-stone-800"
              disabled={isLoading}
            />
          </div>

          {/* Quick suggestions */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-stone-500 block">
              💡 快速選用常見需求：
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickPicks.map((pick, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setCustomPrompt(pick)}
                  className="text-[11px] text-stone-600 hover:text-amber-800 bg-stone-100 hover:bg-amber-50 border border-stone-200 hover:border-amber-200 px-2.5 py-1 rounded-lg text-left transition-colors"
                >
                  + {pick}
                </button>
              ))}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading || !customPrompt.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>AI 正在精準推算中...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>生成專屬規劃</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

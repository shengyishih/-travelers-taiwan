import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, FastForward, Sparkles } from 'lucide-react';

interface VoiceGuidePlayerProps {
  script: string;
  title: string;
  destination: string;
}

export const VoiceGuidePlayer: React.FC<VoiceGuidePlayerProps> = ({
  script,
  title,
  destination,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [rate, setRate] = useState<number>(1.0);
  const [supported, setSupported] = useState<boolean>(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }

    // Stop speaking when script changes
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [script]);

  const handlePlay = () => {
    if (!supported) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(script);
    utteranceRef.current = utterance;

    // Pick best Chinese voice
    const voices = window.speechSynthesis.getVoices();
    const twVoice = voices.find(v => v.lang === 'zh-TW' || v.lang === 'zh-HK' || v.lang.startsWith('zh'));
    if (twVoice) {
      utterance.voice = twVoice;
    }
    utterance.lang = 'zh-TW';
    utterance.rate = rate;
    utterance.pitch = 1.05;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn('Speech error:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleToggleRate = () => {
    const nextRate = rate === 1.0 ? 1.25 : rate === 1.25 ? 1.5 : 1.0;
    setRate(nextRate);
    if (isPlaying) {
      handleStop();
      setTimeout(handlePlay, 100);
    }
  };

  if (!supported) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-stone-100 rounded-2xl border border-amber-200/80 p-4 shadow-sm transition-all">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left info & audio wave */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={isPlaying ? handlePause : handlePlay}
              className="w-11 h-11 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shadow-md transition-all active:scale-95"
              aria-label={isPlaying ? '暫停語音' : '播放語音'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            {isPlaying && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                島嶼語音導覽隨身聽
              </span>
              {isPlaying && (
                <div className="flex items-center gap-0.5 h-4">
                  <div className="w-1 bg-amber-600 rounded-full voice-wave-bar" style={{ animationDelay: '0s' }}></div>
                  <div className="w-1 bg-amber-600 rounded-full voice-wave-bar" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 bg-amber-600 rounded-full voice-wave-bar" style={{ animationDelay: '0.4s' }}></div>
                  <div className="w-1 bg-amber-600 rounded-full voice-wave-bar" style={{ animationDelay: '0.1s' }}></div>
                </div>
              )}
            </div>
            <h4 className="text-sm font-bold text-stone-900 mt-0.5">
              語音重點摘要：{destination} 深度精華
            </h4>
          </div>
        </div>

        {/* Right audio controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleRate}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
            title="調整語速"
          >
            {rate}x 語速
          </button>

          {isPlaying && (
            <button
              onClick={handleStop}
              className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-2xs"
              title="停止語音"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={isPlaying ? handlePause : handlePlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow-sm transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>暫停朗讀</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isPaused ? '繼續播放' : '聆聽語音規劃'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Script preview text with quote */}
      <div className="mt-3 pt-3 border-t border-amber-200/60 text-xs text-stone-700 leading-relaxed bg-white/60 p-2.5 rounded-xl">
        <p className="line-clamp-2 italic">
          「{script}」
        </p>
      </div>
    </div>
  );
};

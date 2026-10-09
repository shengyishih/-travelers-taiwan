import React, { useRef, useEffect, useState } from 'react';
import { TravelPlan, DayItinerary, Spot } from '../types/travel';
import { Download, Play, Pause, RotateCcw, Sparkles, Layers, Activity, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CanvasDashboardProps {
  plan: TravelPlan;
  activeDay: number;
  onSelectDay: (day: number) => void;
}

export const CanvasDashboard: React.FC<CanvasDashboardProps> = ({
  plan,
  activeDay,
  onSelectDay,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewMode, setViewMode] = useState<'poster' | 'route' | 'timeline'>('poster');
  const [isAnimating, setIsAnimating] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const currentDayData: DayItinerary =
    plan.itinerary.find(d => d.dayNumber === activeDay) || plan.itinerary[0];

  // Draw Poster on Canvas
  const drawPoster = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#fbfaf8');
    bgGrad.addColorStop(0.5, '#f4ede4');
    bgGrad.addColorStop(1, '#ebe0d0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative frame borders
    ctx.strokeStyle = '#d6c4b2';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, width - 32, height - 32);
    ctx.strokeRect(22, 22, width - 44, height - 44);

    // Header Title Area
    ctx.fillStyle = '#1c1917';
    ctx.font = 'bold 28px "Noto Sans TC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${plan.destinationName}・${plan.days}日行旅繪卷`, width / 2, 60);

    ctx.fillStyle = '#78716c';
    ctx.font = '14px "Noto Sans TC", sans-serif';
    ctx.fillText(`出行方式：${plan.transportMode === 'public' ? '大眾運輸 (捷運/公車)' : plan.transportMode === 'car' ? '自駕租車' : '機車漫遊'}  ·  預算估算：約 NT$ ${plan.totalBudgetEstimate.toLocaleString()}`, width / 2, 88);

    // Day banner pill
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 130, 105, 260, 32, 16);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px "Noto Sans TC", sans-serif';
    ctx.fillText(`${currentDayData.dayTitle}`, width / 2, 126);

    // Visual Timeline Road in center
    const spots = currentDayData.spots;
    const startY = 170;
    const endY = height - 190;
    const stepY = spots.length > 1 ? (endY - startY) / (spots.length - 1) : 0;
    const roadX = 90;

    // Draw road path line
    ctx.beginPath();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3;
    ctx.moveTo(roadX, startY);
    for (let i = 0; i < spots.length; i++) {
      const curY = startY + i * stepY;
      ctx.lineTo(roadX, curY);
    }
    ctx.stroke();
    ctx.setLineDash([]); // reset

    // Draw Spots on Timeline
    spots.forEach((spot, idx) => {
      const spotY = startY + idx * stepY;

      // Outer circle
      ctx.fillStyle = spot.category === 'food' ? '#ea580c' : spot.category === 'stay' ? '#6366f1' : spot.category === 'transport' ? '#0284c7' : '#059669';
      ctx.beginPath();
      ctx.arc(roadX, spotY, 14, 0, Math.PI * 2);
      ctx.fill();

      // Number in circle
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${idx + 1}`, roadX, spotY);

      // Card Box on right
      const boxX = roadX + 28;
      const boxY = spotY - 32;
      const boxW = width - boxX - 40;
      const boxH = 64;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 8);
      ctx.fill();
      ctx.strokeStyle = '#e7e5e4';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Spot Category tag
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = spot.category === 'food' ? '#ea580c' : spot.category === 'stay' ? '#4f46e5' : '#047857';
      ctx.font = 'bold 12px "Noto Sans TC", sans-serif';
      const catText = spot.category === 'food' ? '🍜 必嚐美食' : spot.category === 'stay' ? '🏨 特色旅宿' : spot.category === 'transport' ? '🚌 交通接駁' : '📍 熱門景點';
      ctx.fillText(`${catText}  ${spot.timeSlot}`, boxX + 12, boxY + 10);

      // Spot Name
      ctx.fillStyle = '#1c1917';
      ctx.font = 'bold 14px "Noto Sans TC", sans-serif';
      const truncatedName = spot.name.length > 22 ? spot.name.slice(0, 21) + '...' : spot.name;
      ctx.fillText(truncatedName, boxX + 12, boxY + 28);

      // Subtitle or food specialty
      ctx.fillStyle = '#78716c';
      ctx.font = '12px "Noto Sans TC", sans-serif';
      const subInfo = spot.foodDetail ? `招牌：${spot.foodDetail.signatureDish}` : spot.stayDetail ? `特色：${spot.stayDetail.features.slice(0, 2).join('・')}` : spot.highlights.slice(0, 2).join(' / ');
      const truncatedSub = subInfo.length > 26 ? subInfo.slice(0, 25) + '...' : subInfo;
      ctx.fillText(truncatedSub, boxX + 12, boxY + 45);
    });

    // Bottom Infographic Section: Budget Donut Chart & Notes
    const bottomY = height - 160;

    // Small decorative seal / badge on bottom left
    ctx.save();
    ctx.translate(100, bottomY + 50);
    ctx.rotate(-0.08);
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 2;
    ctx.strokeRect(-45, -25, 90, 50);
    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 13px "Noto Sans TC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('島嶼行旅', 0, -8);
    ctx.font = '10px sans-serif';
    ctx.fillText('TAIWAN TRAVEL', 0, 10);
    ctx.restore();

    // Bottom Summary Card
    const sumX = 180;
    const sumW = width - sumX - 40;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(sumX, bottomY + 10, sumW, 80, 8);
    ctx.fill();
    ctx.strokeStyle = '#e2d9cf';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#44403c';
    ctx.font = 'bold 13px "Noto Sans TC", sans-serif';
    ctx.fillText(`當日精選美食：${currentDayData.dayFoodSummary.join('、')}`, sumX + 14, bottomY + 20);

    ctx.fillStyle = '#78716c';
    ctx.font = '12px "Noto Sans TC", sans-serif';
    ctx.fillText(`下榻推薦：${currentDayData.dayStay.name}`, sumX + 14, bottomY + 42);

    ctx.fillStyle = '#059669';
    ctx.font = '12px "Noto Sans TC", sans-serif';
    ctx.fillText(`公車與動線：${plan.transportAdvice.slice(0, 32)}...`, sumX + 14, bottomY + 62);
  };

  // Draw Animated Route Simulation on Canvas
  const drawRoute = (ctx: CanvasRenderingContext2D, width: number, height: number, animProgress: number) => {
    // Darker / modern navigation map aesthetic
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 40; y < height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px "Noto Sans TC", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🚗 行程動線模擬巡航 (Day ${activeDay})`, 40, 50);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px "Noto Sans TC", sans-serif';
    ctx.fillText(`即時模擬交通行駛軌跡與景點停靠點`, 40, 75);

    const spots = currentDayData.spots;
    if (spots.length < 2) return;

    // Generate path points distributed on canvas
    const points = spots.map((s, idx) => {
      const angle = (idx / (spots.length - 1)) * Math.PI * 0.9 + 0.3;
      const px = 100 + (idx / (spots.length - 1)) * (width - 200) + Math.sin(idx * 2) * 40;
      const py = 160 + (idx % 2 === 0 ? 40 : 160) + Math.cos(idx * 1.5) * 50;
      return { x: px, y: py, spot: s };
    });

    // Draw full trajectory track
    ctx.beginPath();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Draw active animated path
    const totalSegments = points.length - 1;
    const currentProgressIdx = animProgress * totalSegments;
    const curSeg = Math.floor(currentProgressIdx);
    const segT = currentProgressIdx - curSeg;

    ctx.beginPath();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i <= curSeg && i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    if (curSeg < totalSegments) {
      const p1 = points[curSeg];
      const p2 = points[curSeg + 1];
      const cx = p1.x + (p2.x - p1.x) * segT;
      const cy = p1.y + (p2.y - p1.y) * segT;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // Draw waypoints
    points.forEach((p, idx) => {
      const reached = idx <= curSeg;

      // Outer glow
      ctx.fillStyle = reached ? '#f59e0b' : '#334155';
      ctx.beginPath();
      ctx.arc(p.x, p.y, reached ? 16 : 10, 0, Math.PI * 2);
      ctx.fill();

      // Inner white
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = reached ? '#ffffff' : '#94a3b8';
      ctx.font = 'bold 13px "Noto Sans TC", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.spot.name.slice(0, 10), p.x, p.y + 30);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '11px sans-serif';
      ctx.fillText(p.spot.timeSlot, p.x, p.y - 22);
    });

    // Draw traveling vehicle
    let carX = points[0].x;
    let carY = points[0].y;
    if (curSeg < totalSegments) {
      const p1 = points[curSeg];
      const p2 = points[curSeg + 1];
      carX = p1.x + (p2.x - p1.x) * segT;
      carY = p1.y + (p2.y - p1.y) * segT;
    } else {
      carX = points[points.length - 1].x;
      carY = points[points.length - 1].y;
    }

    // Vehicle icon pin
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(carX, carY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Pulse ring around vehicle
    const pulseSize = 18 + ((animProgress * 30) % 15);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(carX, carY, pulseSize, 0, Math.PI * 2);
    ctx.stroke();

    // Emoji in vehicle
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚌', carX, carY);
  };

  // Draw 24-hour Schedule Matrix on Canvas
  const drawTimelineMatrix = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#fafaf9';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#292524';
    ctx.font = 'bold 22px "Noto Sans TC", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`📅 Day ${activeDay}：24小時時程甘特儀表板`, 36, 45);

    ctx.fillStyle = '#78716c';
    ctx.font = '13px "Noto Sans TC", sans-serif';
    ctx.fillText(`精準規劃每一處行程停留時間、轉乘緩衝與餐飲時段`, 36, 70);

    const spots = currentDayData.spots;
    const startHour = 8;
    const totalHours = 14; // 8:00 to 22:00
    const timelineX = 120;
    const timelineW = width - timelineX - 40;

    // Time axis
    ctx.strokeStyle = '#e7e5e4';
    ctx.lineWidth = 1;
    for (let h = 0; h <= totalHours; h++) {
      const hourVal = startHour + h;
      const hx = timelineX + (h / totalHours) * timelineW;

      ctx.beginPath();
      ctx.moveTo(hx, 95);
      ctx.lineTo(hx, height - 60);
      ctx.stroke();

      ctx.fillStyle = '#a8a29e';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${hourVal}:00`, hx, 105);
    }

    // Spot bars
    const rowStartY = 130;
    const rowHeight = 65;

    spots.forEach((spot, idx) => {
      const rowY = rowStartY + idx * rowHeight;

      // Label on left
      ctx.fillStyle = '#1c1917';
      ctx.font = 'bold 13px "Noto Sans TC", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(spot.name.slice(0, 7), timelineX - 16, rowY + 22);

      ctx.fillStyle = '#78716c';
      ctx.font = '11px "Noto Sans TC", sans-serif';
      const categoryName = spot.category === 'food' ? '美食' : spot.category === 'stay' ? '旅宿' : '景點';
      ctx.fillText(categoryName, timelineX - 16, rowY + 38);

      // Bar position
      const spotStartHour = 8.5 + idx * 2.3;
      const barDuration = spot.durationMinutes / 60;
      const barX = timelineX + ((spotStartHour - startHour) / totalHours) * timelineW;
      const barW = Math.max(60, (barDuration / totalHours) * timelineW);

      // Colored Bar
      ctx.fillStyle = spot.category === 'food' ? '#f97316' : spot.category === 'stay' ? '#6366f1' : '#10b981';
      ctx.beginPath();
      ctx.roundRect(barX, rowY + 6, barW, 36, 6);
      ctx.fill();

      // Bar inner text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Noto Sans TC", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(spot.timeSlot, barX + 8, rowY + 22);

      ctx.font = '11px "Noto Sans TC", sans-serif';
      const barDetail = spot.foodDetail ? spot.foodDetail.signatureDish : spot.highlights[0] || '';
      ctx.fillText(barDetail.slice(0, 12), barX + 8, rowY + 36);
    });

    // Bottom Legend
    ctx.textAlign = 'left';
    ctx.font = '12px "Noto Sans TC", sans-serif';

    ctx.fillStyle = '#10b981';
    ctx.fillRect(timelineX, height - 35, 14, 14);
    ctx.fillStyle = '#44403c';
    ctx.fillText('景點參訪', timelineX + 20, height - 23);

    ctx.fillStyle = '#f97316';
    ctx.fillRect(timelineX + 110, height - 35, 14, 14);
    ctx.fillStyle = '#44403c';
    ctx.fillText('必嚐小吃/餐廳', timelineX + 130, height - 23);

    ctx.fillStyle = '#6366f1';
    ctx.fillRect(timelineX + 250, height - 35, 14, 14);
    ctx.fillStyle = '#44403c';
    ctx.fillText('飯店/特色旅宿', timelineX + 270, height - 23);
  };

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina 2x scale
    const dpr = window.devicePixelRatio || 1;
    const width = 800;
    const height = 640;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = '100%';
    canvas.style.maxWidth = `${width}px`;
    canvas.style.height = 'auto';

    ctx.scale(dpr, dpr);

    if (viewMode === 'poster') {
      drawPoster(ctx, width, height);
    } else if (viewMode === 'timeline') {
      drawTimelineMatrix(ctx, width, height);
    } else if (viewMode === 'route') {
      const renderAnim = () => {
        ctx.clearRect(0, 0, width, height);
        drawRoute(ctx, width, height, progress);
        if (isAnimating) {
          setProgress(prev => {
            const next = prev + 0.005;
            return next > 1 ? 0 : next;
          });
        }
        animationFrameRef.current = requestAnimationFrame(renderAnim);
      };
      animationFrameRef.current = requestAnimationFrame(renderAnim);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [viewMode, activeDay, plan, progress, isAnimating]);

  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imageUri = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${plan.destinationName}-${plan.days}日行程圖卡.png`;
    link.href = imageUri;
    link.click();

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
      {/* Canvas Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-stone-100 bg-stone-50/70">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-sm">
            🎨
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-base">Canvas 視覺化儀表板</h3>
            <p className="text-xs text-stone-500">
              HTML5 Canvas 高解析繪製 · 圖文並茂海報與動線模擬
            </p>
          </div>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="flex items-center gap-1 bg-stone-200/80 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setViewMode('poster')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'poster'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            繪卷海報
          </button>
          <button
            onClick={() => setViewMode('route')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'route'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            動線模擬
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'timeline'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            時程甘特
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {viewMode === 'route' && (
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
            >
              {isAnimating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isAnimating ? '暫停' : '播放'}
            </button>
          )}

          <button
            onClick={handleDownloadImage}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            下載海報圖 (PNG)
          </button>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-stone-100/60 border-b border-stone-100 overflow-x-auto text-xs">
        <span className="text-stone-400 font-medium whitespace-nowrap">切換天數：</span>
        {plan.itinerary.map(day => (
          <button
            key={day.dayNumber}
            onClick={() => onSelectDay(day.dayNumber)}
            className={`px-3 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeDay === day.dayNumber
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-200/70 border border-stone-200/60'
            }`}
          >
            Day {day.dayNumber}
          </button>
        ))}
      </div>

      {/* Canvas Viewport Container */}
      <div className="p-4 flex justify-center items-center bg-stone-100/40 min-h-[500px]">
        <canvas
          ref={canvasRef}
          className="rounded-xl shadow-md border border-stone-200/80 bg-white max-w-full"
        />
      </div>

      {/* Footer caption */}
      <div className="px-5 py-3 bg-stone-50 text-xs text-stone-500 border-t border-stone-100 flex items-center justify-between">
        <span>💡 提示：點擊右上方「下載海報圖」即可直接將此 Canvas 視覺圖卡另存為高解析圖片分享給同行旅伴。</span>
        <span className="font-mono text-stone-400">800 × 640 HiDPI</span>
      </div>
    </div>
  );
};

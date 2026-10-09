import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { TravelPlan, Spot } from '../types/travel';
import { MapPin, Navigation, Compass } from 'lucide-react';

interface TravelMapProps {
  plan: TravelPlan;
  activeDay: number;
  onSelectDay: (day: number) => void;
  selectedSpotId?: string;
  onSelectSpot?: (spotId: string) => void;
}

export const TravelMap: React.FC<TravelMapProps> = ({
  plan,
  activeDay,
  onSelectDay,
  selectedSpotId,
  onSelectSpot,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [23.8, 120.9],
        zoom: 8,
        zoomControl: true,
      });

      // CartoDB Positron / OSM clean tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update markers & polylines when plan or activeDay changes
  useEffect(() => {
    const map = leafletMapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const currentDayData = plan.itinerary.find(d => d.dayNumber === activeDay);
    const spotsToDisplay = currentDayData ? currentDayData.spots : [];

    if (spotsToDisplay.length === 0) return;

    const latLngs: L.LatLngExpression[] = [];

    // Distinct icons
    spotsToDisplay.forEach((spot, idx) => {
      const isSelected = spot.id === selectedSpotId;
      const markerColor = spot.category === 'food' ? '#ea580c' : spot.category === 'stay' ? '#4f46e5' : spot.category === 'transport' ? '#0284c7' : '#059669';
      const iconSymbol = spot.category === 'food' ? '🍜' : spot.category === 'stay' ? '🏨' : spot.category === 'transport' ? '🚌' : '📍';

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background-color: ${markerColor};
            width: ${isSelected ? '38px' : '32px'};
            height: ${isSelected ? '38px' : '32px'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 2px solid #ffffff;
            transition: all 0.2s ease;
            cursor: pointer;
          ">
            <span>${iconSymbol}</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([spot.lat, spot.lng], { icon: customIcon });

      // Popup Content
      const popupHtml = `
        <div style="font-family: inherit; width: 220px;">
          <img src="${spot.photoUrl}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 11px; font-weight: 700; color: ${markerColor};">${spot.category === 'food' ? '必嚐美食' : spot.category === 'stay' ? '推薦住宿' : spot.category === 'transport' ? '交通站點' : '推薦景點'}</span>
            <span style="font-size: 11px; color: #78716c;">${spot.timeSlot}</span>
          </div>
          <h4 style="font-size: 14px; font-weight: 700; color: #1c1917; margin: 0 0 4px 0;">${spot.name}</h4>
          ${spot.foodDetail ? `<p style="font-size: 12px; color: #b45309; margin: 0 0 4px 0;"><strong>招牌：</strong>${spot.foodDetail.signatureDish}</p>` : ''}
          ${spot.stayDetail ? `<p style="font-size: 12px; color: #4338ca; margin: 0 0 4px 0;"><strong>房價：</strong>${spot.stayDetail.pricePerNight}</p>` : ''}
          ${spot.transitFromPrev ? `<p style="font-size: 11px; color: #0284c7; margin: 4px 0 0 0;"><strong>交通：</strong>${spot.transitFromPrev.instructions}</p>` : ''}
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        if (onSelectSpot) onSelectSpot(spot.id);
      });

      marker.addTo(layerGroup);
      latLngs.push([spot.lat, spot.lng]);
    });

    // Draw Polyline connecting spots
    if (latLngs.length > 1) {
      const polyline = L.polyline(latLngs, {
        color: '#b45309',
        weight: 4,
        opacity: 0.8,
        dashArray: '6, 8',
      });
      polyline.addTo(layerGroup);
    }

    // Fit map bounds to current spots
    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [plan, activeDay, selectedSpotId]);

  const handleResetBounds = () => {
    const map = leafletMapRef.current;
    if (!map) return;
    const currentDayData = plan.itinerary.find(d => d.dayNumber === activeDay);
    if (!currentDayData || currentDayData.spots.length === 0) return;
    const bounds = L.latLngBounds(currentDayData.spots.map(s => [s.lat, s.lng]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col h-[580px]">
      {/* Top Map Header */}
      <div className="p-4 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 bg-stone-50/70">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold text-sm">
            🗺️
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-base">路線即時地圖 (OpenStreetMap)</h3>
            <p className="text-xs text-stone-500">
              各站點精準座標 · 路線軌跡 · 點擊圖示查看轉乘與特色
            </p>
          </div>
        </div>

        {/* Day switch controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {plan.itinerary.map(day => (
            <button
              key={day.dayNumber}
              onClick={() => onSelectDay(day.dayNumber)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeDay === day.dayNumber
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              Day {day.dayNumber} 動線
            </button>
          ))}
          <button
            onClick={handleResetBounds}
            className="p-1.5 bg-white border border-stone-200 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
            title="重新聚焦路線"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Element */}
      <div className="flex-1 w-full relative">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Map Legend Floating Box */}
        <div className="absolute bottom-4 left-4 z-[500] bg-white/95 backdrop-blur-sm border border-stone-200 rounded-xl px-3 py-2 shadow-md text-xs flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-stone-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>景點</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-700">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
            <span>特色美食</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-700">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <span>精選住宿</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-700">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
            <span>交通樞紐</span>
          </div>
        </div>
      </div>
    </div>
  );
};

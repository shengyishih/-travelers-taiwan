import { TaiwanCounty, TravelPlan, TransportMode, TravelTheme, DayItinerary, Spot } from '../types/travel';
import { TAIWAN_COUNTIES, CURATED_PLANS } from '../data/taiwanData';

// Generates a complete, authentic Taiwan itinerary based on county, days, transport mode, and theme
export function buildItinerary(
  countyId: string,
  days: number,
  mode: TransportMode,
  theme: TravelTheme,
  customNotes?: string
): TravelPlan {
  const cacheKey = `${countyId}-${days}-${mode}`;
  if (CURATED_PLANS[cacheKey]) {
    const curated = CURATED_PLANS[cacheKey];
    if (!customNotes) return curated;
  }

  const county = TAIWAN_COUNTIES.find(c => c.id === countyId) || TAIWAN_COUNTIES[0];
  const modeLabels: Record<TransportMode, string> = {
    public: '大眾捷運與台灣好行',
    car: '租車自駕暢遊',
    scooter: '自在機車慢巡',
    cycling: '鐵馬單車踏風',
    walking: '城市散策健行',
  };

  const themeLabels: Record<TravelTheme, string> = {
    food: '道地饕客美食',
    culture: '歷史人文古蹟',
    nature: '自然山海壯闊',
    relax: '慢活療癒溫泉',
    family: '闔家親子同樂',
    photo: '網美絕景打卡',
  };

  const itinerary: DayItinerary[] = [];
  const baseLat = county.center[0];
  const baseLng = county.center[1];

  for (let d = 1; d <= days; d++) {
    const daySpots: Spot[] = [];
    const offset1 = (d - 1) * 0.015;
    const offset2 = (d - 1) * 0.02;

    const primaryFood = county.famousFoods[(d - 1) % county.famousFoods.length] || '在地招牌特色小吃';
    const secondaryFood = county.famousFoods[(d + 1) % county.famousFoods.length] || '古早味經典甜品';
    const mainAttraction = county.famousAttractions[(d - 1) % county.famousAttractions.length] || `${county.name}風景名勝`;
    const subAttraction = county.famousAttractions[(d + 1) % county.famousAttractions.length] || `${county.name}自然景致`;

    // 1. Morning spot
    daySpots.push({
      id: `${county.id}-d${d}-s1`,
      name: `${county.name}文化出發點：${mainAttraction}`,
      category: 'attraction',
      lat: baseLat + offset1,
      lng: baseLng + offset2,
      timeSlot: '09:00 - 11:30',
      durationMinutes: 150,
      description: `展開${county.name}第${d}天的精采旅程，造訪名聞遐邇的${mainAttraction}，細細品味在地風土歷史與人文景觀。`,
      address: `${county.name}核心風景區`,
      highlights: ['歷史地標典藏', '視野絕佳觀景角度', '在地解說導覽'],
      photoUrl: county.coverImage,
      tips: '建議提早抵達避開人潮，注意防曬並攜帶相機捕捉光影。',
      transitFromPrev: {
        mode: mode,
        lineName: mode === 'public' ? '台灣好行觀光巴士 / 市區客運' : `${modeLabels[mode]}沿線`,
        instructions: mode === 'public'
          ? `由轉運樞紐搭乘觀光專線直達「${mainAttraction}」站牌下車。`
          : `導航設定往「${mainAttraction}」，沿途路況平穩好開。`,
        durationMinutes: 25,
        estimatedFare: mode === 'public' ? 'NT$ 25 - 60' : undefined,
      },
    });

    // 2. Noon Food spot
    daySpots.push({
      id: `${county.id}-d${d}-s2`,
      name: `在地饕客必嚐：${primaryFood}`,
      category: 'food',
      lat: baseLat + offset1 - 0.008,
      lng: baseLng + offset2 + 0.005,
      timeSlot: '12:00 - 13:30',
      durationMinutes: 90,
      description: `品味${county.name}最道地的在地風味【${primaryFood}】，嚴選新鮮食材，傳承多年秘製配方，是老饕讚不絕口的味覺盛宴。`,
      address: `${county.name}老街/傳統市場美食街區`,
      highlights: ['現點現做傳統手藝', '特製獨門沾醬', '高人氣在地老店'],
      photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      foodDetail: {
        signatureDish: `${primaryFood} 特等招牌組`,
        priceRange: 'NT$ 100 - 280 /人',
        mustTryReason: `香氣濃郁且保有在地純樸風味，每一口都能吃出${county.name}深厚的飲食文化底蘊！`,
      },
      transitFromPrev: {
        mode: mode,
        lineName: '在地步行或接駁',
        instructions: `步行約 5-8 分鐘即可穿梭至老街核心餐飲區。`,
        durationMinutes: 8,
      },
    });

    // 3. Afternoon spot
    daySpots.push({
      id: `${county.id}-d${d}-s3`,
      name: `漫活午後時光：${subAttraction}`,
      category: 'attraction',
      lat: baseLat - offset1 + 0.004,
      lng: baseLng - offset2 + 0.006,
      timeSlot: '14:30 - 17:00',
      durationMinutes: 150,
      description: `下午時分前往${subAttraction}散步走訪，享受放慢節奏的心靈沉澱時光，欣賞大自然與文創聚落的和諧共鳴。`,
      address: `${county.name}近郊園區`,
      highlights: ['自然芬多精/綠蔭漫步', '特色打卡點', '文創工藝體驗'],
      photoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
      transitFromPrev: {
        mode: mode,
        instructions: mode === 'public'
          ? `搭乘市區幹線公車約 15 分鐘抵達園區步道入口。`
          : `駕車/騎行前往，園區設有汽機車停車場。`,
        durationMinutes: 15,
      },
    });

    // 4. Evening Night Market or Dinner
    daySpots.push({
      id: `${county.id}-d${d}-s4`,
      name: `夜市散策與點心：${secondaryFood}`,
      category: 'food',
      lat: baseLat + 0.002,
      lng: baseLng + 0.008,
      timeSlot: '18:00 - 20:30',
      durationMinutes: 150,
      description: `入夜後探訪熱鬧夜市或特色名店，大啖${secondaryFood}與豐富特色炸物甜品，感受熱情島嶼夜生活。`,
      address: `${county.name}市中心觀光夜市/商圈`,
      highlights: ['排隊人氣名店', '熱鬧夜市氛圍', '豐富多樣化小吃群'],
      photoUrl: 'https://images.unsplash.com/photo-1543158266-0066955047b1?w=800&auto=format&fit=crop&q=80',
      foodDetail: {
        signatureDish: `古法手作 ${secondaryFood}`,
        priceRange: 'NT$ 80 - 200 /人',
        mustTryReason: '在地人口碑力推，甜香撲鼻、口感細膩，為一整天的旅程劃下甜蜜句點。',
      },
    });

    // Stay for the night
    const staySpot: Spot = {
      id: `${county.id}-stay-d${d}`,
      name: `${county.name}精選風格旅宿 (${county.isIsland ? '海景度假民宿' : '精品人文飯店'})`,
      category: 'stay',
      lat: baseLat + 0.005,
      lng: baseLng + 0.004,
      timeSlot: '16:00 入住 Check-in',
      durationMinutes: 60,
      description: `精心挑選坐落於交通樞紐旁的高品質旅宿，環境靜謐舒適，步行即可到達便利商圈。`,
      address: `${county.name}市心悠活街區`,
      highlights: ['絕佳採光景觀', '舒壓寢具與衛浴設備', '提供在地精緻早餐'],
      photoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
      stayDetail: {
        type: county.isIsland ? 'bnb' : 'hotel',
        pricePerNight: county.isIsland ? 'NT$ 2,600 - 3,800' : 'NT$ 3,200 - 4,500',
        features: ['落地景觀窗', '乾濕分離沐浴', '在地手工早餐', '行李免費寄存'],
        bookingAdvice: '建議於出發前兩週確認預訂以享有早鳥優惠。',
      },
    };

    itinerary.push({
      dayNumber: d,
      dayTitle: `Day ${d}: ${d === 1 ? '風土啟程與經典名勝' : d === days ? '深度巡禮與伴手禮賦歸' : '山海秘境與味蕾探尋'}`,
      summary: `深度走訪${mainAttraction}與${subAttraction}，全天品嚐${primaryFood}與${secondaryFood}，兼具節奏與休憩品質。`,
      dailyBudgetEstimate: 2200,
      dayFoodSummary: [primaryFood, secondaryFood],
      dayStay: staySpot,
      spots: daySpots,
    });
  }

  // Voice narration script
  const voiceScript = `哈囉！這為您安排的${county.name} ${days}天${days - 1}夜【${themeLabels[theme]}】行程。全程以【${modeLabels[mode]}】為核心，帶您從${county.famousAttractions.slice(0, 2).join('、')}等必訪名勝，一路暢享${county.famousFoods.slice(0, 3).join('、')}等道地經典美味，搭配舒適優質的特色旅宿。路線順暢免奔波，讓您輕鬆感受台灣迷人的島嶼風情！`;

  return {
    id: `${county.id}-${days}-${mode}-${theme}`,
    title: `${county.name} ${days}日${modeLabels[mode]}．${themeLabels[theme]}漫遊計畫`,
    destinationName: county.name,
    destinationId: county.id,
    days,
    transportMode: mode,
    theme,
    coverImage: county.coverImage,
    summary: `為您量身打造的${county.name}${days}天遊程，結合${modeLabels[mode]}與${themeLabels[theme]}主題。整合了必吃名店${county.famousFoods.slice(0, 3).join('、')}與精選飯店，並提供大眾交通轉乘與公車路線詳細資訊。`,
    voiceScript,
    totalBudgetEstimate: days * 2200 + (days - 1) * 2800,
    packingAdvice: [
      '隨身水壺與環保餐具（享用夜市小吃好幫手）',
      '悠遊卡/一卡通（搭乘捷運、公車、渡輪皆可使用）',
      '防曬遮陽帽、太陽眼鏡與輕便防風外套',
      '行動電源與充電線',
      county.isIsland ? '暈船藥與水上運動防滑鞋' : '健走好穿的休閒球鞋',
    ],
    weatherAdvice: `${county.name}氣候適宜，出發前建議查詢中央氣象署最新預報，日照強烈時請多補充水分。`,
    transportAdvice: county.transportHighlights,
    itinerary,
  };
}

export type RegionCategory = 'north' | 'central' | 'south' | 'east' | 'islands';

export type TransportMode = 'public' | 'car' | 'scooter' | 'cycling' | 'walking';

export type TravelTheme = 'food' | 'culture' | 'nature' | 'relax' | 'family' | 'photo';

export interface Spot {
  id: string;
  name: string;
  nameEn?: string;
  category: 'attraction' | 'food' | 'stay' | 'transport';
  lat: number;
  lng: number;
  timeSlot: string; // e.g. "09:30 - 11:30"
  durationMinutes: number;
  description: string;
  address: string;
  highlights: string[];
  tips?: string;
  photoUrl: string;
  
  // Specific for food
  foodDetail?: {
    signatureDish: string; // 招牌必點
    priceRange: string; // e.g. "NT$ 80 - 250"
    mustTryReason: string; // 特色介紹
  };

  // Specific for stay
  stayDetail?: {
    type: 'hotel' | 'bnb' | 'resort'; // 飯店 / 特色民宿 / 溫泉渡假
    pricePerNight: string;
    features: string[]; // 海景露台、附早餐、溫泉
    bookingAdvice: string;
  };

  // Transit to this spot
  transitFromPrev?: {
    mode: TransportMode;
    lineName?: string; // e.g. "台灣好行 88號" / "捷運淡水信義線"
    instructions: string; // e.g. "從台北車站搭乘捷運至士林站1號出口，轉乘紅30公車至故宮博物院"
    durationMinutes: number;
    estimatedFare?: string;
  };
}

export interface DayItinerary {
  dayNumber: number;
  dayTitle: string; // e.g. "Day 1: 古都街巷與安平尋味"
  summary: string;
  spots: Spot[];
  dayFoodSummary: string[];
  dayStay: Spot;
  dailyBudgetEstimate: number; // TWD
}

export interface TravelPlan {
  id: string;
  title: string;
  destinationName: string;
  destinationId: string;
  days: number;
  transportMode: TransportMode;
  theme: TravelTheme;
  coverImage: string;
  summary: string;
  voiceScript: string; // 簡要語音朗讀專用腳本
  totalBudgetEstimate: number;
  itinerary: DayItinerary[];
  packingAdvice: string[];
  weatherAdvice: string;
  transportAdvice: string;
}

export interface TaiwanCounty {
  id: string;
  name: string;
  nameEn: string;
  category: RegionCategory;
  tagline: string;
  description: string;
  coverImage: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
  famousFoods: string[];
  famousAttractions: string[];
  transportHighlights: string;
  isIsland: boolean;
  ferryOrFlightInfo?: string;
}

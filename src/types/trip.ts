export type BudgetTier = 'Budget' | 'Mid-range' | 'Luxury';
export type TravelPace = 'Slow' | 'Moderate' | 'Fast';
export type DietaryPreference = 'Vegetarian' | 'Vegan' | 'No restrictions';
export type GroupComposition = 'Solo' | 'Couple' | 'Friends' | 'Family';
export type VibeTag = 'Nightlife' | 'Kid-friendly' | 'Accessible' | 'Outdoor' | 'Indoor';
export type AppScreen = 'creation' | 'generating' | 'dashboard' | 'disruption-adapting';
export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';
export type GeminiActivityType = 'optimization' | 'alert' | 'decision' | 'calculation';

export interface TripConstraints {
  destination: string;
  startDate: string;
  endDate: string;
  budgetTier: BudgetTier;
  budgetINR: number;
  pace: TravelPace;
  dietary: DietaryPreference;
  groupComposition: GroupComposition;
  groupSize: number;
  vibes: VibeTag[];
  freeformPrompt: string;
}

export interface ItineraryTimeSlot {
  period: TimePeriod;
  location: string;
  activity: string;
  estimatedCostINR: number;
  travelDuration: string;
  weather: string;
  tags: string[];
  geminiReasoning: string;
  revised: boolean;
}

export interface TripDay {
  day: number;
  date: string;
  slots: ItineraryTimeSlot[];
}

export interface TripSummary {
  totalBudget: number;
  spentBudget: number;
  weatherOverview: string;
  walkingIntensity: 'low' | 'medium' | 'high';
  travelEfficiencyScore: number;
  geminiConfidenceScore: number;
}

export interface AdaptiveTrip {
  destination: string;
  days: TripDay[];
  summary: TripSummary;
}

export interface GeminiActivity {
  id: string;
  timestamp: Date;
  type: GeminiActivityType;
  message: string;
}

export interface DisruptionPreset {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export const DISRUPTION_PRESETS: DisruptionPreset[] = [
  { id: 'rain',   label: 'Heavy Rain',     description: 'Heavy rain forecast tomorrow — outdoor plans affected', icon: 'CloudRain' },
  { id: 'closed', label: 'Venue Closed',   description: 'Recommended restaurant is closed for renovation', icon: 'Store' },
  { id: 'flight', label: 'Flight Delayed', description: 'Connecting flight delayed by 4 hours', icon: 'PlaneTakeoff' },
  { id: 'budget', label: 'Over Budget',    description: 'Overspent budget by ₹8,000 — need cheaper alternatives', icon: 'TrendingDown' },
  { id: 'joined', label: 'Friend Joined',  description: 'One more person joining the trip unexpectedly', icon: 'UserPlus' },
  { id: 'crowd',  label: 'Overcrowded',    description: 'Main attraction is overcrowded — need alternatives', icon: 'Users' },
];

export const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
};

export const TIME_PERIOD_ICONS: Record<TimePeriod, string> = {
  morning: '🌅',
  afternoon: '☀️',
  evening: '🌆',
  night: '🌙',
};

export const ACTIVITY_TYPE_COLORS: Record<GeminiActivityType, string> = {
  optimization: 'text-blue-400',
  alert: 'text-amber-400',
  decision: 'text-violet-400',
  calculation: 'text-emerald-400',
};

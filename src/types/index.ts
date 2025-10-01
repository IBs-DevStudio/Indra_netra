export interface Detection {
  id: string;
  timestamp: number;
  vehicleType: string;
  confidence: number;
  source: 'live' | 'image' | 'surveillance';
  bbox?: number[];
  imageData?: string;
  location?: string;
}

export interface SurveillanceStream {
  id: string;
  name: string;
  url?: string;
  description: string;
  location: string;
  status: 'active' | 'inactive' | 'error';
  lastActive: number;
  detectionCount: number;
}

export interface AppSettings {
  confidenceThreshold: number;
  detectionFrequency: number;
  resolution: string;
  fps: number;
  alertsEnabled: boolean;
  audioVolume: number;
  theme: 'dark' | 'light' | 'auto';
  language: 'en' | 'hi' | 'both';
}

export interface AnalyticsData {
  detections: Detection[];
  vehicleTypeStats: { [key: string]: number };
  timelineData: { date: string; count: number }[];
  confidenceStats: { range: string; count: number }[];
}

export interface MilitaryEvent {
  year: number;
  title: string;
  description: string;
  category: 'formation' | 'war' | 'achievement' | 'modernization';
  significance: string;
}
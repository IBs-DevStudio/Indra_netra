import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Detection, SurveillanceStream, AppSettings, AnalyticsData } from '../types';

interface AppState {
  detections: Detection[];
  streams: SurveillanceStream[];
  settings: AppSettings;
  analytics: AnalyticsData;
  isModelLoaded: boolean;
  modelLoadingProgress: number;
}

type AppAction =
  | { type: 'ADD_DETECTION'; payload: Detection }
  | { type: 'ADD_STREAM'; payload: SurveillanceStream }
  | { type: 'UPDATE_STREAM'; payload: { id: string; data: Partial<SurveillanceStream> } }
  | { type: 'DELETE_STREAM'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_MODEL_LOADED'; payload: boolean }
  | { type: 'SET_MODEL_PROGRESS'; payload: number }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> }
  | { type: 'CLEAR_DETECTIONS' }
  | { type: 'CLEAR_ALL_DATA' };

const initialSettings: AppSettings = {
  confidenceThreshold: 0.5,
  detectionFrequency: 3,
  resolution: '720p',
  fps: 30,
  alertsEnabled: true,
  audioVolume: 50,
  theme: 'dark',
  language: 'both'
};

const initialState: AppState = {
  detections: [],
  streams: [],
  settings: initialSettings,
  analytics: {
    detections: [],
    vehicleTypeStats: {},
    timelineData: [],
    confidenceStats: []
  },
  isModelLoaded: false,
  modelLoadingProgress: 0
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_DETECTION':
      const newDetections = [...state.detections, action.payload].slice(-1000);
      return {
        ...state,
        detections: newDetections,
        analytics: {
          ...state.analytics,
          detections: newDetections
        }
      };
    
    case 'ADD_STREAM':
      return {
        ...state,
        streams: [...state.streams, action.payload]
      };
    
    case 'UPDATE_STREAM':
      return {
        ...state,
        streams: state.streams.map(stream =>
          stream.id === action.payload.id
            ? { ...stream, ...action.payload.data }
            : stream
        )
      };
    
    case 'DELETE_STREAM':
      return {
        ...state,
        streams: state.streams.filter(stream => stream.id !== action.payload)
      };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    
    case 'SET_MODEL_LOADED':
      return {
        ...state,
        isModelLoaded: action.payload
      };
    
    case 'SET_MODEL_PROGRESS':
      return {
        ...state,
        modelLoadingProgress: action.payload
      };
    
    case 'LOAD_DATA':
      return {
        ...state,
        ...action.payload
      };
    
    case 'CLEAR_DETECTIONS':
      return {
        ...state,
        detections: [],
        analytics: {
          ...state.analytics,
          detections: []
        }
      };
    
    case 'CLEAR_ALL_DATA':
      return {
        ...initialState,
        isModelLoaded: state.isModelLoaded,
        modelLoadingProgress: state.modelLoadingProgress
      };
    
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('indra-netra-settings');
    const savedDetections = localStorage.getItem('indra-netra-detections');
    const savedStreams = localStorage.getItem('indra-netra-streams');

    const loadData: Partial<AppState> = {};

    if (savedSettings) {
      loadData.settings = { ...initialSettings, ...JSON.parse(savedSettings) };
    }

    if (savedDetections) {
      loadData.detections = JSON.parse(savedDetections).slice(-1000);
    }

    if (savedStreams) {
      loadData.streams = JSON.parse(savedStreams);
    }

    if (Object.keys(loadData).length > 0) {
      dispatch({ type: 'LOAD_DATA', payload: loadData });
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('indra-netra-settings', JSON.stringify(state.settings));
  }, [state.settings]);

  useEffect(() => {
    localStorage.setItem('indra-netra-detections', JSON.stringify(state.detections));
  }, [state.detections]);

  useEffect(() => {
    localStorage.setItem('indra-netra-streams', JSON.stringify(state.streams));
  }, [state.streams]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
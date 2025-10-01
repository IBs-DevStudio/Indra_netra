import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Volume2,
  Bell,
  Database,
  Download,
  RotateCcw,
  CheckCircle,
  Camera,
  Settings,
  Palette,
  Info,
  Moon,
  Sun,
  Globe,
  Trash2
} from 'lucide-react';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('detection');
  const [showSaved, setShowSaved] = useState(false);

  // Load settings from localStorage
  const [settings, setSettings] = useState({
    confidence: parseFloat(localStorage.getItem('indra-netra-settings-confidence') || '0.6'),
    frequency: parseInt(localStorage.getItem('indra-netra-settings-frequency') || '3'),
    alertsEnabled: localStorage.getItem('indra-netra-settings-alerts-enabled') === 'true',
    alertVolume: parseInt(localStorage.getItem('indra-netra-settings-alert-volume') || '50'),
    alertThreshold: parseFloat(localStorage.getItem('indra-netra-settings-alert-threshold') || '0.8'),
    resolution: localStorage.getItem('indra-netra-settings-resolution') || '1280x720',
    fps: parseInt(localStorage.getItem('indra-netra-settings-fps') || '30'),
    theme: localStorage.getItem('indra-netra-settings-theme') || 'dark'
  });

  const tabs = [
    { id: 'detection', label: 'Detection', icon: Settings },
    { id: 'camera', label: 'Camera', icon: Camera },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'interface', label: 'Interface', icon: Palette },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'system', label: 'System', icon: Info }
  ];

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(`indra-netra-settings-${key}`, value.toString());
    
    // Show saved feedback
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const resetSettings = () => {
    const defaultSettings = {
      confidence: 0.6,
      frequency: 3,
      alertsEnabled: true,
      alertVolume: 50,
      alertThreshold: 0.8,
      resolution: '1280x720',
      fps: 30,
      theme: 'dark'
    };
    
    Object.entries(defaultSettings).forEach(([key, value]) => {
      localStorage.setItem(`indra-netra-settings-${key}`, value.toString());
    });
    
    setSettings(defaultSettings);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const exportSettings = () => {
    const allSettings = {
      ...settings,
      detections: JSON.parse(localStorage.getItem('indra-netra-detections') || '[]')
    };
    
    const dataStr = JSON.stringify(allSettings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `indra-netra-settings-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all detection history? This action cannot be undone.')) {
      localStorage.removeItem('indra-netra-detections');
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }
  };

  const testAlert = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 440;
      gainNode.gain.setValueAtTime((settings.alertVolume / 100) * 0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (err) {
      alert('Audio test failed. Please check your browser permissions.');
    }
  };

  const getStorageUsage = () => {
    const detections = localStorage.getItem('indra-netra-detections') || '[]';
    const settings = Object.keys(localStorage).filter(key => key.startsWith('indra-netra-settings-'));
    const totalSize = detections.length + settings.reduce((sum, key) => sum + (localStorage.getItem(key)?.length || 0), 0);
    return Math.round(totalSize / 1024); // KB
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'detection':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Detection Parameters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Confidence Threshold: {Math.round(settings.confidence * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={settings.confidence}
                    onChange={(e) => updateSetting('confidence', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Lower values detect more objects but may include false positives
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Detection Frequency: Every {settings.frequency} frames
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={settings.frequency}
                    onChange={(e) => updateSetting('frequency', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Higher values improve performance but may miss fast-moving objects
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Vehicle Types to Detect</label>
                  <div className="space-y-2">
                    {['Tank/Military Vehicle', 'Fighter Jet', 'Naval Ship', 'Military Truck'].map((type) => (
                      <label key={type} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500"
                        />
                        <span className="text-gray-300">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-700 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">Detection Sensitivity Presets</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'Conservative', confidence: 0.8, frequency: 5 },
                      { name: 'Balanced', confidence: 0.6, frequency: 3 },
                      { name: 'Aggressive', confidence: 0.4, frequency: 2 },
                      { name: 'Maximum', confidence: 0.2, frequency: 1 }
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          updateSetting('confidence', preset.confidence);
                          updateSetting('frequency', preset.frequency);
                        }}
                        className="bg-slate-800 hover:bg-slate-600 text-white p-3 rounded-lg text-sm transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'camera':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Camera Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Resolution</label>
                  <select
                    value={settings.resolution}
                    onChange={(e) => updateSetting('resolution', e.target.value)}
                    className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600"
                  >
                    <option value="640x480">480p (640×480)</option>
                    <option value="1280x720">720p (1280×720)</option>
                    <option value="1920x1080">1080p (1920×1080)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Frame Rate: {settings.fps} FPS
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    step="15"
                    value={settings.fps}
                    onChange={(e) => updateSetting('fps', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>15 FPS</span>
                    <span>30 FPS</span>
                    <span>45 FPS</span>
                    <span>60 FPS</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Auto-focus</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500" />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Mirror video horizontally</span>
                    <input type="checkbox" className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500" />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Low light enhancement</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500" />
                  </label>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-500/20 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Camera className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-yellow-300 font-semibold">Camera Permissions</p>
                      <p className="text-yellow-200 text-sm">Make sure camera permissions are granted for optimal performance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'alerts':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Alert Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-gray-300 font-medium">Enable Audio Alerts</label>
                    <p className="text-gray-500 text-sm">Play sound when military vehicles detected</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.alertsEnabled}
                    onChange={(e) => updateSetting('alertsEnabled', e.target.checked)}
                    className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-gray-400 text-sm">Alert Volume: {settings.alertVolume}%</label>
                    <Volume2 className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.alertVolume}
                    onChange={(e) => updateSetting('alertVolume', parseInt(e.target.value))}
                    disabled={!settings.alertsEnabled}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Alert Threshold: {Math.round(settings.alertThreshold * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="0.95"
                    step="0.05"
                    value={settings.alertThreshold}
                    onChange={(e) => updateSetting('alertThreshold', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Trigger alerts when confidence exceeds this threshold
                  </div>
                </div>

                <button
                  onClick={testAlert}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg"
                >
                  Test Alert Sound
                </button>
              </div>
            </div>
          </div>
        );

      case 'interface':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Interface Preferences</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'dark', name: 'Dark', icon: Moon },
                      { id: 'light', name: 'Light', icon: Sun },
                      { id: 'auto', name: 'Auto', icon: Globe }
                    ].map((theme) => {
                      const Icon = theme.icon;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => updateSetting('theme', theme.id)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            settings.theme === theme.id
                              ? 'border-orange-500 bg-orange-500/10'
                              : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                          }`}
                        >
                          <Icon className="h-6 w-6 text-white mx-auto mb-2" />
                          <div className="text-white text-sm">{theme.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Language Display</label>
                  <select className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600">
                    <option value="en">English Only</option>
                    <option value="hi">Hindi Only (हिंदी)</option>
                    <option value="both" selected>Both Languages (दोनों भाषाएं)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Date Format</label>
                  <select className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600">
                    <option value="dmy" selected>DD/MM/YYYY (Indian)</option>
                    <option value="mdy">MM/DD/YYYY (US)</option>
                    <option value="ymd">YYYY-MM-DD (ISO)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Time Format</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg border-2 border-orange-500">
                      24-hour (23:59)
                    </button>
                    <button className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg border-2 border-slate-600">
                      12-hour (11:59 PM)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
              
              <div className="space-y-4">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">Storage Usage</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Detection History</span>
                      <span className="text-white">{JSON.parse(localStorage.getItem('indra-netra-detections') || '[]').length} records</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Settings Data</span>
                      <span className="text-white">{Object.keys(localStorage).filter(k => k.startsWith('indra-netra-settings-')).length} items</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Storage Used</span>
                      <span className="text-white">~{getStorageUsage()} KB</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={exportSettings}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export All Data</span>
                  </button>
                </div>

                <div className="border-t border-slate-600 pt-4">
                  <h4 className="text-red-400 font-semibold mb-2">Danger Zone</h4>
                  <div className="space-y-3">
                    <button
                      onClick={clearHistory}
                      className="w-full bg-red-600/20 hover:bg-red-600 border border-red-600 text-red-400 hover:text-white py-3 rounded-lg flex items-center justify-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Clear Detection History</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h4 className="text-white font-semibold mb-2">Application</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Version</span>
                        <span className="text-white">v2.1.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Build</span>
                        <span className="text-white">2024.01.15</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Model</span>
                        <span className="text-white">COCO-SSD</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h4 className="text-white font-semibold mb-2">Browser</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">WebGL</span>
                        <span className="text-green-500">✓ Supported</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">WebRTC</span>
                        <span className="text-green-500">✓ Supported</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Camera</span>
                        <span className="text-green-500">✓ Available</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-blue-300 font-semibold">About Indra-Netra</p>
                      <p className="text-blue-200 text-sm">
                        AI-powered military vehicle detection system built with TensorFlow.js. 
                        This is a demonstration system showcasing real-time object detection capabilities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Saved Feedback */}
        {showSaved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 z-50"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Saved ✓</span>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Settings & Configuration</h1>
          <p className="text-gray-400">Customize Indra-Netra detection system parameters</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-slate-800 rounded-2xl p-6 sticky top-4"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Settings Categories</h3>
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-800 rounded-2xl p-6"
            >
              {renderTabContent()}
              
              {/* Reset Actions */}
              <div className="flex space-x-4 mt-8 pt-6 border-t border-slate-700">
                <button
                  onClick={resetSettings}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 rounded-lg flex items-center justify-center space-x-2 font-semibold"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset to Defaults</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
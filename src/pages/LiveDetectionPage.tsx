import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Volume2,
  Download,
  CameraOff,
  AlertTriangle,
  Play,
  Pause,
  VolumeX
} from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { useAppContext } from '../context/AppContext';
import { tensorFlowService } from '../utils/tensorflow';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function LiveDetectionPage() {
  const { state, dispatch } = useAppContext();
  const { videoRef, isActive, error, devices, startCamera, stopCamera, switchCamera } = useCamera();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [isDetecting, setIsDetecting] = useState(false);
  const [fps, setFps] = useState(0);
  const [detectionCount, setDetectionCount] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [lastFpsUpdate, setLastFpsUpdate] = useState(Date.now());
  const [threatLevel, setThreatLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [detectionLog, setDetectionLog] = useState<Array<{
    id: string;
    type: string;
    confidence: number;
    timestamp: Date;
  }>>([]);
  const [lastAlertTime, setLastAlertTime] = useState(0);
  const [showAlert, setShowAlert] = useState(false);

  // Get settings from localStorage
  const confidence = parseFloat(localStorage.getItem('indra-netra-settings-confidence') || '0.6');
  const frequency = parseInt(localStorage.getItem('indra-netra-settings-frequency') || '3');
  const alertsEnabled = localStorage.getItem('indra-netra-settings-alerts-enabled') === 'true';
  const alertVolume = parseInt(localStorage.getItem('indra-netra-settings-alert-volume') || '50');
  const alertThreshold = parseFloat(localStorage.getItem('indra-netra-settings-alert-threshold') || '0.8');
  const resolution = localStorage.getItem('indra-netra-settings-resolution') || '1280x720';

  const resolutionMap: { [key: string]: { width: number; height: number } } = {
    '640x480': { width: 640, height: 480 },
    '1280x720': { width: 1280, height: 720 },
    '1920x1080': { width: 1920, height: 1080 }
  };

  // Initialize TensorFlow model on mount
  useEffect(() => {
    if (!state.isModelLoaded && !tensorFlowService.isModelLoaded()) {
      tensorFlowService.loadModel((progress) => {
        dispatch({ type: 'SET_MODEL_PROGRESS', payload: progress });
      }).then(() => {
        dispatch({ type: 'SET_MODEL_LOADED', payload: true });
      }).catch((error) => {
        console.error('Failed to load model:', error);
      });
    }
  }, [dispatch, state.isModelLoaded]);

  // Play alert sound
  const playAlertSound = useCallback(() => {
    if (!alertsEnabled) return;
    
    const now = Date.now();
    if (now - lastAlertTime < 3000) return; // 3-second cooldown
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 440; // 440Hz beep
      gainNode.gain.setValueAtTime((alertVolume / 100) * 0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2); // 200ms duration
      
      setLastAlertTime(now);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 1000);
    } catch (err) {
      console.warn('Audio alert failed:', err);
    }
  }, [alertsEnabled, alertVolume, lastAlertTime]);

  // Detection loop
  const detect = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isDetecting || !state.isModelLoaded) {
      if (isDetecting) {
        animationFrameRef.current = requestAnimationFrame(detect);
      }
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    // Process every N frames based on frequency setting
    if (frameCount % frequency === 0) {
      try {
        const predictions = await tensorFlowService.detectObjects(video);
        
        // Filter for military vehicles only
        const militaryPredictions = predictions.filter(prediction => {
          const militaryTypes = ['Tank/Military Vehicle', 'Military Truck', 'Fighter Jet', 'Naval Ship'];
          return militaryTypes.some(type => prediction.class.includes(type)) && 
                 prediction.score >= confidence;
        });

        // Clear canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        if (militaryPredictions.length > 0) {
          tensorFlowService.drawDetections(canvas, militaryPredictions, video.videoWidth, video.videoHeight);
          
          // Update detection count and log
          setDetectionCount(prev => prev + militaryPredictions.length);
          
          militaryPredictions.forEach(prediction => {
            const logEntry = {
              id: Math.random().toString(36),
              type: prediction.class,
              confidence: Math.round(prediction.score * 100),
              timestamp: new Date()
            };
            
            setDetectionLog(prev => [logEntry, ...prev.slice(0, 49)]); // Keep last 50 detections
            
            // Save to localStorage
            const existingDetections = JSON.parse(localStorage.getItem('indra-netra-detections') || '[]');
            const detectionRecord = {
              id: logEntry.id,
              timestamp: Date.now(),
              vehicleType: prediction.class,
              confidence: prediction.score,
              bbox: prediction.bbox,
              threatLevel: prediction.score > 0.9 ? 'HIGH' : prediction.score > 0.7 ? 'MEDIUM' : 'LOW',
              source: 'live',
              imageData: null
            };
            existingDetections.unshift(detectionRecord);
            localStorage.setItem('indra-netra-detections', JSON.stringify(existingDetections.slice(0, 1000)));
          });

          // Update threat level based on highest confidence
          const maxConfidence = Math.max(...militaryPredictions.map(p => p.score));
          if (maxConfidence > 0.8) {
            setThreatLevel('high');
            if (maxConfidence >= alertThreshold) {
              playAlertSound();
            }
          } else if (maxConfidence > 0.6) {
            setThreatLevel('medium');
          } else {
            setThreatLevel('low');
          }
        } else {
          setThreatLevel('low');
        }

      } catch (error) {
        console.error('Detection error:', error);
      }
    }

    // Update FPS counter
    setFrameCount(prev => prev + 1);
    const now = Date.now();
    if (now - lastFpsUpdate > 1000) {
      setFps(Math.round((frameCount * 1000) / (now - lastFpsUpdate)));
      setFrameCount(0);
      setLastFpsUpdate(now);
    }

    // Continue detection loop
    if (isDetecting) {
      animationFrameRef.current = requestAnimationFrame(detect);
    }
  }, [isDetecting, state.isModelLoaded, confidence, frequency, alertThreshold, playAlertSound, frameCount, lastFpsUpdate]);

  // Start detection loop when detecting is enabled
  useEffect(() => {
    if (isDetecting && isActive) {
      detect();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDetecting, isActive, detect]);

  const handleStartDetection = async () => {
    if (!isActive) {
      const res = resolutionMap[resolution];
      await startCamera({ ...res, facingMode: 'environment' });
    }
    setIsDetecting(true);
    setDetectionCount(0);
    setDetectionLog([]);
    setFrameCount(0);
    setLastFpsUpdate(Date.now());
  };

  const handleStopDetection = () => {
    setIsDetecting(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    stopCamera();
    setDetectionCount(0);
    setDetectionLog([]);
    setThreatLevel('low');
    setFps(0);
  };

  const takeScreenshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const screenshotCanvas = document.createElement('canvas');
    const ctx = screenshotCanvas.getContext('2d');
    if (!ctx) return;

    const video = videoRef.current;
    screenshotCanvas.width = video.videoWidth;
    screenshotCanvas.height = video.videoHeight;

    // Draw video frame
    ctx.drawImage(video, 0, 0);
    
    // Draw detections on top
    if (canvasRef.current) {
      ctx.drawImage(canvasRef.current, 0, 0);
    }

    // Download screenshot
    screenshotCanvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `indra-netra-detection-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  };

  const updateSetting = (key: string, value: string) => {
    localStorage.setItem(`indra-netra-settings-${key}`, value);
    // Show saved feedback
    const feedback = document.createElement('div');
    feedback.textContent = 'Saved ✓';
    feedback.className = 'fixed top-4 right-4 bg-green-600 text-white px-3 py-1 rounded z-50';
    document.body.appendChild(feedback);
    setTimeout(() => document.body.removeChild(feedback), 2000);
  };

  if (!state.isModelLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner 
          size="lg" 
          text="Loading TensorFlow.js Model..." 
          progress={state.modelLoadingProgress}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Live Detection</h1>
          <p className="text-gray-400">Real-time military vehicle detection using AI</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Video Display */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`bg-slate-800 rounded-2xl p-6 ${showAlert ? 'ring-4 ring-red-500 animate-pulse' : ''}`}
            >
              <div className="relative">
                {error ? (
                  <div className="aspect-video bg-slate-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <CameraOff className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">{error}</p>
                      <button
                        onClick={() => startCamera()}
                        className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
                      >
                        Retry Camera Access
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      onLoadedMetadata={() => {
                        if (canvasRef.current && videoRef.current) {
                          canvasRef.current.width = videoRef.current.videoWidth;
                          canvasRef.current.height = videoRef.current.videoHeight;
                        }
                      }}
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full"
                      style={{ pointerEvents: 'none' }}
                    />
                    
                    {/* Threat level indicator */}
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white font-semibold ${
                      threatLevel === 'high' ? 'bg-red-600 animate-pulse' :
                      threatLevel === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                    }`}>
                      Threat: {threatLevel.toUpperCase()}
                    </div>

                    {/* FPS Counter */}
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg">
                      {fps} FPS
                    </div>

                    {/* Detection status */}
                    {isDetecting && (
                      <div className="absolute bottom-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full animate-pulse">
                        ● DETECTING
                      </div>
                    )}

                    {/* Alert indicator */}
                    {showAlert && (
                      <div className="absolute inset-0 border-4 border-red-500 animate-pulse">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-4 py-2 rounded-lg">
                          <AlertTriangle className="h-5 w-5 inline mr-2" />
                          HIGH THREAT DETECTED
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Controls */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    {isDetecting ? (
                      <button
                        onClick={handleStopDetection}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                      >
                        <Pause className="h-4 w-4" />
                        <span>Stop Detection</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleStartDetection}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                      >
                        <Play className="h-4 w-4" />
                        <span>Start Detection</span>
                      </button>
                    )}

                    <button
                      onClick={takeScreenshot}
                      disabled={!isActive}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Screenshot</span>
                    </button>

                    <button
                      onClick={() => updateSetting('alerts-enabled', (!alertsEnabled).toString())}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                        alertsEnabled ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-600 hover:bg-gray-700'
                      } text-white`}
                    >
                      {alertsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      <span>Alerts</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {devices.length > 1 && (
                      <select
                        onChange={(e) => switchCamera(e.target.value)}
                        className="bg-slate-700 text-white rounded-lg px-3 py-2"
                      >
                        {devices.map((device, index) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            Camera {index + 1}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-slate-800 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-orange-500">{detectionCount}</div>
                  <div className="text-gray-400 text-sm">Total Detections</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-500">{fps}</div>
                  <div className="text-gray-400 text-sm">Current FPS</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${
                    threatLevel === 'high' ? 'text-red-500' :
                    threatLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {threatLevel.toUpperCase()}
                  </div>
                  <div className="text-gray-400 text-sm">Threat Level</div>
                </div>
              </div>
            </motion.div>

            {/* Quick Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-slate-800 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Quick Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Confidence: {Math.round(confidence * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={confidence}
                    onChange={(e) => updateSetting('confidence', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Audio Alerts</span>
                    <input 
                      type="checkbox" 
                      checked={alertsEnabled}
                      onChange={(e) => updateSetting('alerts-enabled', e.target.checked.toString())}
                      className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500" 
                    />
                  </label>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Volume: {alertVolume}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={alertVolume}
                    onChange={(e) => updateSetting('alert-volume', e.target.value)}
                    disabled={!alertsEnabled}
                    className="w-full disabled:opacity-50"
                  />
                </div>
              </div>
            </motion.div>

            {/* Detection Log */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-slate-800 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Recent Detections</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {detectionLog.length === 0 ? (
                  <p className="text-gray-400 text-sm">No military vehicles detected yet</p>
                ) : (
                  detectionLog.map((detection) => (
                    <div key={detection.id} className="bg-slate-700 p-3 rounded-lg">
                      <div className="font-semibold text-white text-sm">{detection.type}</div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-green-500 text-sm">{detection.confidence}%</span>
                        <span className="text-gray-400 text-xs">
                          {detection.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {detectionLog.length > 0 && (
                <button
                  onClick={() => setDetectionLog([])}
                  className="mt-4 w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg text-sm"
                >
                  Clear Log
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Volume2, Maximize, Trash2, AlertTriangle, Eye, EyeOff, Sword as Record, Settings, Monitor, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface StreamConfig {
  id: string;
  name: string;
  url?: string;
  type: 'camera' | 'rtsp';
  description: string;
  location: string;
  status: 'active' | 'inactive' | 'error';
  detectionCount: number;
  isRecording: boolean;
  alertLevel: 'low' | 'medium' | 'high';
}

interface StreamAlert {
  id: string;
  streamId: string;
  streamName: string;
  vehicleType: string;
  confidence: number;
  timestamp: Date;
  acknowledged: boolean;
}

export function SurveillancePage() {
  const { dispatch } = useAppContext();
  const [streams, setStreams] = useState<StreamConfig[]>([]);
  const [alerts, setAlerts] = useState<StreamAlert[]>([]);
  const [gridLayout, setGridLayout] = useState<'1x1' | '2x2' | '3x3' | '4x4'>('2x2');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [newStream, setNewStream] = useState({
    name: '',
    type: 'camera' as 'camera' | 'rtsp',
    url: '',
    description: '',
    location: ''
  });

  // Sample video feeds for demonstration
  const sampleFeeds = [
    { id: 'sample1', name: 'Border Checkpoint Alpha', location: 'LOC Sector A' },
    { id: 'sample2', name: 'Naval Base Perimeter', location: 'Mumbai Coast' },
    { id: 'sample3', name: 'Airfield Surveillance', location: 'Forward Air Base' },
    { id: 'sample4', name: 'Mountain Pass Monitor', location: 'Ladakh Border' }
  ];

  useEffect(() => {
    // Initialize with sample streams
    if (streams.length === 0) {
      const initialStreams: StreamConfig[] = sampleFeeds.map(feed => ({
        id: feed.id,
        name: feed.name,
        type: 'camera',
        description: `Automated surveillance of ${feed.name}`,
        location: feed.location,
        status: 'active',
        detectionCount: Math.floor(Math.random() * 20),
        isRecording: false,
        alertLevel: 'low'
      }));
      setStreams(initialStreams);
    }
  }, []);

  // Simulate detection updates and alerts
  useEffect(() => {
    const interval = setInterval(() => {
      setStreams(prev => prev.map(stream => {
        const newDetectionCount = stream.detectionCount + (Math.random() > 0.8 ? 1 : 0);
        const newAlertLevel = Math.random() > 0.9 ? 'high' : Math.random() > 0.7 ? 'medium' : 'low';
        
        // Generate alert if high threat detected
        if (newAlertLevel === 'high' && stream.alertLevel !== 'high') {
          const alert: StreamAlert = {
            id: Math.random().toString(36),
            streamId: stream.id,
            streamName: stream.name,
            vehicleType: ['Tank', 'Fighter Jet', 'Naval Ship', 'Military Truck'][Math.floor(Math.random() * 4)],
            confidence: 85 + Math.floor(Math.random() * 15),
            timestamp: new Date(),
            acknowledged: false
          };
          setAlerts(prev => [alert, ...prev.slice(0, 49)]);
        }
        
        return {
          ...stream,
          detectionCount: newDetectionCount,
          alertLevel: newAlertLevel
        };
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const addStream = () => {
    if (!newStream.name || !newStream.location) return;

    const stream: StreamConfig = {
      id: Math.random().toString(36),
      name: newStream.name,
      type: newStream.type,
      url: newStream.url || undefined,
      description: newStream.description,
      location: newStream.location,
      status: 'active',
      detectionCount: 0,
      isRecording: false,
      alertLevel: 'low'
    };

    setStreams(prev => [...prev, stream]);
    setNewStream({ name: '', type: 'camera', url: '', description: '', location: '' });
    setShowAddModal(false);

    // Add to global state
    dispatch({
      type: 'ADD_STREAM',
      payload: {
        id: stream.id,
        name: stream.name,
        url: stream.url,
        description: stream.description,
        location: stream.location,
        status: stream.status,
        lastActive: Date.now(),
        detectionCount: stream.detectionCount
      }
    });
  };

  const toggleRecording = (streamId: string) => {
    setStreams(prev => prev.map(stream =>
      stream.id === streamId
        ? { ...stream, isRecording: !stream.isRecording }
        : stream
    ));
  };

  const toggleStreamStatus = (streamId: string) => {
    setStreams(prev => prev.map(stream =>
      stream.id === streamId
        ? { 
            ...stream, 
            status: stream.status === 'active' ? 'inactive' : 'active' 
          }
        : stream
    ));
  };

  const deleteStream = (streamId: string) => {
    setStreams(prev => prev.filter(stream => stream.id !== streamId));
    dispatch({ type: 'DELETE_STREAM', payload: streamId });
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const StreamCard = ({ stream }: { stream: StreamConfig }) => (
    <div className="bg-slate-800 rounded-xl overflow-hidden">
      {/* Video Display */}
      <div className="relative aspect-video bg-slate-900">
        {stream.status === 'active' ? (
          // Simulate video feed with colored background and pattern
          <div className={`w-full h-full relative ${
            stream.alertLevel === 'high' ? 'bg-gradient-to-br from-red-900 to-red-800' :
            stream.alertLevel === 'medium' ? 'bg-gradient-to-br from-yellow-900 to-yellow-800' :
            'bg-gradient-to-br from-slate-700 to-slate-600'
          }`}>
            {/* Simulated video pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full bg-[radial-gradient(circle,_white_1px,_transparent_1px)] bg-[length:20px_20px] animate-pulse"></div>
            </div>
            
            {/* Stream info overlay */}
            <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {stream.name}
            </div>
            
            {/* Recording indicator */}
            {stream.isRecording && (
              <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded animate-pulse">
                ● REC
              </div>
            )}

            {/* Alert indicator */}
            {stream.alertLevel === 'high' && (
              <div className="absolute inset-0 border-4 border-red-500 animate-pulse"></div>
            )}

            {/* Detection count */}
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {stream.detectionCount} detections
            </div>

            {/* Simulated bounding box */}
            {stream.detectionCount > 0 && stream.alertLevel !== 'low' && (
              <div className="absolute top-1/3 left-1/4 w-1/3 h-1/4 border-2 border-red-500">
                <div className="bg-red-500 text-white text-xs px-1 -mt-5">
                  Tank 87%
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-700">
            <EyeOff className="h-8 w-8 text-gray-500" />
          </div>
        )}

        {/* Controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => toggleStreamStatus(stream.id)}
                className={`p-1 rounded ${
                  stream.status === 'active' ? 'text-green-500' : 'text-gray-500'
                }`}
              >
                {stream.status === 'active' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              
              <button
                onClick={() => toggleRecording(stream.id)}
                className={`p-1 rounded ${
                  stream.isRecording ? 'text-red-500' : 'text-gray-400'
                }`}
              >
                <Record className="h-4 w-4" />
              </button>
              
              <button className="p-1 rounded text-gray-400 hover:text-white">
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
            
            <button className="p-1 rounded text-gray-400 hover:text-white">
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stream info */}
      <div className="p-3">
        <h3 className="font-semibold text-white text-sm mb-1">{stream.name}</h3>
        <p className="text-gray-400 text-xs mb-2">{stream.location}</p>
        
        <div className="flex items-center justify-between">
          <div className={`text-xs px-2 py-1 rounded ${
            stream.status === 'active' ? 'bg-green-600 text-white' :
            stream.status === 'inactive' ? 'bg-gray-600 text-white' :
            'bg-red-600 text-white'
          }`}>
            {stream.status.toUpperCase()}
          </div>
          
          <div className="flex items-center space-x-1">
            <button className="p-1 rounded text-gray-400 hover:text-white">
              <Settings className="h-3 w-3" />
            </button>
            <button
              onClick={() => deleteStream(stream.id)}
              className="p-1 rounded text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const getGridCols = () => {
    switch (gridLayout) {
      case '1x1': return 'grid-cols-1';
      case '2x2': return 'grid-cols-1 md:grid-cols-2';
      case '3x3': return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case '4x4': return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      default: return 'grid-cols-2';
    }
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Work in Progress Banner */}
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-600 text-black p-4 rounded-xl mb-6 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold">⚠️ WORK IN PROGRESS: RTSP streaming under development. Device cameras available.</span>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-black hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Surveillance Streams</h1>
            <p className="text-gray-400">Multi-camera monitoring with real-time detection</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Grid Layout Selector */}
            <div className="flex items-center space-x-2">
              {(['1x1', '2x2', '3x3', '4x4'] as const).map(layout => (
                <button
                  key={layout}
                  onClick={() => setGridLayout(layout)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    gridLayout === layout
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {layout}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Stream</span>
            </button>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-slate-800 p-4 rounded-xl">
            <div className="text-2xl font-bold text-blue-500">{streams.filter(s => s.status === 'active').length}</div>
            <div className="text-gray-400 text-sm">Active Streams</div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl">
            <div className="text-2xl font-bold text-green-500">
              {streams.reduce((sum, stream) => sum + stream.detectionCount, 0)}
            </div>
            <div className="text-gray-400 text-sm">Total Detections</div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl">
            <div className="text-2xl font-bold text-orange-500">
              {streams.filter(s => s.isRecording).length}
            </div>
            <div className="text-gray-400 text-sm">Recording</div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl">
            <div className="text-2xl font-bold text-red-500">
              {unacknowledgedAlerts.length}
            </div>
            <div className="text-gray-400 text-sm">Active Alerts</div>
          </div>
        </motion.div>

        {/* Alert Panel */}
        {unacknowledgedAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-600 text-white p-4 rounded-xl mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Active Threat Alerts ({unacknowledgedAlerts.length})</span>
              </div>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {unacknowledgedAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="bg-red-700 p-2 rounded flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-semibold">{alert.streamName}</span> - {alert.vehicleType} detected ({alert.confidence}%)
                    <div className="text-xs opacity-90">{alert.timestamp.toLocaleTimeString()}</div>
                  </div>
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="bg-red-800 hover:bg-red-900 px-2 py-1 rounded text-xs"
                  >
                    Acknowledge
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Streams Grid */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`grid ${getGridCols()} gap-4`}
            >
              {streams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </motion.div>

            {streams.length === 0 && (
              <div className="text-center py-12">
                <Monitor className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Surveillance Streams</h3>
                <p className="text-gray-400 mb-6">Add your first surveillance stream to start monitoring</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg"
                >
                  Add First Stream
                </button>
              </div>
            )}
          </div>

          {/* Alert History Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-slate-800 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Alert History</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="text-gray-400 text-sm">No alerts yet</p>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className={`p-3 rounded-lg ${
                      alert.acknowledged ? 'bg-slate-700' : 'bg-red-900/50'
                    }`}>
                      <div className="font-semibold text-white text-sm">{alert.streamName}</div>
                      <div className="text-sm text-gray-300">{alert.vehicleType} - {alert.confidence}%</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {alert.timestamp.toLocaleString()}
                      </div>
                      {!alert.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="mt-2 bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Add Stream Modal */}
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Add New Stream</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Stream Name</label>
                  <input
                    type="text"
                    value={newStream.name}
                    onChange={(e) => setNewStream(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
                    placeholder="e.g., Checkpoint Alpha"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Type</label>
                  <select
                    value={newStream.type}
                    onChange={(e) => setNewStream(prev => ({ ...prev, type: e.target.value as 'camera' | 'rtsp' }))}
                    className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
                  >
                    <option value="camera">Device Camera</option>
                    <option value="rtsp">RTSP Stream (Coming Soon)</option>
                  </select>
                </div>

                {newStream.type === 'rtsp' && (
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">RTSP URL</label>
                    <input
                      type="text"
                      value={newStream.url}
                      onChange={(e) => setNewStream(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
                      placeholder="rtsp://camera.ip/stream"
                      disabled
                    />
                    <p className="text-yellow-500 text-xs mt-1">RTSP streaming under development</p>
                  </div>
                )}

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Location</label>
                  <input
                    type="text"
                    value={newStream.location}
                    onChange={(e) => setNewStream(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
                    placeholder="e.g., Border Sector A"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Description</label>
                  <textarea
                    value={newStream.description}
                    onChange={(e) => setNewStream(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
                    placeholder="Brief description of the surveillance area"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={addStream}
                  disabled={newStream.type === 'rtsp'}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold"
                >
                  Add Stream
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
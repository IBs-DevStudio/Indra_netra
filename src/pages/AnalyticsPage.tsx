import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  Download, 
  TrendingUp,
  Target,
  Clock,
  Shield,
  AlertTriangle
} from 'lucide-react';

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7days');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState(0.5);
  const [sourceFilter, setSourceFilter] = useState('all');

  // Get data from localStorage
  const detections = JSON.parse(localStorage.getItem('indra-netra-detections') || '[]');

  // Filter data based on current filters
  const filteredDetections = useMemo(() => {
    const now = Date.now();
    const timeFilter = dateRange === '1day' ? 24 * 60 * 60 * 1000 :
                     dateRange === '7days' ? 7 * 24 * 60 * 60 * 1000 :
                     30 * 24 * 60 * 60 * 1000;

    return detections.filter((detection: any) => {
      const timeMatch = now - detection.timestamp <= timeFilter;
      const vehicleMatch = vehicleFilter === 'all' || detection.vehicleType.includes(vehicleFilter);
      const confidenceMatch = detection.confidence >= confidenceFilter;
      const sourceMatch = sourceFilter === 'all' || detection.source === sourceFilter;
      
      return timeMatch && vehicleMatch && confidenceMatch && sourceMatch;
    });
  }, [detections, dateRange, vehicleFilter, confidenceFilter, sourceFilter]);

  // Generate analytics data
  const analyticsData = useMemo(() => {
    if (filteredDetections.length === 0) {
      return {
        timeline: [],
        vehicleTypes: [],
        confidence: [],
        threatLevels: { HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 }
      };
    }

    // Timeline data (detections over time)
    const days = dateRange === '1day' ? 24 : dateRange === '7days' ? 7 : 30;
    const timeUnit = dateRange === '1day' ? 'hour' : 'day';
    
    const timelineData = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      if (timeUnit === 'hour') {
        date.setHours(date.getHours() - (days - 1 - i));
      } else {
        date.setDate(date.getDate() - (days - 1 - i));
      }
      
      const periodStart = date.getTime();
      const periodEnd = periodStart + (timeUnit === 'hour' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000);
      
      const periodDetections = filteredDetections.filter((d: any) => 
        d.timestamp >= periodStart && d.timestamp < periodEnd
      );

      return {
        date: timeUnit === 'hour' ? date.toLocaleTimeString('en-IN', { hour: '2-digit' }) : 
              date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        detections: periodDetections.length,
        tanks: periodDetections.filter((d: any) => d.vehicleType.includes('Tank')).length,
        jets: periodDetections.filter((d: any) => d.vehicleType.includes('Jet')).length,
        ships: periodDetections.filter((d: any) => d.vehicleType.includes('Ship')).length,
        trucks: periodDetections.filter((d: any) => d.vehicleType.includes('Truck')).length
      };
    });

    // Vehicle type distribution
    const vehicleTypeCounts = filteredDetections.reduce((acc: any, detection: any) => {
      const type = detection.vehicleType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const vehicleTypes = Object.entries(vehicleTypeCounts).map(([name, value]) => ({
      name,
      value: value as number,
      color: name.includes('Tank') ? '#DC2626' :
             name.includes('Jet') ? '#2563EB' :
             name.includes('Ship') ? '#059669' : '#D97706'
    }));

    // Confidence score distribution
    const confidenceData = [
      { range: '0-20%', count: 0 },
      { range: '20-40%', count: 0 },
      { range: '40-60%', count: 0 },
      { range: '60-80%', count: 0 },
      { range: '80-100%', count: 0 }
    ];

    filteredDetections.forEach((detection: any) => {
      const confidence = detection.confidence * 100;
      if (confidence < 20) confidenceData[0].count++;
      else if (confidence < 40) confidenceData[1].count++;
      else if (confidence < 60) confidenceData[2].count++;
      else if (confidence < 80) confidenceData[3].count++;
      else confidenceData[4].count++;
    });

    // Threat level distribution
    const threatLevels = filteredDetections.reduce((acc: any, detection: any) => {
      const level = detection.threatLevel || 'LOW';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, { HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 });

    return {
      timeline: timelineData,
      vehicleTypes,
      confidence: confidenceData,
      threatLevels
    };
  }, [filteredDetections, dateRange]);

  const totalDetections = filteredDetections.length;
  const avgConfidence = filteredDetections.length > 0 
    ? Math.round(filteredDetections.reduce((sum: number, d: any) => sum + d.confidence, 0) / filteredDetections.length * 100)
    : 0;

  if (detections.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">Comprehensive analysis of military vehicle detections</p>
          </motion.div>

          <div className="text-center py-12">
            <BarChart className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Data Yet</h3>
            <p className="text-gray-400 mb-6">Start using Live Detection or Image Analysis to generate analytics data</p>
          </div>
        </div>
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
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">Comprehensive analysis of military vehicle detections</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-slate-800 text-white p-2 rounded-lg border border-slate-600"
            >
              <option value="1day">Last 24 Hours</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
            
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-slate-800 p-4 rounded-xl mb-6"
        >
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Vehicle Type</label>
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="w-full bg-slate-700 text-white p-2 rounded-lg border border-slate-600"
              >
                <option value="all">All Types</option>
                <option value="Tank">Tanks</option>
                <option value="Jet">Fighter Jets</option>
                <option value="Ship">Naval Ships</option>
                <option value="Truck">Military Trucks</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Min Confidence: {Math.round(confidenceFilter * 100)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={confidenceFilter}
                onChange={(e) => setConfidenceFilter(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Source</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full bg-slate-700 text-white p-2 rounded-lg border border-slate-600"
              >
                <option value="all">All Sources</option>
                <option value="live">Live Detection</option>
                <option value="image">Image Analysis</option>
                <option value="surveillance">Surveillance</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setVehicleFilter('all');
                  setConfidenceFilter(0.5);
                  setSourceFilter('all');
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-8 w-8 text-orange-500" />
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{totalDetections}</div>
            <div className="text-gray-400 text-sm">Total Detections</div>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-8 w-8 text-blue-500" />
              <div className={`px-2 py-1 rounded text-xs ${
                avgConfidence > 80 ? 'bg-green-600' : 
                avgConfidence > 60 ? 'bg-yellow-600' : 'bg-red-600'
              }`}>
                {avgConfidence > 80 ? 'High' : avgConfidence > 60 ? 'Medium' : 'Low'}
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{avgConfidence}%</div>
            <div className="text-gray-400 text-sm">Avg Confidence</div>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="text-red-500 text-xs">Critical</div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{analyticsData.threatLevels.HIGH}</div>
            <div className="text-gray-400 text-sm">High Threats</div>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-8 w-8 text-purple-500" />
              <div className="text-purple-500 text-xs">Active</div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{analyticsData.vehicleTypes.length}</div>
            <div className="text-gray-400 text-sm">Vehicle Types</div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Detection Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-slate-800 p-6 rounded-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-6">Detection Timeline</h3>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.timeline}>
                    <defs>
                      <linearGradient id="detectionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="detections" 
                      stroke="#F97316" 
                      fillOpacity={1} 
                      fill="url(#detectionGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Vehicle Type Trends */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-slate-800 p-6 rounded-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-6">Vehicle Type Detection Trends</h3>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.timeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }} 
                    />
                    <Line type="monotone" dataKey="tanks" stroke="#DC2626" strokeWidth={2} name="Tanks" />
                    <Line type="monotone" dataKey="jets" stroke="#2563EB" strokeWidth={2} name="Jets" />
                    <Line type="monotone" dataKey="ships" stroke="#059669" strokeWidth={2} name="Ships" />
                    <Line type="monotone" dataKey="trucks" stroke="#D97706" strokeWidth={2} name="Trucks" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Confidence Distribution */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-slate-800 p-6 rounded-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-6">Confidence Score Distribution</h3>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.confidence}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="range" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }} 
                    />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Sidebar Charts */}
          <div className="space-y-6">
            {/* Vehicle Distribution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-slate-800 p-6 rounded-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-4">Vehicle Type Distribution</h3>
              
              {analyticsData.vehicleTypes.length > 0 ? (
                <>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.vehicleTypes}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {analyticsData.vehicleTypes.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F3F4F6'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2">
                    {analyticsData.vehicleTypes.map((type, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: type.color }}></div>
                          <span className="text-gray-300">{type.name}</span>
                        </div>
                        <span className="text-white font-semibold">{type.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-400 text-center py-8">No vehicle data available</p>
              )}
            </motion.div>

            {/* Threat Level Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-slate-800 p-6 rounded-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-4">Threat Level Analysis</h3>
              
              <div className="space-y-3">
                {Object.entries(analyticsData.threatLevels).map(([level, count]) => (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded ${
                        level === 'HIGH' ? 'bg-red-500' :
                        level === 'MEDIUM' ? 'bg-yellow-500' :
                        level === 'LOW' ? 'bg-orange-500' : 'bg-green-500'
                      }`}></div>
                      <span className="text-gray-300 text-sm">{level}</span>
                    </div>
                    <span className="text-white font-semibold">{String(count)}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-slate-800 p-6 rounded-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm">
                  Generate Full Report
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-sm">
                  Export Data (JSON)
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg text-sm">
                  Schedule Report
                </button>
                <button 
                  onClick={() => {
                    if (confirm('Clear all analytics data? This cannot be undone.')) {
                      localStorage.removeItem('indra-netra-detections');
                      window.location.reload();
                    }
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg text-sm"
                >
                  Clear Analytics Data
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
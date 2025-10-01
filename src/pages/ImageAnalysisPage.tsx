import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, Trash2, AlertCircle, Shield } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { tensorFlowService } from '../utils/tensorflow';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface ImageAnalysis {
  id: string;
  file: File;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  detections: Array<{
    class: string;
    score: number;
    bbox: number[];
  }>;
  threatLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  processingTime?: number;
}

export function ImageAnalysisPage() {
  const { state } = useAppContext();
  const [images, setImages] = useState<ImageAnalysis[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageAnalysis | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [filterThreat, setFilterThreat] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get settings from localStorage
  const confidence = parseFloat(localStorage.getItem('indra-netra-settings-confidence') || '0.6');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/') && 
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) &&
      file.size <= 10 * 1024 * 1024 // 10MB limit
    );
    
    if (files.length > 10) {
      alert('Maximum 10 files allowed');
      return;
    }
    
    addImages(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file => 
      file.size <= 10 * 1024 * 1024
    );
    
    if (files.length > 10) {
      alert('Maximum 10 files allowed');
      return;
    }
    
    addImages(files);
  };

  const addImages = (files: File[]) => {
    const newImages: ImageAnalysis[] = files.map(file => ({
      id: Math.random().toString(36),
      file,
      url: URL.createObjectURL(file),
      status: 'pending',
      detections: [],
      threatLevel: 'NONE'
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const calculateThreatLevel = (detections: any[]): 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' => {
    if (detections.length === 0) return 'NONE';
    
    const maxConfidence = Math.max(...detections.map(d => d.score));
    const count = detections.length;
    
    if (count >= 3 || maxConfidence > 0.9) return 'HIGH';
    if ((count >= 1 && count <= 2) && maxConfidence >= 0.7 && maxConfidence <= 0.9) return 'MEDIUM';
    if (count === 1 && maxConfidence >= 0.5 && maxConfidence < 0.7) return 'LOW';
    
    return 'NONE';
  };

  const processImage = async (imageAnalysis: ImageAnalysis) => {
    if (!state.isModelLoaded) {
      console.error('Model not loaded');
      return;
    }

    setImages(prev => prev.map(img => 
      img.id === imageAnalysis.id ? { ...img, status: 'processing' } : img
    ));

    const startTime = Date.now();

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageAnalysis.url;
      });

      const predictions = await tensorFlowService.detectObjects(img);
      const processingTime = Date.now() - startTime;

      // Filter for military vehicles only
      const militaryDetections = predictions.filter(prediction => {
        const militaryTypes = ['Tank/Military Vehicle', 'Military Truck', 'Fighter Jet', 'Naval Ship'];
        return militaryTypes.some(type => prediction.class.includes(type)) && 
               prediction.score >= confidence;
      });

      const threatLevel = calculateThreatLevel(militaryDetections);

      setImages(prev => prev.map(imgAnalysis => 
        imgAnalysis.id === imageAnalysis.id 
          ? { 
              ...imgAnalysis, 
              status: 'completed', 
              detections: militaryDetections,
              threatLevel,
              processingTime 
            }
          : imgAnalysis
      ));

      // Save to localStorage
      const existingDetections = JSON.parse(localStorage.getItem('indra-netra-detections') || '[]');
      militaryDetections.forEach(detection => {
        const detectionRecord = {
          id: Math.random().toString(36),
          timestamp: Date.now(),
          vehicleType: detection.class,
          confidence: detection.score,
          bbox: detection.bbox,
          threatLevel,
          source: 'image',
          imageData: imageAnalysis.url
        };
        existingDetections.unshift(detectionRecord);
      });
      localStorage.setItem('indra-netra-detections', JSON.stringify(existingDetections.slice(0, 1000)));

    } catch (error) {
      console.error('Processing failed:', error);
      setImages(prev => prev.map(img => 
        img.id === imageAnalysis.id ? { ...img, status: 'error' } : img
      ));
    }
  };

  const processAllPending = async () => {
    const pendingImages = images.filter(img => img.status === 'pending');
    
    for (const image of pendingImages) {
      await processImage(image);
      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const drawDetectionsOnCanvas = (image: ImageAnalysis, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Draw detections
      image.detections.forEach(detection => {
        const [x, y, width, height] = detection.bbox;
        
        // Color based on threat level
        const color = image.threatLevel === 'HIGH' ? '#DC2626' : 
                     image.threatLevel === 'MEDIUM' ? '#EAB308' : '#059669';
        
        // Draw bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);

        // Draw label background
        const label = `${detection.class} ${Math.round(detection.score * 100)}%`;
        ctx.font = '16px Arial';
        const textMetrics = ctx.measureText(label);
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y - 30, textMetrics.width + 10, 30);

        // Draw label text
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(label, x + 5, y - 8);
      });
    };
    img.src = image.url;
  };

  const downloadImageWithDetections = (image: ImageAnalysis) => {
    const canvas = document.createElement('canvas');
    drawDetectionsOnCanvas(image, canvas);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analyzed-${image.file.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  };

  const exportData = (format: 'json' | 'images') => {
    const completedImages = images.filter(img => img.status === 'completed');
    
    if (format === 'json') {
      const data = completedImages.map(img => ({
        filename: img.file.name,
        detections: img.detections.length,
        threatLevel: img.threatLevel,
        vehicles: img.detections.map(d => ({
          type: d.class,
          confidence: Math.round(d.score * 100)
        }))
      }));
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `indra-netra-analysis-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Export all images with detections
      completedImages.forEach(img => downloadImageWithDetections(img));
    }
  };

  const deleteImage = (imageId: string) => {
    setImages(prev => {
      const imageToDelete = prev.find(img => img.id === imageId);
      if (imageToDelete) {
        URL.revokeObjectURL(imageToDelete.url);
      }
      return prev.filter(img => img.id !== imageId);
    });
    
    if (selectedImage?.id === imageId) {
      setSelectedImage(null);
    }
  };

  const clearAllImages = () => {
    images.forEach(img => URL.revokeObjectURL(img.url));
    setImages([]);
    setSelectedImage(null);
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

  const filteredImages = filterThreat === 'all' ? images : images.filter(img => img.threatLevel === filterThreat);
  const completedImages = images.filter(img => img.status === 'completed');
  const totalDetections = completedImages.reduce((sum, img) => sum + img.detections.length, 0);
  const threatCounts = {
    HIGH: completedImages.filter(img => img.threatLevel === 'HIGH').length,
    MEDIUM: completedImages.filter(img => img.threatLevel === 'MEDIUM').length,
    LOW: completedImages.filter(img => img.threatLevel === 'LOW').length,
    NONE: completedImages.filter(img => img.threatLevel === 'NONE').length
  };

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
          <h1 className="text-3xl font-bold text-white mb-2">Image Analysis</h1>
          <p className="text-gray-400">Upload and analyze images for military vehicle detection</p>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-slate-800 p-4 rounded-xl">
            <div className="text-2xl font-bold text-blue-500">{images.length}</div>
            <div className="text-gray-400 text-sm">Images Uploaded</div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl">
            <div className="text-2xl font-bold text-green-500">{completedImages.length}</div>
            <div className="text-gray-400 text-sm">Processed</div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl">
            <div className="text-2xl font-bold text-orange-500">{totalDetections}</div>
            <div className="text-gray-400 text-sm">Total Detections</div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl">
            <div className="text-2xl font-bold text-red-500">{threatCounts.HIGH}</div>
            <div className="text-gray-400 text-sm">High Threats</div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Zone */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-slate-800 rounded-2xl p-6"
            >
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  dragOver 
                    ? 'border-orange-500 bg-orange-500/10' 
                    : 'border-gray-600 hover:border-orange-500'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Upload Images for Analysis</h3>
                <p className="text-gray-400 mb-4">Drag & drop images here or click to select</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg"
                >
                  Choose Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <p className="text-gray-500 text-sm mt-2">JPG, PNG, WebP (max 10MB each, 10 files max)</p>
              </div>
            </motion.div>

            {/* Controls */}
            {images.length > 0 && (
              <div className="flex items-center justify-between bg-slate-800 p-4 rounded-xl">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={processAllPending}
                    disabled={!images.some(img => img.status === 'pending')}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Analyze All
                  </button>
                  
                  <select
                    value={filterThreat}
                    onChange={(e) => setFilterThreat(e.target.value)}
                    className="bg-slate-700 text-white rounded-lg px-3 py-2"
                  >
                    <option value="all">All Threats</option>
                    <option value="HIGH">High Threat</option>
                    <option value="MEDIUM">Medium Threat</option>
                    <option value="LOW">Low Threat</option>
                    <option value="NONE">No Threat</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => exportData('json')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={() => exportData('images')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Export Images
                  </button>
                  <button
                    onClick={clearAllImages}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}

            {/* Images Grid */}
            {filteredImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filteredImages.map((image) => (
                  <div key={image.id} className="bg-slate-800 rounded-xl overflow-hidden">
                    <div className="relative">
                      <img
                        src={image.url}
                        alt="Analysis preview"
                        className="w-full h-48 object-cover cursor-pointer"
                        onClick={() => setSelectedImage(image)}
                      />
                      
                      {/* Status badge */}
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold ${
                        image.status === 'pending' ? 'bg-gray-600 text-gray-300' :
                        image.status === 'processing' ? 'bg-blue-600 text-white animate-pulse' :
                        image.status === 'completed' ? 'bg-green-600 text-white' :
                        'bg-red-600 text-white'
                      }`}>
                        {image.status.toUpperCase()}
                      </div>

                      {/* Threat level badge */}
                      {image.status === 'completed' && (
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
                          image.threatLevel === 'HIGH' ? 'bg-red-600 text-white' :
                          image.threatLevel === 'MEDIUM' ? 'bg-yellow-600 text-white' :
                          image.threatLevel === 'LOW' ? 'bg-orange-600 text-white' :
                          'bg-green-600 text-white'
                        }`}>
                          {image.threatLevel}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="font-semibold text-white text-sm mb-2 truncate">{image.file.name}</div>
                      <div className="text-xs text-gray-400 mb-2">
                        {(image.file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                      
                      {image.status === 'completed' && (
                        <div className="text-sm text-green-500 mb-2">
                          {image.detections.length} detections ({image.processingTime}ms)
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        {image.status === 'pending' && (
                          <button
                            onClick={() => processImage(image)}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs"
                          >
                            Analyze
                          </button>
                        )}

                        {image.status === 'completed' && (
                          <button
                            onClick={() => downloadImageWithDetections(image)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
                          >
                            <Download className="h-3 w-3" />
                          </button>
                        )}

                        <button
                          onClick={() => deleteImage(image.id)}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Threat Level Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-slate-800 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Threat Analysis</h3>
              <div className="space-y-3">
                {Object.entries(threatCounts).map(([level, count]) => (
                  <div key={level} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Shield className={`h-4 w-4 ${
                        level === 'HIGH' ? 'text-red-500' :
                        level === 'MEDIUM' ? 'text-yellow-500' :
                        level === 'LOW' ? 'text-orange-500' : 'text-green-500'
                      }`} />
                      <span className="text-gray-300 text-sm">{level}</span>
                    </div>
                    <span className="text-white font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Vehicle Types */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-slate-800 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Detected Vehicle Types</h3>
              <div className="space-y-3">
                {['Tank/Military Vehicle', 'Military Truck', 'Fighter Jet', 'Naval Ship'].map((type) => {
                  const count = completedImages.reduce((sum, img) => 
                    sum + img.detections.filter(d => d.class.includes(type)).length, 0
                  );
                  
                  return (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">{type}</span>
                      <span className="text-orange-500 font-semibold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-slate-800 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Analysis Tips</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>HIGH: 3+ vehicles OR &gt;90% confidence</span>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>MEDIUM: 1-2 vehicles at 70-90% confidence</span>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>LOW: 1 vehicle at 50-70% confidence</span>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Use clear, high-resolution images</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Detailed View Modal */}
        {selectedImage && selectedImage.status === 'completed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div 
              className="bg-slate-800 rounded-2xl max-w-4xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">{selectedImage.file.name}</h3>
                  <div className="flex items-center space-x-2">
                    <div className={`px-3 py-1 rounded text-sm font-semibold ${
                      selectedImage.threatLevel === 'HIGH' ? 'bg-red-600 text-white' :
                      selectedImage.threatLevel === 'MEDIUM' ? 'bg-yellow-600 text-white' :
                      selectedImage.threatLevel === 'LOW' ? 'bg-orange-600 text-white' :
                      'bg-green-600 text-white'
                    }`}>
                      {selectedImage.threatLevel} THREAT
                    </div>
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="text-gray-400 hover:text-white text-2xl"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                <div className="relative mb-4">
                  <img
                    src={selectedImage.url}
                    alt="Analysis result"
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Detection Results</h4>
                    <div className="grid gap-2">
                      {selectedImage.detections.length === 0 ? (
                        <p className="text-gray-400">No military vehicles detected</p>
                      ) : (
                        selectedImage.detections.map((detection, index) => (
                          <div key={index} className="bg-slate-700 p-3 rounded-lg flex justify-between items-center">
                            <span className="text-white">{detection.class}</span>
                            <span className="text-green-500 font-semibold">
                              {Math.round(detection.score * 100)}%
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => downloadImageWithDetections(selectedImage)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download with Detections</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
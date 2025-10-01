import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export class TensorFlowService {
  private model: cocoSsd.ObjectDetection | null = null;

  async loadModel(onProgress?: (progress: number) => void): Promise<void> {
    
    try {
      await tf.ready();
      await tf.setBackend('webgl');
      
      if (onProgress) onProgress(30);
      
      this.model = await cocoSsd.load({
        base: 'mobilenet_v2'
      });
      
      if (onProgress) onProgress(100);
    } catch (error) {
      console.error('Failed to load TensorFlow model:', error);
      throw error;
    }
  }

  async detectObjects(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<cocoSsd.DetectedObject[]> {
    if (!this.model) {
      throw new Error('Model not loaded');
    }

    try {
      const predictions = await this.model.detect(imageElement);
      return this.filterMilitaryVehicles(predictions);
    } catch (error) {
      console.error('Detection failed:', error);
      return [];
    }
  }

  private filterMilitaryVehicles(predictions: cocoSsd.DetectedObject[]): cocoSsd.DetectedObject[] {
    const militaryClasses = new Map([
      ['car', 'Tank/Military Vehicle'],
      ['truck', 'Military Truck'],
      ['airplane', 'Fighter Jet'],
      ['boat', 'Naval Ship'],
      ['train', 'Military Train']
    ]);

    return predictions
      .filter(prediction => militaryClasses.has(prediction.class))
      .map(prediction => ({
        ...prediction,
        class: militaryClasses.get(prediction.class) || prediction.class
      }))
      .filter(prediction => {
        // Additional filtering based on size and confidence for better military vehicle classification
        if (prediction.class === 'Tank/Military Vehicle') {
          const [, , width, height] = prediction.bbox;
          const area = width * height;
          return area > 5000 && prediction.score > 0.3; // Larger vehicles more likely to be military
        }
        return prediction.score > 0.4;
      });
  }

  drawDetections(
    canvas: HTMLCanvasElement,
    predictions: cocoSsd.DetectedObject[],
    videoWidth: number,
    videoHeight: number
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    predictions.forEach(prediction => {
      const [x, y, width, height] = prediction.bbox;
      
      // Scale coordinates to canvas size
      const scaleX = canvas.width / videoWidth;
      const scaleY = canvas.height / videoHeight;
      
      const scaledX = x * scaleX;
      const scaledY = y * scaleY;
      const scaledWidth = width * scaleX;
      const scaledHeight = height * scaleY;

      // Draw bounding box
      ctx.strokeStyle = prediction.score > 0.7 ? '#DC2626' : '#EAB308';
      ctx.lineWidth = 3;
      ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

      // Draw semi-transparent fill
      ctx.fillStyle = prediction.score > 0.7 ? 'rgba(220, 38, 38, 0.1)' : 'rgba(234, 179, 8, 0.1)';
      ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);

      // Draw label background
      const label = `${prediction.class} ${Math.round(prediction.score * 100)}%`;
      ctx.font = '14px Arial';
      const textMetrics = ctx.measureText(label);
      
      ctx.fillStyle = prediction.score > 0.7 ? '#DC2626' : '#EAB308';
      ctx.fillRect(scaledX, scaledY - 25, textMetrics.width + 10, 25);

      // Draw label text
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(label, scaledX + 5, scaledY - 8);
    });
  }

  isModelLoaded(): boolean {
    return this.model !== null;
  }
}

export const tensorFlowService = new TensorFlowService();
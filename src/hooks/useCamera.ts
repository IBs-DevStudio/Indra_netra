import { useState, useRef, useCallback, useEffect } from 'react';

interface CameraConfig {
  width: number;
  height: number;
  facingMode: 'user' | 'environment';
}

export function useCamera() {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const getDevices = useCallback(async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
    } catch (err) {
      setError('Failed to enumerate camera devices');
    }
  }, []);

  const startCamera = useCallback(async (config: Partial<CameraConfig> = {}) => {
    try {
      setError(null);
      
      const constraints: MediaStreamConstraints = {
        video: {
          width: config.width || 1280,
          height: config.height || 720,
          facingMode: config.facingMode || 'environment'
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      streamRef.current = stream;
      setIsActive(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Camera access denied';
      setError(errorMessage);
      setIsActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsActive(false);
    setError(null);
  }, []);

  const switchCamera = useCallback(async (deviceId: string) => {
    stopCamera();
    
    try {
      const constraints: MediaStreamConstraints = {
        video: { deviceId: { exact: deviceId } }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      streamRef.current = stream;
      setIsActive(true);
    } catch (err) {
      setError('Failed to switch camera');
    }
  }, [stopCamera]);

  useEffect(() => {
    getDevices();
    
    return () => {
      stopCamera();
    };
  }, [getDevices, stopCamera]);

  return {
    videoRef,
    isActive,
    error,
    devices,
    startCamera,
    stopCamera,
    switchCamera,
    getDevices
  };
}
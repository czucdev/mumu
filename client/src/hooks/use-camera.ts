import { useState, useRef, useCallback, useEffect } from 'react';
import { CameraSettings } from '@/types/photo-booth';

interface CameraError {
  code: string;
  message: string;
}

export function useCamera() {
  const [settings, setSettings] = useState<CameraSettings>({
    facingMode: 'user',
    isActive: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CameraError | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleCameraError = (err: any): CameraError => {
    console.error('Camera error:', err);
    
    if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      return {
        code: 'NOT_FOUND',
        message: 'Không tìm thấy camera trên thiết bị của bạn. Vui lòng kiểm tra lại thiết bị.',
      };
    }
    
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      return {
        code: 'PERMISSION_DENIED',
        message: 'Bạn cần cấp quyền truy cập camera để sử dụng tính năng này.',
      };
    }
    
    if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      return {
        code: 'DEVICE_IN_USE',
        message: 'Camera đang được sử dụng bởi ứng dụng khác. Vui lòng đóng các ứng dụng đang sử dụng camera.',
      };
    }

    if (err.name === 'OverconstrainedError') {
      return {
        code: 'INVALID_CAPABILITIES',
        message: 'Camera không hỗ trợ độ phân giải yêu cầu. Vui lòng thử camera khác.',
      };
    }

    return {
      code: 'UNKNOWN',
      message: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.',
    };
  };

  const checkCameraAvailability = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');
      if (!hasCamera) {
        throw new Error('NotFoundError');
      }
    } catch (err) {
      throw err;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Kiểm tra camera có sẵn
      await checkCameraAvailability();

      // Dừng stream hiện tại nếu có
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: settings.facingMode,
          width: { ideal: 1920, max: 3840 },
          height: { ideal: 1080, max: 2160 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Đảm bảo video đã load xong
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve;
          }
        });
      }

      setSettings(prev => ({ ...prev, isActive: true }));
    } catch (err) {
      const cameraError = handleCameraError(err);
      setError(cameraError);
      setSettings(prev => ({ ...prev, isActive: false }));
    } finally {
      setIsLoading(false);
    }
  }, [settings.facingMode, checkCameraAvailability]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setSettings(prev => ({ ...prev, isActive: false }));
    setError(null);
  }, []);

  const switchCamera = useCallback(async () => {
    const newFacingMode = settings.facingMode === 'user' ? 'environment' : 'user';
    setSettings(prev => ({ ...prev, facingMode: newFacingMode }));
    
    if (settings.isActive) {
      await startCamera();
    }
  }, [settings.facingMode, settings.isActive, startCamera]);

  // Tự động dọn dẹp khi component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Thêm phương thức chụp ảnh
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !settings.isActive) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    return dataUrl;
  }, [settings.isActive]);

  return {
    settings,
    isLoading,
    error,
    videoRef,
    startCamera,
    stopCamera,
    switchCamera,
    capturePhoto,
  };
}

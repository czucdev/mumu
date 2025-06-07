import { useState, useCallback } from 'react';
import { PhotoStripImage, PhotoStripSettings, FilterType } from '@/types/photo-booth';

const DEFAULT_SETTINGS: PhotoStripSettings = {
  photoCount: 4,
  countdownTime: 3,
  delayBetweenPhotos: 3000,
};

export function usePhotoStrip() {
  const [settings, setSettings] = useState<PhotoStripSettings>(DEFAULT_SETTINGS);
  const [photos, setPhotos] = useState<PhotoStripImage[]>([]);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('none');
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentFrame, setCurrentFrame] = useState<'none' | 'classic' | 'modern' | 'polaroid'>('none');

  const addPhoto = useCallback((dataUrl: string) => {
    const newPhoto: PhotoStripImage = {
      id: Date.now().toString(),
      dataUrl,
      filter: {
        type: currentFilter,
        intensity: 1,
      },
      frame: {
        type: currentFrame,
        color: '#ffffff',
      },
      timestamp: Date.now(),
    };

    setPhotos((prev: PhotoStripImage[]) => [...prev, newPhoto]);
  }, [currentFilter, currentFrame]);

  const removePhoto = useCallback((id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
  }, []);

  const clearPhotos = useCallback(() => {
    setPhotos([]);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<PhotoStripSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const startCountdown = useCallback(async () => {
    for (let i = settings.countdownTime; i >= 0; i--) {
      setCountdown(i);
      if (i === 0) {
        // Thêm class flash vào body khi đếm đến 0
        document.body.classList.add('flash');
        // Xóa class sau 300ms
        setTimeout(() => {
          document.body.classList.remove('flash');
        }, 300);
      }
      await sleep(1000);
    }
    setCountdown(null);
  }, [settings.countdownTime]);

  const createPhotoStrip = useCallback(async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx || photos.length === 0) return null;

    const photoWidth = 800;
    const photoHeight = 600;
    const padding = 30;
    const borderRadius = 15;
    const footerHeight = 100; // Chiều cao phần chân để hiển thị thông tin

    // Tính toán kích thước canvas
    canvas.width = photoWidth + (padding * 2);
    canvas.height = (photoHeight * photos.length) + (padding * (photos.length + 1)) + footerHeight;

    // Vẽ nền
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Vẽ từng ảnh
    for (let i = 0; i < photos.length; i++) {
      const img = new Image();
      img.src = photos[i].dataUrl;
      const yPos = padding + i * (photoHeight + padding);

      await new Promise<void>((resolve) => {
        img.onload = () => {
          // Vẽ khung và bóng
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
          ctx.shadowBlur = 15;
          ctx.shadowOffsetY = 5;

          // Vẽ ảnh với bo góc
          ctx.beginPath();
          ctx.moveTo(padding + borderRadius, yPos);
          ctx.lineTo(padding + photoWidth - borderRadius, yPos);
          ctx.quadraticCurveTo(padding + photoWidth, yPos, padding + photoWidth, yPos + borderRadius);
          ctx.lineTo(padding + photoWidth, yPos + photoHeight - borderRadius);
          ctx.quadraticCurveTo(padding + photoWidth, yPos + photoHeight, padding + photoWidth - borderRadius, yPos + photoHeight);
          ctx.lineTo(padding + borderRadius, yPos + photoHeight);
          ctx.quadraticCurveTo(padding, yPos + photoHeight, padding, yPos + photoHeight - borderRadius);
          ctx.lineTo(padding, yPos + borderRadius);
          ctx.quadraticCurveTo(padding, yPos, padding + borderRadius, yPos);
          ctx.closePath();
          ctx.clip();

          // Vẽ ảnh
          ctx.drawImage(img, padding, yPos, photoWidth, photoHeight);
          ctx.restore();

          // Áp dụng filter nếu có
          if (photos[i].filter.type !== 'none') {
            const imageData = ctx.getImageData(padding, yPos, photoWidth, photoHeight);
            applyFilter(imageData, photos[i].filter.type);
            ctx.putImageData(imageData, padding, yPos);
          }

          resolve();
        };
      });
    }

    // Vẽ phần footer với ngày tháng năm
    const footerY = canvas.height - footerHeight;
    
    // Vẽ đường kẻ phân cách
    ctx.beginPath();
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.moveTo(padding, footerY + 20);
    ctx.lineTo(canvas.width - padding, footerY + 20);
    ctx.stroke();

    // Vẽ ngày tháng năm
    const date = new Date();
    const dateStr = date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    ctx.fillStyle = '#333333';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(dateStr, canvas.width / 2, footerY + 60);

    return canvas.toDataURL('image/jpeg', 0.9);
  }, [photos]);

  const applyFilter = (imageData: ImageData, filterType: FilterType) => {
    const data = imageData.data;
    
    switch (filterType) {
      case 'grayscale':
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg;
          data[i + 1] = avg;
          data[i + 2] = avg;
        }
        break;

      case 'sepia':
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
          data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
          data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }
        break;

      case 'vintage':
        for (let i = 0; i < data.length; i += 4) {
          data[i] *= 1.2;     // Tăng màu đỏ
          data[i + 2] *= 0.8; // Giảm màu xanh
        }
        break;

      case 'blur':
        // Đơn giản hóa blur effect
        const tempData = new Uint8ClampedArray(data);
        for (let i = 0; i < data.length; i += 4) {
          if (i % (imageData.width * 4) < imageData.width * 4 - 4) {
            data[i] = (tempData[i] + tempData[i + 4]) / 2;
            data[i + 1] = (tempData[i + 1] + tempData[i + 5]) / 2;
            data[i + 2] = (tempData[i + 2] + tempData[i + 6]) / 2;
          }
        }
        break;
    }
  };

  const downloadPhotoStrip = useCallback(async () => {
    const stripDataUrl = await createPhotoStrip();
    if (!stripDataUrl) return;

    const link = document.createElement('a');
    link.download = `photo-strip-${Date.now()}.jpg`;
    link.href = stripDataUrl;
    link.click();
  }, [createPhotoStrip]);

  return {
    settings,
    photos,
    isCapturing,
    countdown,
    currentFilter,
    setCurrentFilter,
    addPhoto,
    removePhoto,
    clearPhotos,
    updateSettings,
    startCountdown,
    createPhotoStrip,
    downloadPhotoStrip,
    setIsCapturing,
    currentFrame,
    setCurrentFrame,
  };
} 
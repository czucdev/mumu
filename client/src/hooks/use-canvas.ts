import { useState, useRef, useCallback } from 'react';
import { CanvasState, Sticker, Filter, Frame } from '@/types/photo-booth';
import { applyFilter, addFrameToCanvas, downloadCanvas } from '@/utils/canvas-utils';

export function useCanvas() {
  const [state, setState] = useState<CanvasState>({
    stickers: [],
    currentFilter: 'none',
    currentFrame: 'none',
    lastCapturedImage: null,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const addSticker = useCallback((emoji: string, x?: number, y?: number) => {
    const newSticker: Sticker = {
      id: Date.now().toString(),
      emoji,
      x: x ?? 320, // Center of 640px width
      y: y ?? 240, // Center of 480px height
      size: 60,
      rotation: 0,
    };

    setState(prev => ({
      ...prev,
      stickers: [...prev.stickers, newSticker],
    }));
  }, []);

  const updateSticker = useCallback((id: string, updates: Partial<Sticker>) => {
    setState(prev => ({
      ...prev,
      stickers: prev.stickers.map(sticker =>
        sticker.id === id ? { ...sticker, ...updates } : sticker
      ),
    }));
  }, []);

  const removeSticker = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      stickers: prev.stickers.filter(sticker => sticker.id !== id),
    }));
  }, []);

  const setFilter = useCallback((filter: Filter['effect']) => {
    setState(prev => ({ ...prev, currentFilter: filter }));
  }, []);

  const setFrame = useCallback((frame: Frame['type']) => {
    setState(prev => ({ ...prev, currentFrame: frame }));
  }, []);

  const capturePhoto = useCallback((videoElement: HTMLVideoElement) => {
    if (!canvasRef.current || !videoElement) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set canvas dimensions to match video
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Draw video frame
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Apply filter
    applyFilter(ctx, canvas.width, canvas.height, state.currentFilter);

    // Add stickers
    state.stickers.forEach(sticker => {
      ctx.save();
      ctx.translate(sticker.x, sticker.y);
      ctx.rotate((sticker.rotation * Math.PI) / 180);
      ctx.font = `${sticker.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sticker.emoji, 0, 0);
      ctx.restore();
    });

    // Add frame
    addFrameToCanvas(ctx, canvas.width, canvas.height, state.currentFrame);

    // Convert to data URL
    const dataURL = canvas.toDataURL('image/png');
    setState(prev => ({ ...prev, lastCapturedImage: dataURL }));

    return dataURL;
  }, [state.stickers, state.currentFilter, state.currentFrame]);

  const downloadPhoto = useCallback(() => {
    if (!canvasRef.current || !state.lastCapturedImage) return;
    downloadCanvas(canvasRef.current);
  }, [state.lastCapturedImage]);

  const reset = useCallback(() => {
    setState({
      stickers: [],
      currentFilter: 'none',
      currentFrame: 'none',
      lastCapturedImage: null,
    });
  }, []);

  return {
    state,
    canvasRef,
    addSticker,
    updateSticker,
    removeSticker,
    setFilter,
    setFrame,
    capturePhoto,
    downloadPhoto,
    reset,
  };
}

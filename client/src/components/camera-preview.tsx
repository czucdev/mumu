import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RotateCcw, Download, Loader, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCamera } from '@/hooks/use-camera';
import { useCanvas } from '@/hooks/use-canvas';
import { cn } from '@/lib/utils';
import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs';

interface CameraPreviewProps {
  onPhotoCapture?: (imageUrl: string) => void;
}

export function CameraPreview({ onPhotoCapture }: CameraPreviewProps) {
  const { settings, isLoading, error, videoRef, startCamera, stopCamera, switchCamera } = useCamera();
  const { state, canvasRef, capturePhoto, downloadPhoto } = useCanvas();
  const [showCaptured, setShowCaptured] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState<string>('/backgrounds/bg1.jpg');
  const aiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSegmenting, setIsSegmenting] = useState(false);

  useEffect(() => {
    // Set canvas dimensions when video loads
    if (videoRef.current && settings.isActive) {
      const video = videoRef.current;
      video.addEventListener('loadedmetadata', () => {
        if (canvasRef.current) {
          canvasRef.current.width = video.videoWidth;
          canvasRef.current.height = video.videoHeight;
        }
      });
    }
  }, [settings.isActive, videoRef, canvasRef]);

  useEffect(() => {
    let isMounted = true;
    let net: bodyPix.BodyPix | null = null;
    async function runSegmentation() {
      if (!videoRef.current || !aiCanvasRef.current || !settings.isActive) return;
      setIsSegmenting(true);
      net = await bodyPix.load();
      const video = videoRef.current;
      const canvas = aiCanvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      const bgImg = new window.Image();
      bgImg.src = backgroundUrl;
      await new Promise((res) => { bgImg.onload = res; });
      async function segmentFrame() {
        if (!isMounted || !videoRef.current || !aiCanvasRef.current) return;
        const segmentation = await net!.segmentPerson(videoRef.current);
        ctx!.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
        const pixel = imageData.data;
        for (let i = 0; i < segmentation.data.length; i++) {
          if (segmentation.data[i] === 1) {
            // Người: lấy pixel từ video
            const x = i % canvas.width;
            const y = Math.floor(i / canvas.width);
            ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);
            const personPixel = ctx!.getImageData(x, y, 1, 1).data;
            pixel[i * 4] = personPixel[0];
            pixel[i * 4 + 1] = personPixel[1];
            pixel[i * 4 + 2] = personPixel[2];
            pixel[i * 4 + 3] = 255;
          }
        }
        ctx!.putImageData(imageData, 0, 0);
        requestAnimationFrame(segmentFrame);
      }
      segmentFrame();
      setIsSegmenting(false);
    }
    if (settings.isActive) {
      runSegmentation();
    }
    return () => { isMounted = false; };
  }, [settings.isActive, videoRef, backgroundUrl]);

  const handleCapture = () => {
    if (!videoRef.current || !settings.isActive) return;

    const imageUrl = capturePhoto(videoRef.current);
    if (imageUrl) {
      setShowCaptured(true);
      onPhotoCapture?.(imageUrl);
    }
  };

  const handleRetake = () => {
    setShowCaptured(false);
  };

  const handleStartCamera = async () => {
    try {
      await startCamera();
    } catch (err) {
      console.error('Lỗi khởi động camera:', err);
    }
  };

  return (
    <div className="relative">
      {/* Camera Preview Container */}
      <div className="w-full max-w-2xl mx-auto bg-gray-600 rounded-3xl overflow-hidden aspect-[4/3] relative">
        {/* Video Element */}
        <video
          ref={videoRef}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            settings.isActive && !showCaptured ? "opacity-100" : "opacity-0"
          )}
          autoPlay
          muted
          playsInline
        />

        {/* AI Canvas overlay */}
        {settings.isActive && !showCaptured && (
          <canvas
            ref={aiCanvasRef}
            className="absolute inset-0 w-full h-full object-cover z-10"
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* Canvas for captured photo */}
        <canvas
          ref={canvasRef}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            showCaptured ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Placeholder state */}
        <AnimatePresence>
          {!settings.isActive && !showCaptured && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/50 backdrop-blur-sm"
            >
              <div className="text-4xl mb-4">📷</div>
              <p className="text-lg font-medium mb-2 text-center px-4">
                Bạn cần bật camera để sử dụng tính năng này
              </p>
              <Button
                onClick={handleStartCamera}
                className="bg-pink-400 hover:bg-pink-500 text-white px-6 py-3 rounded-2xl font-semibold mt-4"
                disabled={isLoading}
              >
                <Camera className="mr-2 h-5 w-5" />
                Bật Camera
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="text-white text-center">
                <RefreshCw className="animate-spin text-4xl mb-4 mx-auto" />
                <p>Đang khởi động camera...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error state */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="text-white text-center p-6 max-w-md">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-4">{error.message}</p>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleStartCamera}
                    className="bg-pink-400 hover:bg-pink-500 text-white px-6 py-3 rounded-2xl font-semibold"
                  >
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Thử lại
                  </Button>
                  {error.code === 'DEVICE_IN_USE' && (
                    <Button
                      onClick={switchCamera}
                      className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-2xl font-semibold"
                    >
                      <RotateCcw className="mr-2 h-5 w-5" />
                      Thử camera khác
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sticker overlay for live preview */}
        {settings.isActive && !showCaptured && (
          <div className="absolute inset-0 pointer-events-none">
            {state.stickers.map((sticker) => (
              <motion.div
                key={sticker.id}
                className="absolute pointer-events-none"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  left: sticker.x - sticker.size / 2,
                  top: sticker.y - sticker.size / 2,
                  fontSize: sticker.size,
                  transform: `rotate(${sticker.rotation}deg)`,
                }}
              >
                {sticker.emoji}
              </motion.div>
            ))}
          </div>
        )}

        {/* Camera controls when active */}
        <AnimatePresence>
          {settings.isActive && !showCaptured && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4"
            >
              <Button
                onClick={switchCamera}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3"
                title="Đổi camera"
              >
                <RotateCcw className="w-6 h-6 text-white" />
              </Button>
              <Button
                onClick={handleCapture}
                className="bg-white hover:bg-white/90 text-black rounded-full p-3"
                title="Chụp ảnh"
              >
                <Camera className="w-6 h-6" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Captured photo controls */}
        <AnimatePresence>
          {showCaptured && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4"
            >
              <Button
                onClick={handleRetake}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3"
                title="Chụp lại"
              >
                <RotateCcw className="w-6 h-6 text-white" />
              </Button>
              <Button
                onClick={downloadPhoto}
                className="bg-white hover:bg-white/90 text-black rounded-full p-3"
                title="Tải ảnh xuống"
              >
                <Download className="w-6 h-6" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* UI chọn background ảo đơn giản */}
        <div className="absolute top-2 right-2 z-20 bg-white/80 rounded p-2 flex gap-2">
          <img src="/backgrounds/bg1.jpg" alt="bg1" className={`w-12 h-8 rounded cursor-pointer ${backgroundUrl==='/backgrounds/bg1.jpg'?'ring-2 ring-pink-500':''}`} onClick={()=>setBackgroundUrl('/backgrounds/bg1.jpg')} />
          {/* Thêm nhiều background nếu muốn */}
        </div>
      </div>
    </div>
  );
}

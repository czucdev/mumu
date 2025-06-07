import { useCallback, useEffect, useRef, useState, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Download, RefreshCw, Facebook, Instagram, Twitter } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCamera } from '@/hooks/use-camera';
import { usePhotoStrip } from '@/hooks/use-photo-strip';
import { PhotoStripPreview } from './photo-strip-preview';
import { FilterType } from '@/types/photo-booth';

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'Bình thường', value: 'none' },
  { label: 'Đen trắng', value: 'grayscale' },
  { label: 'Sepia', value: 'sepia' },
  { label: 'Vintage', value: 'vintage' },
  { label: 'Mờ ảo', value: 'blur' },
];

const FRAMES = [
  { label: 'Không khung', value: 'none' },
  { label: 'Cổ điển', value: 'classic' },
  { label: 'Hiện đại', value: 'modern' },
  { label: 'Polaroid', value: 'polaroid' },
];

// Component nền động không gian (starfield)
function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    // Tăng số lượng sao và thêm màu neon
    const colors = ['#fff', '#a259ff', '#00c3ff', '#ff6ec7', '#39ff14'];
    let stars = Array.from({ length: 500 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * width,
      o: 0.6 + Math.random() * 0.4,
      r: 1.2 + Math.random() * 2.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      tw: Math.random() * Math.PI * 2 // phase for twinkle
    }));
    let frame = 0;
    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0a0020';
      ctx.fillRect(0, 0, width, height);
      frame += 0.01;
      for (let star of stars) {
        let k = 128.0 / star.z;
        let sx = star.x * k + width / 2;
        let sy = star.y * k + height / 2;
        if (sx < 0 || sx >= width || sy < 0 || sy >= height) {
          star.x = Math.random() * width;
          star.y = Math.random() * height;
          star.z = width;
        }
        star.z -= 0.7; // chuyển động chậm hơn
        // Hiệu ứng lung linh
        let twinkle = 0.7 + 0.3 * Math.sin(frame + star.tw);
        ctx.beginPath();
        ctx.arc(sx, sy, star.r * twinkle, 0, 2 * Math.PI);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.o * twinkle;
        ctx.shadowColor = star.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
      requestAnimationFrame(draw);
    }
    draw();
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      style={{ background: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)' }}
    />
  );
}

export function PhotoBooth() {
  const { settings: cameraSettings, isLoading, error, videoRef, startCamera, stopCamera, capturePhoto } = useCamera();
  const {
    settings: stripSettings,
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
    downloadPhotoStrip,
    setIsCapturing,
    currentFrame,
    setCurrentFrame
  } = usePhotoStrip();

  // State cho full screen
  const [isFullScreen, setIsFullScreen] = useState(false);
  const fullScreenRef = useRef<HTMLDivElement>(null);

  // Hàm chuyển đổi full screen
  const handleToggleFullScreen = useCallback(() => {
    if (!isFullScreen) {
      if (fullScreenRef.current) {
        if (fullScreenRef.current.requestFullscreen) {
          fullScreenRef.current.requestFullscreen();
        } else if ((fullScreenRef.current as any).webkitRequestFullscreen) {
          (fullScreenRef.current as any).webkitRequestFullscreen();
        }
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if ((document as any).webkitFullscreenElement) {
        (document as any).webkitExitFullscreen();
      }
    }
  }, [isFullScreen]);

  // Lắng nghe sự kiện full screen thay đổi
  useEffect(() => {
    const handleChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const handleStartCapture = useCallback(async () => {
    try {
      if (!cameraSettings.isActive) {
        await startCamera();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (!videoRef.current || !videoRef.current.srcObject) {
        throw new Error('Camera chưa sẵn sàng');
      }

      setIsCapturing(true);
      clearPhotos();

      for (let i = 0; i < stripSettings.photoCount; i++) {
        await startCountdown();

        if (!videoRef.current || !videoRef.current.srcObject) {
          throw new Error('Mất kết nối camera');
        }

        const photoUrl = await capturePhoto();
        if (photoUrl) {
          addPhoto(photoUrl);
        } else {
          throw new Error('Không thể chụp ảnh');
        }

        if (i < stripSettings.photoCount - 1) {
          await new Promise(resolve => setTimeout(resolve, stripSettings.delayBetweenPhotos));
        }
      }

      setIsCapturing(false);
    } catch (error) {
      setIsCapturing(false);
      console.error('Lỗi khi chụp ảnh:', error);
    }
  }, [cameraSettings.isActive, stripSettings, startCamera, startCountdown, capturePhoto, addPhoto, clearPhotos, setIsCapturing, videoRef]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div ref={fullScreenRef} className={`min-h-screen relative overflow-hidden transition-all duration-700 ${isFullScreen ? 'z-[9999] bg-black' : ''}`}>
      {/* Overlay gradient để tăng độ tương phản cho nội dung */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-black/80 via-black/60 to-black/90 backdrop-blur-sm"></div>
      {/* Main Content */}
      <div className={`relative z-10 min-h-screen p-4 transition-all duration-700 ${isFullScreen ? 'pt-2 pb-2' : ''}`}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          {!isFullScreen && (
          <div className="text-center mb-8">
            <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-[#7F00FF] via-[#E100FF] to-[#00C3FF] text-transparent bg-clip-text drop-shadow-lg">Chính photo booth</h1>
            <p className="text-lg font-medium text-white/80">Chụp ảnh tự động với hiệu ứng đẹp, cá tính và hiện đại</p>
          </div>
          )}

          {/* Controls */}
          <div className={`panel-glow mb-8 flex items-center justify-between p-6 transition-all duration-700 ${isFullScreen ? 'bg-black/60 border-0' : ''}`}>
            <div className="flex items-center space-x-4">
              <Select
                value={String(stripSettings.photoCount)}
                onValueChange={(value) => updateSettings({ photoCount: Number(value) as 3 | 4 })}
              >
                <SelectTrigger className="w-40 bg-white/10 backdrop-blur-sm border-white/20 hover:border-white/40 transition-colors text-white font-bold">
                  <SelectValue placeholder="Số ảnh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 ảnh</SelectItem>
                  <SelectItem value="4">4 ảnh</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={currentFilter}
                onValueChange={(value) => setCurrentFilter(value as FilterType)}
              >
                <SelectTrigger className="w-40 bg-white/10 backdrop-blur-sm border-white/20 hover:border-white/40 transition-colors text-white font-bold">
                  <SelectValue placeholder="Hiệu ứng" />
                </SelectTrigger>
                <SelectContent>
                  {FILTERS.map(filter => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={currentFrame}
                onValueChange={(value) => setCurrentFrame(value as 'none' | 'classic' | 'modern' | 'polaroid')}
              >
                <SelectTrigger className="w-40 bg-white/10 backdrop-blur-sm border-white/20 hover:border-white/40 transition-colors text-white font-bold">
                  <SelectValue placeholder="Khung viền" />
                </SelectTrigger>
                <SelectContent>
                  {FRAMES.map(frame => (
                    <SelectItem key={frame.value} value={frame.value}>
                      {frame.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {photos.length === stripSettings.photoCount && (
              <div className="flex items-center gap-4 justify-end">
                <button
                  onClick={downloadPhotoStrip}
                  className="button-primary btn-glow flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Tải xuống
                </button>
                {/* Nút full screen */}
                <button
                  onClick={handleToggleFullScreen}
                  className={`ml-4 px-4 py-2 rounded-xl font-bold shadow-lg transition-all duration-300 ${isFullScreen ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'}`}
                  title={isFullScreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                >
                  {isFullScreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                </button>
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* QR Code Panel - Bên trên */}
            {photos.length === stripSettings.photoCount && !isFullScreen && (
              <div className="lg:col-span-3 mb-4">
                <div className="panel-glow p-6 flex flex-col items-center justify-center space-y-4">
                  <h3 className="text-xl font-bold text-white text-center bg-gradient-to-r from-[#7F00FF] via-[#E100FF] to-[#00C3FF] bg-clip-text text-transparent">
                    Quét để tải ảnh
                  </h3>
                  <div className="bg-white p-4 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300">
                    <QRCodeSVG 
                      value={window.location.href} 
                      size={200} 
                      bgColor="#ffffff" 
                      fgColor="#7F00FF" 
                      level="H" 
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-sm text-white/60 text-center">
                    Dùng camera điện thoại để quét mã QR
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(window.location.href), '_blank')}
                      className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full p-2 shadow-lg hover:scale-110 transition-all duration-200"
                      title="Chia sẻ Facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => window.open('https://www.instagram.com/', '_blank')}
                      className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white rounded-full p-2 shadow-lg hover:scale-110 transition-all duration-200"
                      title="Chia sẻ Instagram"
                    >
                      <Instagram className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => window.open('https://twitter.com/intent/tweet?url='+encodeURIComponent(window.location.href), '_blank')}
                      className="bg-gradient-to-r from-sky-400 to-blue-600 text-white rounded-full p-2 shadow-lg hover:scale-110 transition-all duration-200"
                      title="Chia sẻ Twitter"
                    >
                      <Twitter className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Camera preview */}
            <div className="lg:col-span-2">
              <div className={`relative aspect-[4/3] panel-glow overflow-hidden transition-all duration-700 ${isFullScreen ? 'shadow-2xl border-4 border-pink-500 scale-105' : ''}`}>
                {/* Camera preview overlay */}
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
                
                {/* Video preview */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                
                {/* Countdown overlay, loading, error, start button giữ nguyên logic cũ */}
                <AnimatePresence>
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
                    >
                      <div className="text-white text-center">
                        <RefreshCw className="w-10 h-10 animate-spin mb-3" />
                        <p className="text-lg">Đang khởi động camera...</p>
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
                      <div className="text-white text-center max-w-md p-8">
                        <div className="bg-red-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                          <Camera className="w-10 h-10 text-red-500" />
                        </div>
                        <p className="text-2xl font-semibold mb-6">{error.message}</p>
                        <Button
                          onClick={startCamera}
                          className="bg-white text-black hover:bg-white/90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Thử lại
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Countdown overlay */}
                <AnimatePresence>
                  {countdown !== null && (
                    <motion.div
                      key={countdown}
                      initial={{ scale: 2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <div className="bg-black/50 backdrop-blur-md text-white text-9xl font-bold rounded-full w-56 h-56 flex items-center justify-center border-4 border-white/20 shadow-2xl">
                        {countdown === 0 ? '0' : countdown}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Start button */}
                {!isCapturing && photos.length === 0 && !isLoading && !error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm"
                  >
                    <Button
                      onClick={handleStartCapture}
                      className="bg-white/10 hover:bg-white/20 text-white text-lg px-8 py-6 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200 border border-white/20"
                    >
                      <Camera className="w-6 h-6 mr-3" />
                      Bắt đầu chụp
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Photo strip preview */}
            {!isFullScreen && (
              <div className="lg:col-span-1">
                <PhotoStripPreview
                  photos={photos}
                  maxPhotos={stripSettings.photoCount}
                  onRemovePhoto={removePhoto}
                  onClearPhotos={clearPhotos}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
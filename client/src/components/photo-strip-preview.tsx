import { motion, AnimatePresence } from 'framer-motion';
import { Image, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PhotoStripImage } from '@/types/photo-booth';

interface PhotoStripPreviewProps {
  photos: PhotoStripImage[];
  maxPhotos: number;
  onRemovePhoto?: (id: string) => void;
  onClearPhotos?: () => void;
}

export function PhotoStripPreview({
  photos,
  maxPhotos,
  onRemovePhoto,
  onClearPhotos
}: PhotoStripPreviewProps) {
  // Xác định ảnh mới nhất
  const latestPhotoId = photos.length > 0 ? photos[photos.length - 1].id : null;
  return (
    <div className="panel-glow h-full relative overflow-hidden">
      {/* Video nền cho panel */}
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-60 z-0"
        autoPlay
        playsInline
        muted
        loop
      >
        <source src="/videos/strip-bg.webm" type="video/webm" />
      </video>
      {/* Overlay mờ để dễ đọc nội dung */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#7F00FF]/80 via-[#E100FF]/60 to-[#00C3FF]/80 z-0"></div>
      {/* Nội dung panel */}
      <div className="relative z-10">
        <div className="text-white font-semibold mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#7F00FF] via-[#E100FF] to-[#00C3FF] animate-pulse"></div>
            <span className="text-lg drop-shadow-glow">Ảnh đã chụp ({photos.length}/{maxPhotos})</span>
          </div>
          {photos.length > 0 && (
            <button
              onClick={onClearPhotos}
              className="button-primary btn-glow flex items-center gap-2 px-4 py-2 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Xóa tất cả
            </button>
          )}
        </div>
        <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {photos.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-white/60 py-16 bg-white/5 rounded-2xl border-2 border-dashed border-white/10"
            >
              <Image className="w-16 h-16 mx-auto mb-4 opacity-40" />
              <p className="text-base">Chưa có ảnh nào</p>
              <p className="text-sm text-white/40 mt-2">Nhấn "Bắt đầu chụp" để tạo ảnh</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`relative aspect-[4/3] bg-black rounded-2xl overflow-hidden group shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border-2 border-[#7F00FF]/40 ${photo.id === latestPhotoId ? 'ring-4 ring-pink-400 animate-flash' : ''}`}
                >
                  <img
                    src={photo.dataUrl}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{
                      filter: getFilterStyle(photo.filter.type)
                    }}
                  />
                  {/* Hiệu ứng flash cho ảnh mới nhất */}
                  {photo.id === latestPhotoId && (
                    <motion.div
                      initial={{ opacity: 0.8 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.7 }}
                      className="absolute inset-0 bg-white pointer-events-none z-20"
                    />
                  )}
                  {/* Photo number badge */}
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-[#7F00FF] via-[#E100FF] to-[#00C3FF] text-white text-sm px-3 py-1.5 rounded-full font-bold border border-white/20 shadow-lg">
                    {index + 1}/{maxPhotos}
                  </div>
                  {/* Date time badge */}
                  <div className="absolute bottom-3 left-3 right-3 text-white text-sm px-3 py-1.5 rounded-lg font-medium bg-black/50 backdrop-blur-sm border border-white/10 shadow-lg flex items-center justify-between">
                    <span>{new Date(photo.timestamp).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                  {/* Remove button */}
                  {onRemovePhoto && (
                    <button
                      className="absolute top-3 right-3 button-primary btn-glow p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 border border-white/20 shadow-lg flex items-center"
                      onClick={() => onRemovePhoto(photo.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

function getFilterStyle(filterType: string): string {
  switch (filterType) {
    case 'grayscale':
      return 'grayscale(100%)';
    case 'sepia':
      return 'sepia(100%)';
    case 'vintage':
      return 'sepia(50%) contrast(110%) brightness(110%)';
    case 'blur':
      return 'blur(2px)';
    default:
      return 'none';
  }
} 
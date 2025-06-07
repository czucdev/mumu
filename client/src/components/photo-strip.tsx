import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoStripProps {
  photos: string[];
  onDownload?: () => void;
}

export function PhotoStrip({ photos, onDownload }: PhotoStripProps) {
  return (
    <div className="fixed right-4 top-4 bottom-4 w-48 bg-black/20 backdrop-blur-sm rounded-2xl p-4 flex flex-col gap-4">
      <div className="flex-1 flex flex-col gap-4 overflow-auto">
        {photos.map((photo, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden"
          >
            <img
              src={photo}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded-full">
              {index + 1}/4
            </div>
          </motion.div>
        ))}
      </div>
      {photos.length === 4 && onDownload && (
        <Button
          onClick={onDownload}
          className="w-full bg-white text-black hover:bg-white/90"
        >
          <Download className="w-4 h-4 mr-2" />
          Tải về
        </Button>
      )}
    </div>
  );
} 
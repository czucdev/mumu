import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCanvas } from '@/hooks/use-canvas';
import { Frame } from '@/types/photo-booth';

const frames: Frame[] = [
  { id: '1', name: 'Không khung', emoji: '⭕', type: 'none' },
  { id: '2', name: 'Trái tim', emoji: '💕', type: 'heart' },
  { id: '3', name: 'Hoa', emoji: '🌺', type: 'flower' },
  { id: '4', name: 'Sao', emoji: '⭐', type: 'star' },
  { id: '5', name: 'Cầu vồng', emoji: '🌈', type: 'rainbow' },
];

export function FramePanel() {
  const { state, setFrame } = useCanvas();

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
      <h3 className="text-sm font-bold text-pink-600 mb-3 flex items-center">
        <span className="mr-1">🖼️</span>
        Khung ảnh
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {frames.map((frame) => (
          <motion.div
            key={frame.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => setFrame(frame.type)}
              className={`w-full aspect-square rounded-lg transition-all duration-300 text-xs font-medium ${
                state.currentFrame === frame.type
                  ? 'bg-pink-400 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-sm mb-0.5">{frame.emoji}</span>
                <span className="text-xs">{frame.name}</span>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

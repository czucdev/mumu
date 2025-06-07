import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCanvas } from '@/hooks/use-canvas';

const kawaiiStickers = [
  '🎀', '💖', '🌸', '✨', '🦄', '🌙', '⭐', '🎈',
  '🎭', '🌺', '🧁', '🍭', '🎪', '🎨', '🎀', '💕'
];

export function StickerPanel() {
  const { addSticker } = useCanvas();

  const handleStickerClick = (emoji: string) => {
    // Add sticker at random position near center
    const x = 300 + Math.random() * 100; // Random position
    const y = 200 + Math.random() * 100; 
    addSticker(emoji, x, y);
  };

  return (
    <div className="panel-glow p-4 flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-[#7F00FF] via-[#E100FF] to-[#00C3FF] text-transparent bg-clip-text drop-shadow-glow flex items-center">
        <span className="mr-2">🎀</span> Sticker cá tính
      </h2>
      <div className="grid grid-cols-4 gap-3">
        {kawaiiStickers.map((sticker, index) => (
          <motion.button
            key={index}
            className="cursor-pointer text-2xl text-center p-2 rounded-xl border-2 border-[#E100FF]/40 bg-black/40 shadow-md transition-all duration-300 flex items-center justify-center aspect-square btn-glow hover:scale-110 hover:border-[#7F00FF] hover:bg-gradient-to-br hover:from-[#7F00FF]/60 hover:to-[#00C3FF]/60"
            whileHover={{ scale: 1.15, rotate: 8 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleStickerClick(sticker)}
          >
            {sticker}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

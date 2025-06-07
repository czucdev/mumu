import { motion, AnimatePresence } from 'framer-motion';

interface CountdownProps {
  count: number | null;
}

export function Countdown({ count }: CountdownProps) {
  return (
    <AnimatePresence mode="wait">
      {count !== null && (
        <motion.div
          key={count}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="bg-black/50 backdrop-blur-sm text-white text-8xl font-bold rounded-full w-48 h-48 flex items-center justify-center">
            {count === 0 ? '📸' : count}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 
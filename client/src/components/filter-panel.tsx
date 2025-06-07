import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCanvas } from '@/hooks/use-canvas';
import { Filter } from '@/types/photo-booth';

const filters: Filter[] = [
  { id: '1', name: 'Bình thường', emoji: '📷', effect: 'none' },
  { id: '2', name: 'Mềm mại', emoji: '😍', effect: 'beauty' },
  { id: '3', name: 'Đồng quê', emoji: '🌾', effect: 'vintage' },
  { id: '4', name: 'Trắng đen', emoji: '⚫', effect: 'cool' },
  { id: '5', name: 'Cổ điển', emoji: '🎞️', effect: 'warm' },
  { id: '6', name: 'Ảnh cũ', emoji: '📸', effect: 'vintage' },
];

export function FilterPanel() {
  const { state, setFilter } = useCanvas();

  return (
    <div className="panel-glow p-4 flex flex-col gap-4">
      <h2 className="text-xl font-bold text-white mb-2 drop-shadow-glow">Bộ lọc màu</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setFilter(filter.effect)}
            className={`rounded-xl p-3 font-semibold text-white border-2 transition-all duration-200 shadow-md
              ${state.currentFilter === filter.effect ? 'bg-gradient-to-r from-[#7F00FF] via-[#E100FF] to-[#00C3FF] border-[#E100FF] scale-105 btn-glow' : 'bg-black/40 border-white/20 hover:scale-105 hover:border-[#7F00FF]'}
            `}
          >
            <span className="mr-1 text-xs">{filter.emoji}</span>
            {filter.name}
          </button>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { PhotoBooth } from '@/components/photo-booth';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LandingPage } from '@/components/LandingPage';

function App() {
  const [showPhotoBooth, setShowPhotoBooth] = useState(false);
  return (
    <TooltipProvider>
      <Toaster />
      {showPhotoBooth ? (
        <PhotoBooth />
      ) : (
        <LandingPage onStart={() => setShowPhotoBooth(true)} />
      )}
    </TooltipProvider>
  );
}

export default App;

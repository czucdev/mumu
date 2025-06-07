import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Camera, Download, Sparkles, Star, Image, Heart } from 'lucide-react';

export function LandingPage({ onStart }: { onStart: () => void }) {
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    // Flash effect mỗi 5 giây
    const interval = setInterval(() => {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 100); // Flash kéo dài 100ms
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: '#1a1a1a', // Fallback background color
        backgroundImage: 'linear-gradient(to bottom right, #2d1b69, #1a1a1a)'
      }}
    >
      {/* Video Background - Tối ưu cho mọi trình duyệt */}
      <video
        autoPlay
        loop
        muted
        playsInline
        webkit-playsinline="true"
        preload="auto"
        poster="/images/video-poster.jpg"
        onError={(e) => {
          // Nếu video lỗi, thêm class để hiển thị gradient background
          e.currentTarget.style.display = 'none';
        }}
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'translate3d(0,0,0)',
          zIndex: -1,
          willChange: 'transform'
        }}
      >
        <source src="/videos/bk.mp4" type="video/mp4" />
        {/* Fallback text nếu video không được hỗ trợ */}
        Your browser does not support the video tag.
      </video>

      {/* Flash Effect */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'white',
          opacity: showFlash ? 0.8 : 0,
          transition: 'opacity 0.1s ease-out',
          pointerEvents: 'none',
          zIndex: 100
        }}
      />

      {/* Overlay gradient với 3 lớp để tạo hiệu ứng depth */}
      <div 
        style={{ 
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.4) 100%),
            radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 100%),
            linear-gradient(to right, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)
          `,
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          zIndex: 0
        }}
      >
        {/* Thêm particle effect overlay */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              radial-gradient(circle at 20% 20%, rgba(255,255,255,0.02) 0%, transparent 1%),
              radial-gradient(circle at 80% 40%, rgba(255,255,255,0.01) 0%, transparent 1%),
              radial-gradient(circle at 40% 60%, rgba(255,255,255,0.02) 0%, transparent 1%),
              radial-gradient(circle at 70% 80%, rgba(255,255,255,0.01) 0%, transparent 1%)
            `,
            opacity: 0.7
          }}
        />
      </div>
      
      {/* Main Content - Đặt z-index dương để hiển thị trên cùng */}
      <div className="relative z-10 container mx-auto px-4 py-16 min-h-screen flex flex-col items-center justify-center">
        {/* Logo Section */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-4 mb-12"
        >
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl">
            <Camera className="w-10 h-10 text-pink-300" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
            PhotoBooth
          </h2>
        </motion.div>

        {/* Hero Section */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center max-w-4xl mx-auto mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-white">
            Tạo khoảnh khắc đẹp với
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent"> Photo Booth</span>
          </h1>
          <p className="text-xl text-gray-200 mb-8 leading-relaxed">
            Trải nghiệm chụp ảnh thông minh. Tự động làm đẹp, thêm hiệu ứng sáng tạo và chia sẻ ngay lập tức.
          </p>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={onStart}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-lg px-12 py-6 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Sparkles className="w-6 h-6 mr-2" />
              Bắt đầu ngay
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {[
            {
              icon: <Star className="w-8 h-8 text-pink-400" />,
              title: "Hiệu ứng tự động",
              description: "Tự động làm đẹp và điều chỉnh ánh sáng hoàn hảo"
            },
            {
              icon: <Camera className="w-8 h-8 text-purple-400" />,
              title: "Chụp liên tiếp",
              description: "Tạo chuỗi ảnh đẹp với nhiều góc độ khác nhau"
            },
            {
              icon: <Download className="w-8 h-8 text-indigo-400" />,
              title: "Chia sẻ ngay",
              description: "Tải xuống và chia sẻ lên mạng xã hội dễ dàng"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300 border border-white/10"
            >
              <div className="bg-white/10 rounded-xl p-3 inline-block mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Interactive Preview Section */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full"
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 flex flex-col items-center justify-center border border-white/10">
            <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl overflow-hidden mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <Image className="w-16 h-16 text-white/40" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <p className="text-lg font-medium text-white/80">Chụp ảnh với hiệu ứng tự động</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 flex flex-col items-center justify-center border border-white/10">
            <div className="grid grid-cols-2 gap-4 w-full mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                  <Heart className={`w-8 h-8 text-white/40 ${i === 2 ? 'text-pink-400' : ''}`} />
                </div>
              ))}
            </div>
            <p className="text-lg font-medium text-white/80">Tạo bộ ảnh độc đáo</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
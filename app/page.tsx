import React, { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useVelocity, useAnimationFrame } from 'framer-motion';

// --- SUPABASE CONFIG ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- TYPES ---
interface Watch {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  year: number;
  description: string;
}

// --- COMPONENTS ---

// 1. Velocity Text (Marquee that speeds up on scroll)
function ParallaxText({ children, baseVelocity = 100 }: { children: string; baseVelocity: number }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  const directionFactor = useRef<number>(1);
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) directionFactor.current = -1;
    else if (velocityFactor.get() > 0) directionFactor.current = 1;
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden m-0 whitespace-nowrap flex flex-nowrap">
      <motion.div className="font-display text-[10vw] uppercase font-bold flex whitespace-nowrap gap-10" style={{ x }}>
        <span>{children} </span>
        <span>{children} </span>
        <span>{children} </span>
        <span>{children} </span>
      </motion.div>
    </div>
  );
}

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

// 2. Magnetic Button
const MagneticButton = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouse = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current!.getBoundingClientRect();
    const center = { x: left + width / 2, y: top + height / 2 };
    x.set((clientX - center.x) * 0.3);
    y.set((clientY - center.y) * 0.3);
  };

  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
    >
      {children}
    </motion.button>
  );
};

// --- MAIN PAGE ---
export default function EndlevelLuxury() {
  const [watches, setWatches] = useState<Watch[]>([]);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  
  useEffect(() => {
    // Fetch data
    const fetchData = async () => {
      const { data } = await supabase.from('watches').select('*').limit(5);
      if (data) setWatches(data);
    };
    fetchData();
  }, []);

  return (
    <div className="bg-[#030303] text-[#EAEAEA] min-h-screen font-sans selection:bg-[#D4AF37] selection:text-black overflow-x-hidden">
      
      {/* Custom Cursor would be handled globally in _app or layout */}
      
      {/* HEADER */}
      <header className="fixed top-0 w-full p-8 z-50 flex justify-between items-center mix-blend-difference">
        <div className="text-2xl font-bold tracking-tighter">CHRONOS</div>
        <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
          <div className="w-1 h-1 bg-white rounded-full"></div>
        </div>
      </header>

      {/* HERO */}
      <section className="h-screen relative flex items-center justify-center overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0 opacity-40">
          <img src="https://images.unsplash.com/photo-1639037688248-6505c8612875?q=80&w=2500" className="w-full h-full object-cover scale-110" />
        </motion.div>
        
        <div className="relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="overflow-hidden"
          >
            <h1 className="text-[15vw] leading-[0.8] font-bold tracking-tighter mix-blend-difference">
              TIMELESS
            </h1>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            <h1 className="text-[15vw] leading-[0.8] font-light italic tracking-tighter text-white/50">
              ELEGANCE
            </h1>
          </motion.div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="py-20 border-y border-white/5 bg-black">
        <ParallaxText baseVelocity={-5}>PRECISION • CRAFTSMANSHIP • HERITAGE • </ParallaxText>
        <ParallaxText baseVelocity={5}>LUXURY • EXCLUSIVITY • TIMELESS • </ParallaxText>
      </section>

      {/* CATALOGUE (Vertical for Mobile, Horizontal Concept for Desktop) */}
      <section className="py-32 px-4 md:px-12">
        <div className="max-w-[90vw] mx-auto">
          <div className="flex justify-between items-end mb-32">
            <h2 className="text-6xl md:text-8xl font-light">The <br/><span className="text-[#D4AF37] italic">Collection</span></h2>
            <p className="hidden md:block text-sm uppercase tracking-widest max-w-xs text-right text-gray-500">
              Curated for the few who understand the value of a second.
            </p>
          </div>

          <div className="space-y-40">
            {watches.map((watch, index) => (
              <div key={watch.id} className={`flex flex-col md:flex-row gap-20 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                
                {/* Image Side */}
                <div className="w-full md:w-1/2 relative group cursor-none">
                  <motion.div 
                    whileHover={{ scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-sm aspect-[4/5]"
                  >
                    <div className="absolute inset-0 bg-[#D4AF37] opacity-0 group-hover:opacity-10 transition-opacity duration-500 z-10"></div>
                    <img src={watch.image} alt={watch.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  </motion.div>
                  {/* Floating Index */}
                  <span className="absolute -top-10 -left-10 text-[10rem] font-bold text-white/5 select-none pointer-events-none">
                    0{index + 1}
                  </span>
                </div>

                {/* Text Side */}
                <div className="w-full md:w-1/2 space-y-8">
                  <div className="flex items-center gap-4">
                    <span className="h-[1px] w-12 bg-[#D4AF37]"></span>
                    <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em]">{watch.brand}</span>
                  </div>
                  
                  <h3 className="text-5xl md:text-7xl font-medium leading-tight">{watch.name}</h3>
                  <p className="text-gray-400 text-lg leading-relaxed max-w-md">{watch.description}</p>
                  
                  <div className="pt-8 flex items-center gap-12">
                    <span className="text-2xl">€{watch.price.toLocaleString()}</span>
                    <MagneticButton className="px-8 py-4 border border-white/20 rounded-full text-xs uppercase tracking-widest hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-black transition-colors">
                      Acquire
                    </MagneticButton>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#111,transparent)] opacity-50"></div>
        <div className="text-center relative z-10">
          <p className="text-sm uppercase tracking-[0.5em] mb-8 text-gray-500">Est. 1875 Geneve</p>
          <h2 className="text-[12vw] font-bold leading-none tracking-tighter hover:text-stroke transition-all duration-500 cursor-pointer">
            CHRONOS
          </h2>
          <div className="mt-12 flex justify-center gap-8">
            {['Instagram', 'Twitter', 'LinkedIn'].map(social => (
              <a key={social} href="#" className="text-xs uppercase tracking-widest hover:text-[#D4AF37] transition-colors">{social}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
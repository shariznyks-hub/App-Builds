import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
  rotation: number;
}

interface CelebrationEffectsProps {
  trigger: boolean;
  type?: 'target' | 'streak' | 'level';
  title?: string;
  subtitle?: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#38BDF8'];

export const CelebrationEffects: React.FC<CelebrationEffectsProps> = ({
  trigger,
  title,
  subtitle,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    // Generate 36 lightweight confetti particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < 36; i++) {
      newParticles.push({
        id: i,
        x: 50,
        y: 35,
        color: COLORS[i % COLORS.length],
        size: Math.random() * 6 + 4,
        vx: (Math.random() - 0.5) * 80,
        vy: (Math.random() - 0.7) * 70,
        rotation: Math.random() * 360,
      });
    }

    setParticles(newParticles);
    setShowBanner(true);

    const timer = setTimeout(() => {
      setParticles([]);
      setShowBanner(false);
    }, 2800);

    return () => clearTimeout(timer);
  }, [trigger]);

  if (!showBanner && particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex flex-col items-center justify-start pt-16 overflow-hidden">
      {/* Floating particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-sm animate-fade-out"
          style={{
            left: `${p.x + p.vx * 0.4}%`,
            top: `${p.y + p.vy * 0.4}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.5}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            transition: 'all 2s cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: 0.9,
          }}
        />
      ))}

      {/* Subtle Milestone Banner */}
      {title && (
        <div className="bg-slate-900/95 border border-amber-500/40 shadow-xl shadow-amber-950/30 rounded-2xl px-5 py-2.5 flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
          <span className="text-xl">🎉</span>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-amber-300 tracking-wide">{title}</h4>
            {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  velocity: number;
}

interface ParticleExplosionProps {
  x: number;
  y: number;
  color?: string;
  onComplete?: () => void;
}

const ParticleExplosion: React.FC<ParticleExplosionProps> = ({ x, y, color = '#4ade80', onComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Create particles
    const newParticles: Particle[] = [];
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x,
        y,
        color,
        angle: (Math.PI * 2 * i) / particleCount,
        velocity: 50 + Math.random() * 50,
      });
    }
    
    setParticles(newParticles);

    // Clean up after animation
    const timeout = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 600);

    return () => clearTimeout(timeout);
  }, [x, y, color, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
              backgroundColor: particle.color,
              boxShadow: `0 0 10px ${particle.color}`,
            }}
            initial={{ 
              x: 0, 
              y: 0, 
              scale: 1, 
              opacity: 1 
            }}
            animate={{
              x: Math.cos(particle.angle) * particle.velocity,
              y: Math.sin(particle.angle) * particle.velocity,
              scale: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ParticleExplosion;

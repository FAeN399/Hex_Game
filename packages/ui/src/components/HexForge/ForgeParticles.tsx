import React, { FC, useEffect, useState } from 'react';
import styles from './styles.module.css';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
}

interface ForgeParticlesProps {
  isActive: boolean;
  sourcePosition?: { x: number, y: number };
  targetPosition?: { x: number, y: number };
  particleCount?: number;
  particleType: 'connection' | 'forge' | 'placement';
}

/**
 * Component that renders magic particles for various forge interactions
 */
const ForgeParticles: FC<ForgeParticlesProps> = ({
  isActive,
  sourcePosition,
  targetPosition,
  particleCount = 20,
  particleType
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Generate particles when a connection is made
  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }
    
    // Generate particles based on type
    const newParticles: Particle[] = [];
    const colors = getColorsForType(particleType);
    
    for (let i = 0; i < particleCount; i++) {
      let x = 50;
      let y = 50;
      
      // Position particles based on source/target if provided
      if (sourcePosition && targetPosition) {
        // Random position along the path between source and target
        const ratio = Math.random();
        x = sourcePosition.x + (targetPosition.x - sourcePosition.x) * ratio;
        y = sourcePosition.y + (targetPosition.y - sourcePosition.y) * ratio;
      } else if (sourcePosition) {
        // Random position near source with some spread
        x = sourcePosition.x + (Math.random() - 0.5) * 40;
        y = sourcePosition.y + (Math.random() - 0.5) * 40;
      }
      
      newParticles.push({
        id: Date.now() + i,
        x,
        y,
        size: 2 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 0.5 + Math.random() * 2,
        angle: Math.random() * Math.PI * 2,
        opacity: 0.7 + Math.random() * 0.3,
        life: Math.random() * 100
      });
    }
    
    setParticles(newParticles);
    
    // Animation loop for particle movement
    const animationId = setInterval(() => {
      setParticles((prevParticles: Particle[]) => {
        if (prevParticles.length === 0) return [];
        
        return prevParticles
          .map((particle: Particle) => ({
            ...particle,
            x: particle.x + Math.cos(particle.angle) * particle.speed,
            y: particle.y + Math.sin(particle.angle) * particle.speed,
            size: particle.size * 0.95,
            opacity: particle.opacity * 0.96,
            life: particle.life - 1
          }))
          .filter((particle: Particle) => particle.life > 0 && particle.opacity > 0.1);
      });
    }, 30);
    
    return () => {
      clearInterval(animationId);
    };
  }, [isActive, sourcePosition, targetPosition, particleCount, particleType]);
  
  // If no particles, don't render anything
  if (particles.length === 0) {
    return null;
  }

  return (
    <div className={styles.particleContainer}>
      {particles.map((particle: Particle) => (
        <div 
          key={particle.id}
          className={styles.particle}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
          }}
        />
      ))}
    </div>
  );
};

// Helper function to get appropriate colors for different particle types
const getColorsForType = (type: 'connection' | 'forge' | 'placement'): string[] => {
  switch (type) {
    case 'connection':
      return ['#4CAF50', '#8BC34A', '#CDDC39']; // Green variations
    case 'forge':
      return ['#F2C94C', '#F2994A', '#EB5757', '#C7A853']; // Gold/red variations
    case 'placement':
      return ['#4BC3EF', '#2D9CDB', '#56CCF2']; // Blue variations
    default:
      return ['#8151B5', '#9B51E0', '#BB6BD9']; // Purple variations
  }
};

export default ForgeParticles;

import * as React from 'react';
const { useEffect, useState, useRef } = React;
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
  // Additional properties for enhanced visuals
  rotationSpeed?: number;
  pulse?: boolean;
  trail?: boolean;
  glow?: number;
  sparkle?: boolean;
  shape?: 'circle' | 'square' | 'diamond' | 'star';
  delay?: number;
  hueShift?: boolean;
}

interface ForgeParticlesProps {
  isActive: boolean;
  sourcePosition?: { x: number, y: number };
  targetPosition?: { x: number, y: number };
  particleCount?: number;
  particleType: 'connection' | 'forge' | 'placement' | 'success';
  duration?: number; // How long particles should last in ms
  pattern?: 'radial' | 'linear' | 'spiral' | 'burst' | 'wave' | 'bridge' | 'converge';
  intensity?: 'low' | 'medium' | 'high'; // Controls density and visual impact
}

/**
 * Component that renders magic particles for various forge interactions
 */
const ForgeParticles: React.FC<ForgeParticlesProps> = ({
  isActive,
  sourcePosition,
  targetPosition,
  particleCount = 20,
  particleType,
  duration = 1500,
  pattern = 'radial'
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  
  // Generate particles when a connection is made
  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }
    
    // Generate particles based on type
    const newParticles: Particle[] = [];
    const colors = getColorsForType(particleType);
    
    for (let i = 0; i < particleCount; i++) {
      let x = 50;
      let y = 50;
      let angle = Math.random() * Math.PI * 2;
      let speed = 0.5 + Math.random() * 2;
      
      // Apply different patterns
      switch (pattern) {
        case 'radial':
          // Particles emanate from center point
          if (sourcePosition) {
            x = sourcePosition.x;
            y = sourcePosition.y;
          }
          break;
          
        case 'linear':
          // Particles flow in a line between source and target
          if (sourcePosition && targetPosition) {
            const ratio = Math.random();
            x = sourcePosition.x + (targetPosition.x - sourcePosition.x) * ratio;
            y = sourcePosition.y + (targetPosition.y - sourcePosition.y) * ratio;
            
            // Calculate angle based on source to target
            const dx = targetPosition.x - sourcePosition.x;
            const dy = targetPosition.y - sourcePosition.y;
            angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.5; // Slight variation
          }
          break;
          
        case 'spiral':
          // Particles follow a spiral pattern
          if (sourcePosition) {
            x = sourcePosition.x;
            y = sourcePosition.y;
            // Spirals start slower but accelerate outward
            speed = 0.2 + (i / particleCount) * 3;
            // Add spiral-specific angle calculation
            const spiralTightness = 0.1 + Math.random() * 0.2;
            angle = i * spiralTightness;
          }
          break;
          
        case 'burst':
          // Particles burst from center
          if (sourcePosition) {
            x = sourcePosition.x;
            y = sourcePosition.y;
            speed = 1 + Math.random() * 3; // Faster initial speed
          }
          break;

        case 'bridge':
          // Creates a bridge-like connection between two points
          if (sourcePosition && targetPosition) {
            const ratio = Math.random();
            // Path follows a slight arc
            const midX = (sourcePosition.x + targetPosition.x) / 2;
            const midY = (sourcePosition.y + targetPosition.y) / 2 - 20; // Arc height
            
            if (ratio < 0.5) {
              // First half of the arc
              const subRatio = ratio * 2;
              x = sourcePosition.x + (midX - sourcePosition.x) * subRatio;
              y = sourcePosition.y + (midY - sourcePosition.y) * subRatio;
            } else {
              // Second half of the arc
              const subRatio = (ratio - 0.5) * 2;
              x = midX + (targetPosition.x - midX) * subRatio;
              y = midY + (targetPosition.y - midY) * subRatio;
            }
            
            // Particles move perpendicular to the line
            const dx = targetPosition.x - sourcePosition.x;
            const dy = targetPosition.y - sourcePosition.y;
            angle = Math.atan2(dy, dx) + Math.PI/2 + (Math.random() - 0.5) * 0.8;
          }
          break;

        case 'wave':
          // Wave pattern along the connection line
          if (sourcePosition && targetPosition) {
            const ratio = Math.random();
            const baseX = sourcePosition.x + (targetPosition.x - sourcePosition.x) * ratio;
            const baseY = sourcePosition.y + (targetPosition.y - sourcePosition.y) * ratio;
            
            // Calculate the perpendicular direction to create waves
            const dx = targetPosition.x - sourcePosition.x;
            const dy = targetPosition.y - sourcePosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const perpX = -dy / distance;
            const perpY = dx / distance;
            
            // Create wave pattern
            const waveAmplitude = 10 + Math.random() * 5;
            const waveFrequency = 0.1 + Math.random() * 0.1;
            const waveOffset = Math.sin(ratio * Math.PI * 6);
            
            x = baseX + perpX * waveAmplitude * waveOffset;
            y = baseY + perpY * waveAmplitude * waveOffset;
            
            // Particles move along the wave
            angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.2;
          }
          break;

        case 'converge':
          // Particles converge from surrounding area to target
          if (targetPosition) {
            // Random starting position in circular area around target
            const radius = 50 + Math.random() * 30;
            const randomAngle = Math.random() * Math.PI * 2;
            x = targetPosition.x + Math.cos(randomAngle) * radius;
            y = targetPosition.y + Math.sin(randomAngle) * radius;
            
            // Angle points toward target
            const dx = targetPosition.x - x;
            const dy = targetPosition.y - y;
            angle = Math.atan2(dy, dx);
          }
          break;
          
        default:
          // Default position with some randomness
          if (sourcePosition) {
            x = sourcePosition.x + (Math.random() - 0.5) * 40;
            y = sourcePosition.y + (Math.random() - 0.5) * 40;
          }
      }
      
      // Create particle with type-specific properties
      const baseParticle: Particle = {
        id: Date.now() + i,
        x,
        y,
        size: 2 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed,
        angle,
        opacity: 0.7 + Math.random() * 0.3,
        life: 50 + Math.random() * 100
      };
      
      // Add special effects based on particle type
      switch (particleType) {
        case 'connection':
          baseParticle.trail = Math.random() > 0.3;
          baseParticle.glow = 1.5 + Math.random();
          baseParticle.shape = Math.random() > 0.7 ? 'diamond' : 'circle';
          // Add occasional sparkles to connections
          baseParticle.sparkle = Math.random() > 0.8;
          break;
          
        case 'forge':
          baseParticle.pulse = true;
          baseParticle.glow = 2 + Math.random() * 2;
          baseParticle.rotationSpeed = Math.random() * 0.1;
          // Add color shifting effect for forge particles
          baseParticle.hueShift = Math.random() > 0.5;
          // Mix of shapes for forge effect
          const forgeShapes: Array<'circle' | 'square' | 'diamond' | 'star'> = ['circle', 'diamond', 'star'];
          baseParticle.shape = forgeShapes[Math.floor(Math.random() * forgeShapes.length)];
          break;
          
        case 'success':
          baseParticle.pulse = true;
          baseParticle.glow = 3 + Math.random();
          baseParticle.rotationSpeed = Math.random() * 0.2;
          // Stars and sparkles for success
          baseParticle.sparkle = Math.random() > 0.4;
          baseParticle.shape = Math.random() > 0.6 ? 'star' : 'diamond';
          // Add more life to success particles
          baseParticle.life += 50;
          break;
          
        case 'placement':
          baseParticle.glow = 1 + Math.random();
          // Placement particles briefly pulse then fade
          baseParticle.pulse = Math.random() > 0.5;
          // Add some circular motion to placement particles
          if (Math.random() > 0.7) {
            baseParticle.rotationSpeed = 0.05 + Math.random() * 0.05;
          }
          break;
      }
      
      newParticles.push(baseParticle);
    }
    
    setParticles(newParticles);
    
    // Use requestAnimationFrame for smoother animations
    const animate = (timestamp: number) => {
      // Throttle updates to avoid excessive re-renders
      if (timestamp - lastUpdateRef.current > 16) { // ~60fps
        lastUpdateRef.current = timestamp;
        
        setParticles(prevParticles => {
          if (prevParticles.length === 0) return [];
          
          return prevParticles
            .map(particle => {
              // Apply rotation if particle has rotationSpeed
              let newAngle = particle.angle;
              if (particle.rotationSpeed) {
                newAngle += particle.rotationSpeed;
              }
              
              // Calculate new position
              const newX = particle.x + Math.cos(particle.angle) * particle.speed;
              const newY = particle.y + Math.sin(particle.angle) * particle.speed;
              
              // Calculate new size (either pulsing or shrinking)
              let newSize = particle.size;
              if (particle.pulse) {
                // Pulsing effect: size oscillates
                const pulseRate = Math.sin(timestamp / 200) * 0.1 + 0.95;
                newSize = particle.size * pulseRate;
              } else {
                // Normal behavior: particles get smaller over time
                newSize = particle.size * 0.98;
              }
              
              return {
                ...particle,
                x: newX,
                y: newY,
                angle: newAngle,
                size: newSize,
                opacity: particle.opacity * 0.98,
                life: particle.life - 1
              };
            })
            .filter(particle => particle.life > 0 && particle.opacity > 0.05);
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup effect after duration
    const cleanupTimeout = setTimeout(() => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setParticles([]);
    }, duration);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearTimeout(cleanupTimeout);
    };
  }, [isActive, sourcePosition, targetPosition, particleCount, particleType, pattern, duration]);
  
  // If no particles, don't render anything
  if (particles.length === 0) {
    return null;
  }

  return (
    <div className={styles.particleContainer}>
      {particles.map((particle: Particle) => {
        // Calculate glow intensity based on particle properties
        const glowIntensity = particle.glow || 1;
        const glowSize = particle.size * glowIntensity * 2;
        
        // Apply different styles based on particle properties
        let particleClassName = styles.particle;
        if (particle.trail) particleClassName += ` ${styles.particleTrail}`;
        if (particle.pulse) particleClassName += ` ${styles.particlePulse}`;
        if (particle.sparkle) particleClassName += ` ${styles.particleSparkle}`;
        if (particle.hueShift) particleClassName += ` ${styles.particleHueShift}`;
        
        // Different particle types get different className modifiers
        particleClassName += ` ${styles[`particle${particleType.charAt(0).toUpperCase() + particleType.slice(1)}`] || ''}`;
        
        // Apply shape-specific classes
        if (particle.shape) {
          particleClassName += ` ${styles[`particle${particle.shape.charAt(0).toUpperCase() + particle.shape.slice(1)}`] || ''}`;
        }
        
        // Apply animation delay for staggered effects
        const animationDelay = particle.delay ? `${particle.delay}ms` : '0ms';
        
        // Determine the clip-path based on shape
        let clipPath;
        switch (particle.shape) {
          case 'diamond':
            clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
            break;
          case 'square':
            clipPath = 'none'; // Default square shape
            break;
          case 'star':
            clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
            break;
          default:
            clipPath = particle.shape === 'circle' ? '50%' : undefined;
        }
        
        return (
          <div 
            key={particle.id}
            className={particleClassName}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              opacity: particle.opacity,
              boxShadow: `0 0 ${glowSize}px ${particle.color}`,
              transform: particle.rotationSpeed ? `rotate(${particle.angle * 57.3}deg)` : undefined,
              animationDelay,
              borderRadius: particle.shape === 'circle' ? '50%' : undefined,
              clipPath
            }}
          />
        );
      })}
    </div>
  );
};

// Helper function to get appropriate colors for different particle types
const getColorsForType = (type: 'connection' | 'forge' | 'placement' | 'success'): string[] => {
  switch (type) {
    case 'connection':
      return ['#4CAF50', '#8BC34A', '#CDDC39', '#A5D6A7', '#66BB6A']; // Green variations
    case 'forge':
      return ['#F2C94C', '#F2994A', '#EB5757', '#C7A853', '#FFD700']; // Gold/red variations
    case 'success':
      return ['#C7A853', '#FFD700', '#FFA726', '#FFEB3B', '#FFF176']; // Gold/yellow/white variations
    case 'placement':
      return ['#4BC3EF', '#2D9CDB', '#56CCF2', '#81D4FA', '#29B6F6']; // Blue variations
    default:
      return ['#8151B5', '#9B51E0', '#BB6BD9', '#D1C4E9', '#B39DDB']; // Purple variations
  }
};

export default ForgeParticles;

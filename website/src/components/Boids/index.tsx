import React, { useRef, useMemo } from 'react';
import styles from './styles.module.css';
import { useCanvasDimensions, useBoids, useBoidAnimation, useLeafImage } from './hooks';

interface BoidsCanvasProps {
  numBoids?: number;
  maxSpeed?: number;
  minSpeed?: number;
  alignmentForce?: number;
  cohesionForce?: number;
  separationForce?: number;
  visualRange?: number;
  minDistance?: number;
  backgroundColor?: string;
  zIndex?: number;
  boidSize?: number;
  randomness?: number;
  edgeBehavior?: 'wrap' | 'bounce';
  debug?: boolean;
}

const BoidsCanvas: React.FC<BoidsCanvasProps> = ({
  numBoids = 120,
  maxSpeed = 2.5,
  minSpeed = 1.0,
  alignmentForce = 0.05,
  cohesionForce = 0.04,
  separationForce = 0.1,
  visualRange = 70,
  minDistance = 25,
  backgroundColor = 'transparent',
  zIndex = -1,
  boidSize = 7,
  randomness = 0.05,
  edgeBehavior = 'bounce',
  debug = false,
}) => {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Load leaf image
  const leafImage = useLeafImage();
  
  // Custom hooks
  const dimensions = useCanvasDimensions(canvasRef);
  const [boids, setBoids] = useBoids(dimensions, numBoids, maxSpeed);
  
  // Animation options
  const animationOptions = useMemo(() => ({
    maxSpeed,
    minSpeed,
    alignmentForce,
    cohesionForce,
    separationForce,
    visualRange,
    minDistance,
    backgroundColor,
    boidSize,
    randomness,
    edgeBehavior,
  }), [
    maxSpeed,
    minSpeed,
    alignmentForce,
    cohesionForce,
    separationForce,
    visualRange,
    minDistance,
    backgroundColor,
    boidSize,
    randomness,
    edgeBehavior,
  ]);
  
  // Run animation
  useBoidAnimation(canvasRef, boids, setBoids, leafImage, animationOptions);

  // Canvas style with zIndex
  const canvasStyle = useMemo(() => ({ 
    zIndex,
    ...(debug ? { border: '1px solid red' } : {})
  }), [zIndex, debug]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.boidsCanvas}
      style={canvasStyle}
      data-testid="boids-canvas"
    />
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(BoidsCanvas);
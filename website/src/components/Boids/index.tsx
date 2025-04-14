import React, { useRef, useMemo } from 'react';
import styles from './styles.module.css';
import { useCanvasDimensions, useBoids, useBoidAnimation } from './hooks';

interface BoidsCanvasProps {
  numBoids?: number;
  maxSpeed?: number;
  alignmentForce?: number;
  cohesionForce?: number;
  separationForce?: number;
  visualRange?: number;
  minDistance?: number;
  backgroundColor?: string;
  zIndex?: number;
  boidSize?: number;
  debug?: boolean;
}

const BoidsCanvas: React.FC<BoidsCanvasProps> = ({
  numBoids = 120, // Increased for better visibility
  maxSpeed = 2.5, // Adjusted for smoother movement
  alignmentForce = 0.05,
  cohesionForce = 0.04,
  separationForce = 0.1,
  visualRange = 70, // Increased for more interaction
  minDistance = 20,
  backgroundColor = 'transparent',
  zIndex = -1,
  boidSize = 7, // Increased size for better visibility
  debug = false,
}) => {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Custom hooks
  const dimensions = useCanvasDimensions(canvasRef);
  const [boids, setBoids] = useBoids(dimensions, numBoids, maxSpeed);
  
  // Animation options
  const animationOptions = useMemo(() => ({
    maxSpeed,
    alignmentForce,
    cohesionForce,
    separationForce,
    visualRange,
    minDistance,
    backgroundColor,
    boidSize,
  }), [
    maxSpeed,
    alignmentForce,
    cohesionForce,
    separationForce,
    visualRange,
    minDistance,
    backgroundColor,
    boidSize,
  ]);
  
  // Run animation
  useBoidAnimation(canvasRef, boids, setBoids, animationOptions);

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
      data-testid="boids-canvas" // Add this for easier testing/debugging
    />
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(BoidsCanvas);
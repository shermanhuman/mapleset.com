import { useState, useCallback, useEffect, useRef } from 'react';

// Define types for our boids
export interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export interface Dimensions {
  width: number;
  height: number;
}

// Using exactly the specified brown color - #6a5a45 with different opacities
export const DEFAULT_COLORS = [
  '#6a5a45', // Solid color as requested
  'rgba(106, 90, 69, 0.9)', // #6a5a45 with 0.9 opacity for slight variation
  'rgba(106, 90, 69, 0.8)', // #6a5a45 with 0.8 opacity for slight variation
];

/**
 * Custom hook to handle canvas dimensions
 */
export const useCanvasDimensions = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });

  const updateDimensions = useCallback(() => {
    if (!canvasRef.current) return;
    
    const { width, height } = canvasRef.current.getBoundingClientRect();
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    setDimensions({ width, height });
  }, [canvasRef]);

  useEffect(() => {
    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [updateDimensions]);

  return dimensions;
};

/**
 * Custom hook to initialize and manage boids
 */
export const useBoids = (
  dimensions: Dimensions,
  numBoids: number,
  maxSpeed: number
) => {
  const [boids, setBoids] = useState<Boid[]>([]);

  // Initialize boids when dimensions change
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const initialBoids: Boid[] = Array.from({ length: numBoids }, () => ({
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      vx: (Math.random() * 2 - 1) * maxSpeed,
      vy: (Math.random() * 2 - 1) * maxSpeed,
      color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
    }));

    setBoids(initialBoids);
  }, [dimensions, numBoids, maxSpeed]);

  return [boids, setBoids] as const;
};

/**
 * Custom hook to handle boid animation and behavior
 */
export const useBoidAnimation = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  boids: Boid[],
  setBoids: React.Dispatch<React.SetStateAction<Boid[]>>,
  options: {
    maxSpeed: number;
    alignmentForce: number;
    cohesionForce: number;
    separationForce: number;
    visualRange: number;
    minDistance: number;
    backgroundColor: string;
    boidSize: number;
  }
) => {
  const animationFrameId = useRef<number | null>(null);
  const { 
    maxSpeed, 
    alignmentForce, 
    cohesionForce, 
    separationForce, 
    visualRange, 
    minDistance, 
    backgroundColor,
    boidSize
  } = options;

  // Calculate the distance between two boids
  const distance = useCallback((boid1: Boid, boid2: Boid): number => {
    return Math.sqrt(
      Math.pow(boid1.x - boid2.x, 2) + Math.pow(boid1.y - boid2.y, 2)
    );
  }, []);

  // Draw a single boid
  const drawBoid = useCallback((ctx: CanvasRenderingContext2D, boid: Boid) => {
    // Calculate angle for direction
    const angle = Math.atan2(boid.vy, boid.vx);
    
    ctx.fillStyle = boid.color;
    ctx.beginPath();
    
    // Draw a triangle for the boid - using provided size parameter for better control
    const size = boidSize;
    
    // Move to the front of the triangle
    ctx.moveTo(
      boid.x + Math.cos(angle) * size * 2,
      boid.y + Math.sin(angle) * size * 2
    );
    
    // Left wing
    ctx.lineTo(
      boid.x + Math.cos(angle + (2.5 * Math.PI) / 3) * size,
      boid.y + Math.sin(angle + (2.5 * Math.PI) / 3) * size
    );
    
    // Right wing
    ctx.lineTo(
      boid.x + Math.cos(angle + (3.5 * Math.PI) / 3) * size,
      boid.y + Math.sin(angle + (3.5 * Math.PI) / 3) * size
    );
    
    ctx.closePath();
    ctx.fill();
    
    // Add a stroke outline for better visibility
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [boidSize]);

  // Update function to calculate the next position of each boid
  const updateBoids = useCallback(() => {
    if (boids.length === 0 || !canvasRef.current) return boids;
    
    const canvas = canvasRef.current;
    const dimensions = { width: canvas.width, height: canvas.height };
    
    return boids.map(boid => {
      // Create copies to accumulate forces
      let avgDX = 0;
      let avgDY = 0;
      let avgX = 0;
      let avgY = 0;
      let separationX = 0;
      let separationY = 0;
      let numNeighbors = 0;

      // Check interaction with other boids
      boids.forEach(otherBoid => {
        const dist = distance(boid, otherBoid);
        
        // Skip if it's the same boid or too far away
        if (boid === otherBoid || dist > visualRange) return;
        
        // Alignment: match velocity with nearby boids
        avgDX += otherBoid.vx;
        avgDY += otherBoid.vy;
        
        // Cohesion: move toward center of mass of neighboring boids
        avgX += otherBoid.x;
        avgY += otherBoid.y;
        
        // Separation: avoid crowding neighboring boids
        if (dist < minDistance) {
          separationX += boid.x - otherBoid.x;
          separationY += boid.y - otherBoid.y;
        }
        
        numNeighbors++;
      });

      // Apply rules if there are neighbors
      if (numNeighbors > 0) {
        // Alignment: calculate average velocity of neighbors
        avgDX /= numNeighbors;
        avgDY /= numNeighbors;
        
        // Cohesion: calculate center of mass
        avgX /= numNeighbors;
        avgY /= numNeighbors;
      }

      // Apply forces to our velocity
      let newVX = boid.vx;
      let newVY = boid.vy;
      
      // Alignment force
      if (numNeighbors > 0) {
        newVX += (avgDX - boid.vx) * alignmentForce;
        newVY += (avgDY - boid.vy) * alignmentForce;
      }
      
      // Cohesion force
      if (numNeighbors > 0) {
        newVX += (avgX - boid.x) * cohesionForce;
        newVY += (avgY - boid.y) * cohesionForce;
      }
      
      // Separation force
      newVX += separationX * separationForce;
      newVY += separationY * separationForce;

      // Limit speed
      const speed = Math.sqrt(newVX * newVX + newVY * newVY);
      if (speed > maxSpeed) {
        newVX = (newVX / speed) * maxSpeed;
        newVY = (newVY / speed) * maxSpeed;
      }

      // Update position
      let newX = boid.x + newVX;
      let newY = boid.y + newVY;

      // Wrap around the screen
      if (newX < 0) newX = dimensions.width;
      if (newX > dimensions.width) newX = 0;
      if (newY < 0) newY = dimensions.height;
      if (newY > dimensions.height) newY = 0;

      // Return updated boid
      return {
        ...boid,
        x: newX,
        y: newY,
        vx: newVX,
        vy: newVY,
      };
    });
  }, [
    boids, 
    canvasRef, 
    alignmentForce, 
    cohesionForce, 
    separationForce, 
    visualRange, 
    minDistance, 
    maxSpeed, 
    distance
  ]);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || boids.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Clear canvas with proper alpha
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Update boids position
      const updatedBoids = updateBoids();
      
      // Draw boids
      updatedBoids.forEach(boid => drawBoid(ctx, boid));
      
      // Update state outside of the render loop for better performance
      setBoids(updatedBoids);
      
      // Request next frame
      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    // Cleanup animation on unmount
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [boids, backgroundColor, updateBoids, drawBoid, setBoids, canvasRef]);

  return null;
};
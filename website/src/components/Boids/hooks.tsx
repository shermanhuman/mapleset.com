import { useState, useCallback, useEffect, useRef } from 'react';

// Define types for our boids
export interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  scale?: number; // Add scale for size variety
}

export interface Dimensions {
  width: number;
  height: number;
}

// Using exactly the specified brown color - #6a5a45 with slight variations
export const DEFAULT_COLORS = [
  '#6a5a45', // Solid color as requested
  'rgba(106, 90, 69, 0.95)', // #6a5a45 with slight opacity variation
  'rgba(106, 90, 69, 0.9)', // #6a5a45 with slight opacity variation
];

/**
 * Custom hook to preload the leaf image
 */
export const useLeafImage = () => {
  const [leafImage, setLeafImage] = useState<HTMLImageElement | null>(null);
  
  useEffect(() => {
    const img = new Image();
    img.src = '/img/leaf.svg'; // Path relative to static directory
    img.onload = () => {
      setLeafImage(img);
    };
    return () => {
      img.onload = null; // Clean up
    };
  }, []);
  
  return leafImage;
};

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

    // Create boids with randomized positions, velocities, and scales
    const initialBoids: Boid[] = Array.from({ length: numBoids }, () => {
      // Random position throughout the canvas
      const x = Math.random() * dimensions.width;
      const y = Math.random() * dimensions.height;
      
      // Randomized velocities for better initial dispersion
      const angle = Math.random() * Math.PI * 2; // Random direction
      const speed = (0.5 + Math.random() * 0.5) * maxSpeed; // Random speed between 50% and 100% of maxSpeed
      
      // Random scale for size variety (between 0.7 and 1.3 of base size)
      const scale = 0.7 + Math.random() * 0.6;
      
      return {
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
        scale
      };
    });

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
  leafImage: HTMLImageElement | null,
  options: {
    maxSpeed: number;
    alignmentForce: number;
    cohesionForce: number;
    separationForce: number;
    visualRange: number;
    minDistance: number;
    backgroundColor: string;
    boidSize: number;
    edgeBehavior?: 'wrap' | 'bounce';
    minSpeed?: number;
    randomness?: number;
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
    boidSize,
    edgeBehavior = 'bounce',
    minSpeed = 1.0,   // Minimum speed to prevent boids from stopping
    randomness = 0.05 // Random movement factor to prevent perfect alignment
  } = options;

  // Calculate the distance between two boids
  const distance = useCallback((boid1: Boid, boid2: Boid): number => {
    return Math.sqrt(
      Math.pow(boid1.x - boid2.x, 2) + Math.pow(boid1.y - boid2.y, 2)
    );
  }, []);

  // Draw a single boid using the leaf image
  const drawBoid = useCallback((ctx: CanvasRenderingContext2D, boid: Boid) => {
    if (!leafImage) return;
    
    // Calculate the angle for direction
    const angle = Math.atan2(boid.vy, boid.vx) + Math.PI/2; // Add 90 degrees because the leaf stem points down
    
    // Save the current context state
    ctx.save();
    
    // Move to the boid's position and rotate
    ctx.translate(boid.x, boid.y);
    ctx.rotate(angle);
    
    // Apply the boid's scale
    const scale = (boid.scale || 1) * boidSize / 5; // Adjust size based on boidSize parameter
    ctx.scale(scale, scale);
    
    // Set global alpha for subtle transparency variation
    ctx.globalAlpha = 0.85 + (boid.scale || 1) * 0.15;
    
    // Draw the leaf image centered on the boid position
    // The SVG is 4.1mm x 9.6mm, so we'll center it accordingly
    const imgWidth = leafImage.width;
    const imgHeight = leafImage.height;
    ctx.drawImage(leafImage, -imgWidth/2, -imgHeight/2, imgWidth, imgHeight);
    
    // Restore the context state
    ctx.restore();
  }, [leafImage, boidSize]);

  // Handle edge behavior - bounce or wrap
  const handleEdges = useCallback((boid: Boid, dimensions: Dimensions): Boid => {
    let { x, y, vx, vy } = boid;
    const edge = 20; // Distance from edge to trigger behavior
    
    if (edgeBehavior === 'bounce') {
      // Bounce off edges with some margin
      if (x < edge) {
        vx = Math.abs(vx) * 1.5; // Boost away from the edge
        x = edge;
      } else if (x > dimensions.width - edge) {
        vx = -Math.abs(vx) * 1.5; // Boost away from the edge
        x = dimensions.width - edge;
      }
      
      if (y < edge) {
        vy = Math.abs(vy) * 1.5; // Boost away from the edge
        y = edge;
      } else if (y > dimensions.height - edge) {
        vy = -Math.abs(vy) * 1.5; // Boost away from the edge
        y = dimensions.height - edge;
      }
    } else {
      // Wrap around the screen with a small margin
      if (x < -edge) x = dimensions.width + edge;
      if (x > dimensions.width + edge) x = -edge;
      if (y < -edge) y = dimensions.height + edge;
      if (y > dimensions.height + edge) y = -edge;
    }
    
    return { ...boid, x, y, vx, vy };
  }, [edgeBehavior]);

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
          // Stronger separation when very close
          const factor = (minDistance - dist) / minDistance;
          separationX += (boid.x - otherBoid.x) * factor * factor;
          separationY += (boid.y - otherBoid.y) * factor * factor;
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
      
      // Add some randomness to prevent perfect alignment and add life-like behavior
      newVX += (Math.random() * 2 - 1) * randomness * maxSpeed;
      newVY += (Math.random() * 2 - 1) * randomness * maxSpeed;
      
      // Alignment force (match velocity with neighbors)
      if (numNeighbors > 0) {
        newVX += (avgDX - boid.vx) * alignmentForce;
        newVY += (avgDY - boid.vy) * alignmentForce;
      }
      
      // Cohesion force (move toward center of neighbors)
      if (numNeighbors > 0) {
        newVX += (avgX - boid.x) * cohesionForce;
        newVY += (avgY - boid.y) * cohesionForce;
      }
      
      // Separation force (avoid crowding)
      newVX += separationX * separationForce;
      newVY += separationY * separationForce;

      // Ensure minimum speed so boids don't stop moving
      const speed = Math.sqrt(newVX * newVX + newVY * newVY);
      if (speed < minSpeed) {
        newVX = (newVX / speed) * minSpeed;
        newVY = (newVY / speed) * minSpeed;
      }
      
      // Limit maximum speed
      if (speed > maxSpeed) {
        newVX = (newVX / speed) * maxSpeed;
        newVY = (newVY / speed) * maxSpeed;
      }

      // Update position
      let newX = boid.x + newVX;
      let newY = boid.y + newVY;

      // Handle boundary behavior
      return handleEdges({ 
        ...boid, 
        x: newX, 
        y: newY, 
        vx: newVX, 
        vy: newVY 
      }, dimensions);
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
    minSpeed, 
    randomness, 
    distance,
    handleEdges
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
      
      // Draw boids only if leaf image is loaded
      if (leafImage) {
        updatedBoids.forEach(boid => drawBoid(ctx, boid));
      }
      
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
  }, [boids, backgroundColor, updateBoids, drawBoid, setBoids, canvasRef, leafImage]);

  return null;
};
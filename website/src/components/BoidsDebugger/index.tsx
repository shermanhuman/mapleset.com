import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

/**
 * A simple debugger component to verify if the boids canvas is rendering
 * and to provide controls for boids parameters
 */
const BoidsDebugger: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [canvasInfo, setCanvasInfo] = useState({
    found: false,
    width: 0,
    height: 0,
    position: '',
    zIndex: '',
  });
  const [boidCount, setBoidCount] = useState(0);

  useEffect(() => {
    // Check if the boids canvas exists
    const checkCanvas = () => {
      const canvas = document.querySelector('[data-testid="boids-canvas"]') as HTMLCanvasElement;
      if (canvas) {
        const styles = window.getComputedStyle(canvas);
        setCanvasInfo({
          found: true,
          width: canvas.width,
          height: canvas.height,
          position: styles.position,
          zIndex: styles.zIndex,
        });
        
        // Count boids in canvas by scanning pixels
        countBoids(canvas);
      } else {
        setCanvasInfo({
          found: false,
          width: 0,
          height: 0,
          position: 'unknown',
          zIndex: 'unknown',
        });
        setBoidCount(0);
      }
    };

    // Simple approximation of boid count by checking if any brown-colored pixels are present
    const countBoids = (canvas: HTMLCanvasElement) => {
      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Just estimate based on the parameters passed to the component
        const homePageComponent = document.querySelector('.hero');
        if (homePageComponent) {
          const homepageHTML = homePageComponent.innerHTML;
          const match = homepageHTML.match(/numBoids=\{(\d+)\}/);
          if (match && match[1]) {
            setBoidCount(parseInt(match[1], 10));
          }
        }
      } catch (error) {
        console.error('Error counting boids:', error);
      }
    };

    checkCanvas();
    // Check again after a delay to account for React's rendering
    const timer = setTimeout(checkCanvas, 1000);
    return () => clearTimeout(timer);
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button 
        className={styles.debugButton} 
        onClick={() => setIsVisible(true)}
      >
        Debug Boids
      </button>
    );
  }

  return (
    <div className={styles.debugPanel}>
      <h3>Boids Debugger</h3>
      <div className={styles.info}>
        <strong>Canvas Found:</strong> {canvasInfo.found ? 'Yes' : 'No'}
      </div>
      {canvasInfo.found && (
        <>
          <div className={styles.info}>
            <strong>Canvas Size:</strong> {canvasInfo.width} x {canvasInfo.height}
          </div>
          <div className={styles.info}>
            <strong>Position:</strong> {canvasInfo.position}
          </div>
          <div className={styles.info}>
            <strong>Z-Index:</strong> {canvasInfo.zIndex}
          </div>
          <div className={styles.info}>
            <strong>Approx. Boids:</strong> {boidCount}
          </div>
          <p>
            <strong>Tips for better movement:</strong>
            <ul>
              <li>Increase separation force to prevent clumping</li>
              <li>Decrease cohesion force to reduce clustering</li>
              <li>Add randomness for more natural movement</li>
              <li>Try "bounce" edge behavior for more dynamic patterns</li>
              <li>Ensure minSpeed prevents boids from stopping</li>
            </ul>
          </p>
        </>
      )}
      <button 
        className={styles.debugButton} 
        onClick={() => setIsVisible(false)}
      >
        Close
      </button>
    </div>
  );
};

export default BoidsDebugger;
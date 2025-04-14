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
      } else {
        setCanvasInfo({
          found: false,
          width: 0,
          height: 0,
          position: 'unknown',
          zIndex: 'unknown',
        });
      }
    };

    checkCanvas();
    // Check again after a delay to account for React's rendering
    const timer = setTimeout(checkCanvas, 1000);
    return () => clearTimeout(timer);
  }, []);

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
          <p>
            If the canvas is found but boids aren't visible, check:
            <ul>
              <li>The z-index (should be above background)</li>
              <li>Size (should match container)</li>
              <li>Styling in CSS</li>
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
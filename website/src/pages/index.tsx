import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import BoidsCanvas from '../components/Boids';
import BoidsDebugger from '../components/BoidsDebugger';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      {/* The Boids simulation container */}
      <div className={styles.boidsContainer}>
        <BoidsCanvas 
          numBoids={180} 
          maxSpeed={10} 
          minSpeed={5}
          visualRange={32}
          alignmentForce={0.5} // Reduced to prevent over-alignment
          cohesionForce={0.002} // Reduced to prevent excessive clustering
          separationForce={5} // Increased to prevent clumping
          zIndex={1}
          boidSize={8}
          randomness={0.008} // Adds variability to movement
          edgeBehavior="bounce" // Makes them bounce off edges instead of wrapping
          minDistance={30} // Increased minimum distance for less clumping
        />
      </div>
      <div className="container">
        <img
          src="/img/logo.svg"
          alt={siteConfig.title + ' Logo'}
          className={styles.heroLogo}
        />
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Home"
      description={siteConfig.tagline}>
      <HomepageHeader />
      <BoidsDebugger />
    </Layout>
  );
}
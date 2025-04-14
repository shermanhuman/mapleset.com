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
          numBoids={200} // Increased number for more visibility
          maxSpeed={1.8} // Slightly slower for better visibility
          visualRange={90} // Increased for more interaction
          alignmentForce={0.05}
          cohesionForce={0.003}
          separationForce={0.1}
          zIndex={1} // Ensure it's visible
          boidSize={9} // Larger boids for better visibility
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
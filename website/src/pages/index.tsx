import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    // Removed hero--primary class to avoid default theme background/text colors interfering
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        {/* Use the logo from the static directory */}
        <img
          src="/img/logo.svg" // Path relative to the 'static' folder
          alt={siteConfig.title + ' Logo'} // Update alt text slightly
          className={styles.heroLogo} // Use CSS to control size
        />
        {/* Removed h1 and p elements as they are in the logo */}
        {/* <h1 className="hero__title">{siteConfig.title}</h1> */}
        {/* <p className="hero__subtitle">{siteConfig.tagline}</p> */}
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      // Updated title to be simpler as tagline is in logo
      title="Home"
      description={siteConfig.tagline}> {/* Keep description for SEO */}
      <HomepageHeader />
      {/* Main content is empty */}
    </Layout>
  );
}
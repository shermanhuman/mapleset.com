import React, {type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './index.module.css';

function HomepageHeader() {
  // The scene with its plum foreground cut out: the page's falling leaves (src/theme/Root)
  // show through it and pass behind the sky, so the mountain line is their edge
  const sceneUrl = useBaseUrl('/img/brand/mapleset-hero-880x110-sky.png');
  return (
    <header className={styles.hero}>
      <div className={styles.scene}>
        <div className={styles.sceneArt}>
          <img src={sceneUrl} alt="" />
          <img
            className={styles.lockup}
            src={useBaseUrl('/img/brand/mapleset-horizontal-plum.svg')}
            alt="Mapleset"
          />
        </div>
      </div>
      <div className="container">
        <Heading as="h1" className={styles.heroTitle}>
          Built because <em>we needed it</em>.
        </Heading>
        <p className={styles.heroIntro}>
          Mapleset LLC is an independent software company making desktop apps and hosted software for teams.
        </p>
        <Link className={clsx(styles.buttonPrimary, 'pixel-box')} to="/#products">
          Our products
        </Link>
      </div>
    </header>
  );
}

// Deskwalker's own icon, pixel art drawn at 128 px, shown 1:1
function DeskwalkerArt() {
  return (
    <img
      className={styles.pixelIcon}
      src={useBaseUrl('/img/products/deskwalker-128.png')}
      width={128}
      height={128}
      alt="Deskwalker icon: a monitor with an infinity sign across its screen"
    />
  );
}

// The ship, from the Blender model's line render, recolored peach
function SupportCannonArt() {
  return (
    <img
      className={styles.productArt}
      src={useBaseUrl('/img/products/orbital-support-cannon-ship.png')}
      width={811}
      height={373}
      alt="Line drawing of the Orbital Support Cannon: a spherical cockpit on a long barrel, with engines and antennas"
    />
  );
}

function SengaArt() {
  return (
    <img
      className={styles.productIcon}
      src={useBaseUrl('/img/products/senga-studio-mark.png')}
      alt="The Senga Studio mark, the character 線 in yellow and blue"
    />
  );
}

const products = [
  {
    name: 'Deskwalker',
    to: '/deskwalker',
    art: <DeskwalkerArt />,
    description: 'One keyboard, mouse and clipboard for your Mac, Windows and Linux computers.',
  },
  {
    name: 'Senga Studio',
    to: '/senga-studio',
    art: <SengaArt />,
    description: 'Draws line art from 3D scenes.',
  },
  {
    name: 'Orbital Support Cannon',
    to: '/orbital-support-cannon',
    art: <SupportCannonArt />,
    description: 'Email support for teams who see support as a competitive advantage, not a cost center.',
  },
];

function Products() {
  return (
    <section className={styles.section}>
      <div className="container">
        <Heading as="h2" id="products">
          Products
        </Heading>
        <div className={styles.productGrid}>
          {products.map((product) => (
            <Link key={product.name} to={product.to} className={clsx(styles.product, 'pixel-box')}>
              <div className={styles.productArtFrame}>{product.art}</div>
              <div className={styles.productBody}>
                <Heading as="h3">{product.name}</Heading>
                <p className={styles.productStatus}>In development</p>
                <p>{product.description}</p>
                <span className={styles.productMore}>Learn more →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}


export default function Home(): ReactNode {
  return (
    <Layout
      description="Mapleset LLC is an independent software company building Deskwalker, Senga Studio and Orbital Support Cannon, all in development.">
      <HomepageHeader />
      <main>
        <Products />
      </main>
    </Layout>
  );
}

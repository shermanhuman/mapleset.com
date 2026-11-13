import React, {useEffect, useRef, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useLocation} from '@docusaurus/router';
import {useThemeConfig} from '@docusaurus/theme-common';
import {setLeavesPlaying, useLeavesPlaying} from '@site/src/components/Boids/playing';
import styles from './styles.module.css';

interface Item {
  to: string;
  label: string;
}

// Replaces the theme's navbar: no bar, only a menu button in the upper right.
// On the home page it floats over the hero scene, whose lockup is the logo;
// on other pages the lockup sits on the left and links home.
export default function Navbar(): ReactNode {
  // The links come from themeConfig.navbar.items in docusaurus.config.ts
  const items: Item[] = useThemeConfig().navbar.items.flatMap((item) =>
    typeof item.to === 'string' && typeof item.label === 'string' ? [{to: item.to, label: item.label}] : [],
  );
  const {pathname, hash} = useLocation();
  const isHome = pathname === '/';
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const lockupUrl = useBaseUrl('/img/brand/mapleset-horizontal-butter.svg');
  const leavesPlaying = useLeavesPlaying();

  // Close after navigating, including to /#products on the same page
  useEffect(() => setOpen(false), [pathname, hash]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    const onClick = (event: MouseEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [open]);

  return (
    <nav ref={navRef} className={clsx(styles.nav, isHome && styles.overHero)} aria-label="Main">
      {!isHome && (
        <Link to="/" className={styles.home}>
          <img src={lockupUrl} alt="Mapleset home" width={120} height={27} />
        </Link>
      )}
      <button
        type="button"
        className={styles.menuButton}
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen(!open)}>
        {/* A tile with stepped corners and three bars, drawn in art pixels like the hero */}
        <svg viewBox="0 0 15 13" shapeRendering="crispEdges" aria-hidden="true">
          <path className={styles.tile} d="M1 0h13v1h1v11h-1v1H1v-1H0V1h1z" />
          <path className={styles.bars} d="M3 3h9v1H3zM3 6h9v1H3zM3 9h9v1H3z" />
        </svg>
      </button>
      <ul id="site-menu" className={clsx(styles.menu, 'pixel-box')} hidden={!open}>
        {items.map((item) => (
          <li key={item.to}>
            <Link to={item.to} className={clsx(pathname === item.to && styles.current)}>
              {item.label}
            </Link>
          </li>
        ))}
        <li className={styles.menuSetting}>
          <button type="button" onClick={() => setLeavesPlaying(!leavesPlaying)}>
            {leavesPlaying ? 'Pause falling leaves' : 'Play falling leaves'}
          </button>
        </li>
      </ul>
    </nav>
  );
}

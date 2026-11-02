import React, {type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useThemeConfig} from '@docusaurus/theme-common';
import styles from './styles.module.css';

interface Group {
  title: string;
  items: {to: string; label: string}[];
}

// Replaces the theme's footer: the brand on the left (lockup, tagline,
// copyright), the link groups together on the right; stacked on phones.
// The links and copyright come from themeConfig.footer in docusaurus.config.ts.
export default function Footer(): ReactNode {
  const {footer} = useThemeConfig();
  const {siteConfig} = useDocusaurusContext();
  const lockupUrl = useBaseUrl('/img/brand/mapleset-horizontal-butter.svg');
  if (!footer) return null;
  const groups: Group[] = footer.links.flatMap((group) =>
    'items' in group && typeof group.title === 'string'
      ? [
          {
            title: group.title,
            items: group.items.flatMap((item) =>
              typeof item.to === 'string' && typeof item.label === 'string' ? [{to: item.to, label: item.label}] : [],
            ),
          },
        ]
      : [],
  );

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Link to="/" className={styles.home}>
            <img src={lockupUrl} alt="Mapleset home" width={120} height={27} />
          </Link>
          <p className={styles.tagline}>{siteConfig.tagline}</p>
          {footer.copyright && <p className={styles.copyright}>{footer.copyright}</p>}
        </div>
        <nav className={styles.groups} aria-label="Footer">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className={styles.heading}>{group.title}</h2>
              <ul className={styles.list}>
                {group.items.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}

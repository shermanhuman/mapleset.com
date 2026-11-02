import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import {SkipToContentLink} from '@docusaurus/theme-common';
import styles from './styles.module.css';

// The theme's skip link, styled like the site's buttons: off screen until it
// has keyboard focus, then in the top-left corner
export default function SkipToContent(): ReactNode {
  return <SkipToContentLink className={clsx(styles.skipToContent, 'pixel-box')} />;
}

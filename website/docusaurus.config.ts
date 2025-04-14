import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'MAPLESET',
  tagline: 'Pragmatic AI Applications',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://mapleset.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'applesaucelabs', // Usually your GitHub org/user name.
  projectName: 'mapleset.com', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        // Disable docs and blog
        docs: false,
        blog: false,
        // Keep theme configuration
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig:
    {
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg', // TODO: Add a social card image
      navbar: {
        title: 'MAPLESET', // Title in the navbar
        logo: {
          alt: 'MAPLESET Logo',
          src: 'img/logo.svg', // We'll add the logo file here later
        },
        items: [
          // Remove any default items like Docs or Blog links if they exist
          // Example: {to: '/blog', label: 'Blog', position: 'left'},
        ],
      },
      footer: {
        style: 'light', 
        links: [
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Mapleset LLC.`,
      },
      prism: {
        theme: prismThemes.github,
        // darkTheme: prismThemes.dracula, // Dark theme is not needed
      },
      colorMode: {
        // Disable the dark mode switch
        defaultMode: 'light',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
    } satisfies Preset.ThemeConfig,
};

export default config;
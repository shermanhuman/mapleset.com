import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Mapleset LLC',
  tagline: 'An independent software company.',
  favicon: 'favicon.ico',

  // The rest of the brand kit's icon set (favicon/head.html)
  headTags: [
    {tagName: 'link', attributes: {rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml'}},
    {tagName: 'link', attributes: {rel: 'apple-touch-icon', href: '/apple-touch-icon.png'}},
    {tagName: 'link', attributes: {rel: 'manifest', href: '/site.webmanifest'}},
  ],

  // Set the production url of your site here
  url: 'https://mapleset.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // No organizationName/projectName: they'd be shipped in the site's JS, and
  // `npm run deploy` publishes with gh-pages, which doesn't need them.
  baseUrlIssueBanner: false,
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
      image: 'img/brand/mapleset-card-1200x630.png',
      metadata: [{name: 'theme-color', content: '#31112d'}],
      navbar: {
        logo: {
          alt: 'Mapleset',
          src: 'img/brand/mapleset-horizontal-butter.svg',
          width: 120,
          height: 27,
        },
        items: [
          {to: '/#products', label: 'Products', position: 'right', activeBaseRegex: '^/#products$'},
          {to: '/about', label: 'About', position: 'right'},
          {to: '/contact', label: 'Contact', position: 'right'},
        ],
      },
      footer: {
        style: 'light',
        links: [
          {
            title: 'Products',
            items: [
              {label: 'Deskwalker', to: '/deskwalker'},
              {label: 'Senga Studio', to: '/senga-studio'},
              {label: 'Orbital Support Cannon', to: '/orbital-support-cannon'},
            ],
          },
          {
            title: 'Company',
            items: [
              {label: 'About', to: '/about'},
              {label: 'Contact', to: '/contact'},
              {label: 'Privacy', to: '/privacy'},
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} Mapleset LLC`,
      },
      prism: {
        // Code blocks are inline-styled from the theme: text and surface-raised from the brand tokens
        theme: {...prismThemes.github, plain: {color: '#f8edd8', backgroundColor: '#4b2240'}},
      },
      colorMode: {
        // The brand's dark (plum) theme, with no switch
        defaultMode: 'dark',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
    } satisfies Preset.ThemeConfig,
};

export default config;

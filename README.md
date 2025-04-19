# Mapleset.com Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
npm install
```

## Local Development

```bash
npm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Deployment

### First-time setup

1. Configure GitHub Pages:
   - Go to your GitHub repository settings
   - Navigate to "Pages" in the sidebar
   - Under "Source", select "Deploy from a branch"
   - Under "Branch", select "gh-pages" / "/ (root)"
   - Click "Save"
   - Wait a few minutes for the first deployment

### Deploying Updates

To deploy new changes:

```bash
npm run deploy
```

This command:
1. Builds the website into static files
2. Pushes the built files to the `gh-pages` branch
3. GitHub Pages will automatically deploy the new changes

You can check the deployment status in your repository's "Actions" tab. It typically takes a few minutes for changes to appear on the live site.

## Build

```bash
npm run build
```

This command generates static content into the `build` directory that can be served using any static contents hosting service.

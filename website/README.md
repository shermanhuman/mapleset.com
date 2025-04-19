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

1. Create a GitHub Personal Access Token:
   - Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   - Generate a new token with the `repo` scope
   - Copy the token

2. Set up your environment:
   - Copy `.env.example` to `.env`
   - Replace `your_token_here` with your GitHub token in `.env`

### Deploying

To deploy the site:

```bash
npm run deploy
```

This command builds the website and deploys it to the `gh-pages` branch using your GitHub token for authentication.

## Build

```bash
npm run build
```

This command generates static content into the `build` directory that can be served using any static contents hosting service.

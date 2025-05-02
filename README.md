# Static Next.js Website

A static website built with Next.js, React, and TypeScript. The site features GSAP animations and Tailwind CSS for styling, with a focus on clean design and subtle animations.

## Project Purpose

This project serves as a personal/portfolio website with four main categories:

- About: Information about the site owner
- Portfolio: Showcase of work and projects
- Workshop: Interactive demonstrations and experiments
- Tools: Utilities and resources offered to visitors

The site is designed to be deployed as static HTML/CSS/JS files on an Apache server, allowing for easy hosting and maintenance.

## Technology Stack

- **Frontend Framework**: Next.js 15.3.1
- **UI Library**: React 19.0.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: GSAP (GreenSock Animation Platform)
- **Font**: Adobe Fonts
- **Build System**: SWC (Speedy Web Compiler)
- **Deployment**: Static export for Apache hosting

## Directory Structure

```
├── public/              # Static assets
│   ├── fonts/           # Adobe fonts
│   └── images/          # Site images
├── src/
│   ├── components/      # Reusable React components
│   │   ├── common/      # Shared components (header, footer, etc.)
│   │   ├── about/       # About-specific components
│   │   ├── portfolio/   # Portfolio-specific components
│   │   ├── workshop/    # Workshop-specific components
│   │   └── tools/       # Tools-specific components
│   ├── lib/             # Utility functions, hooks, etc.
│   │   └── animations/  # GSAP animation configurations
│   ├── pages/           # Next.js pages
│   │   ├── about/       # About pages
│   │   │   ├── index.tsx        # Main about page
│   │   │   ├── real-name.tsx    # Subpage example
│   │   │   └── ...              # Other about subpages
│   │   ├── portfolio/   # Portfolio pages
│   │   │   ├── index.tsx        # Main portfolio page
│   │   │   ├── video.tsx        # Subpage example
│   │   │   └── ...              # Other portfolio subpages
│   │   ├── workshop/    # Workshop pages
│   │   │   ├── index.tsx        # Main workshop page
│   │   │   └── ...              # Workshop subpages
│   │   ├── tools/       # Tools pages
│   │   │   ├── index.tsx        # Main tools page
│   │   │   └── ...              # Tools subpages
│   │   ├── 404.tsx      # Custom 404 error page
│   │   ├── _app.tsx     # Custom app component
│   │   ├── _document.tsx # Custom document component
│   │   ├── index.tsx    # Homepage with sitemap
│   │   ├── privacy-policy.tsx  # Privacy policy page
│   │   └── search.tsx   # Site search page
│   └── styles/          # Global styles
│       └── globals.css  # Global CSS including Tailwind directives
├── tailwind.config.js   # Tailwind CSS configuration
├── next.config.js       # Next.js configuration
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md            # Project documentation
```

## Build Instructions

1. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

2. Configure environment variables (if needed):

   - Create a `.env.local` file in the root directory
   - Add any necessary environment variables

3. Build the project for production:

   ```bash
   npm run build
   # or
   yarn build
   ```

4. Export as static site:
   ```bash
   npm run export
   # or
   yarn export
   ```
   This will generate a `out` directory containing the static site files.

## Run Instructions

### Development Mode

To run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Production Preview

To preview the production build locally:

```bash
npm run build
npm run start
# or
yarn build
yarn start
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Deployment

To deploy the static site to an Apache server:

1. Build and export the site as described in the Build Instructions
2. Copy all files from the `out` directory to your Apache server's web root (or desired subdirectory)
3. Ensure that the server is configured to serve `index.html` as the default file for directories

## Modifying Pages

Each page operates independently within its respective folder. To modify a page:

1. Navigate to the appropriate file in the `src/pages` directory
2. Make your changes
3. If in development mode, changes will be reflected automatically
4. For production, rebuild and re-export the site

## Browser Support

This website supports modern browsers including:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

[MIT](LICENSE)

/** @type {import('postcss').Config} */
const config = {
  plugins: {
    // Tailwind CSS v4 PostCSS plugin — no tailwind.config.ts needed.
    // Configure the design system directly in globals.css via @theme {}.
    '@tailwindcss/postcss': {},
  },
};

export default config;

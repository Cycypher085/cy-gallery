/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1A1A1A',
        'background-light': '#F8F9FA',
        'background-dark': '#0F0F0F',
        accent: '#3B82F6',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
        chinese: ['Noto Sans SC', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        violet:  { DEFAULT: '#5B3FE8', dark: '#3D28C4', light: '#F4F0FF' },
        coral:   { DEFAULT: '#E8357A', light: '#FFF0F6' },
        lime:    '#F7FF5C',
        orange:  '#FF7A35',
        dark:    { DEFAULT: '#1A1A2E', mid: '#2D2D4E' },
        mid:     '#6B6B8A',
        light:   '#F8F7FF',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'pactly-gradient': 'linear-gradient(135deg, #5B3FE8 0%, #E8357A 100%)',
      },
    },
  },
  plugins: [],
};

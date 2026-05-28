/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primaire merkkleuren (Brandbook v3.0)
        violet:   {
          DEFAULT: '#4B519E',
          400:     '#6B72B8',
          300:     '#9098C8',
          dark:    '#363B7A',
          light:   '#E7E8F4',
        },
        coral:    { DEFAULT: '#FF6B7D', light: '#FFE3E7' },
        mint:     { DEFAULT: '#22D3A6', light: '#D6F5EA' },
        sun:      { DEFAULT: '#FFD86B', light: '#FFF8DC' },
        // Neutrale kleuren
        softgray: '#F2F4F7',
        line:     '#E4E1F0',
        lavender: '#E7E8F4',
        // Backward-compat aliassen
        dark:     { DEFAULT: '#181A2B', mid: '#2A2C47' },
        mid:      '#6B6A7A',
        light:    '#FAFAFC',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'pactly-hex':      'linear-gradient(160deg, #9098C8 0%, #4B519E 100%)',
        'pactly-gradient': 'linear-gradient(135deg, #6B72B8 0%, #4B519E 100%)',
      },
    },
  },
  plugins: [],
};

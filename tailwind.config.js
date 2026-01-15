// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        trippi: {
          teal:   '#1FB5AE',
          mint:   '#41D3C0',
          pink:   '#FF6BA2',
          coral:  '#FF7A6E',
          cream:  '#F6F3ED',
          yellow: '#F09D34',
          navy:   '#0F2732',
        },
      },
      borderRadius: { xl: '16px', '2xl': '24px' },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui'
export default {
  content: ['./src/**/*.{vue,html,js}'],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: ['light', 'dark', 'cupcake', 'forest', 'lofi', 'black', 'acid', 'lemonade', 'night', 'coffee'],
  },
}

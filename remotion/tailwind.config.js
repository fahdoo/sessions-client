/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './templates/audiogram-basic/**/*.{js,ts,jsx,tsx}',  // Only scan our template files
    './index.ts',                                        // Entry point
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}; 
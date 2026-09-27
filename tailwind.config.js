/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tokens tal como los define docs/DESIGN.md — "Athletic Precision"
        primary: '#0062FF',
        background: '#F9F9FF',
        surface: '#FFFFFF',
        border: '#E5E7EB',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        success: '#10B981',
        warning: '#F59E0B',
        critical: '#EF4444',
        informative: '#3B82F6',
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        body: ['Hanken Grotesk', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.75rem', // corner radii moderados, según DESIGN.md
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
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
        DEFAULT: '0.75rem',
      },
      keyframes: {
        'tab-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(18px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'tab-in-left': {
          '0%':   { opacity: '0', transform: 'translateX(-18px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'tab-fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'tab-scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'nav-dot': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.55)' },
        },
        'nav-icon-pop': {
          '0%':   { transform: 'scale(1)   translateY(0)' },
          '40%':  { transform: 'scale(1.3) translateY(-4px)' },
          '70%':  { transform: 'scale(0.9) translateY(1px)' },
          '100%': { transform: 'scale(1)   translateY(0)' },
        },
      },
      animation: {
        'tab-in-right': 'tab-in-right 0.22s cubic-bezier(0.22,1,0.36,1) both',
        'tab-in-left':  'tab-in-left  0.22s cubic-bezier(0.22,1,0.36,1) both',
        'tab-fade-up':  'tab-fade-up  0.22s cubic-bezier(0.22,1,0.36,1) both',
        'tab-scale-in': 'tab-scale-in 0.2s  cubic-bezier(0.22,1,0.36,1) both',
        'nav-dot':      'nav-dot      0.3s  cubic-bezier(0.22,1,0.36,1)',
        'nav-icon-pop': 'nav-icon-pop 0.35s cubic-bezier(0.22,1,0.36,1)',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: '#0A0F1E',
        surface: '#0D1424',
        elevated: '#111827',
        border: 'rgba(255,255,255,0.08)',
        primary: { DEFAULT: '#3B82F6', hover: '#2563EB', foreground: '#ffffff' },
        emerald: { DEFAULT: '#10B981', foreground: '#ffffff' },
        amber: { DEFAULT: '#F59E0B' },
        muted: { DEFAULT: 'rgba(255,255,255,0.05)', foreground: '#9CA3AF' },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease both',
        'slide-in-left': 'slideInLeft 0.4s ease both',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(135deg, #0A0F1E 0%, #0D1424 50%, #0A0F1E 100%)',
      },
    },
  },
  plugins: [],
};

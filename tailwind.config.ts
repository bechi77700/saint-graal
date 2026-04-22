import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#080B10',
          elevated: '#0D1117',
          card: '#111827',
          border: '#1F2937',
          hover: '#1A2332',
        },
        accent: {
          gold: '#D4AF37',
          'gold-dim': '#A38828',
          blue: '#3B82F6',
          'blue-dim': '#1D4ED8',
          green: '#10B981',
          red: '#EF4444',
        },
        text: {
          primary: '#F9FAFB',
          secondary: '#9CA3AF',
          muted: '#4B5563',
          gold: '#D4AF37',
        },
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #A38828 100%)',
        'gradient-dark': 'linear-gradient(180deg, #080B10 0%, #0D1117 100%)',
        'shimmer-gradient':
          'linear-gradient(90deg, transparent 25%, rgba(212,175,55,0.1) 50%, transparent 75%)',
      },
    },
  },
  plugins: [],
};

export default config;

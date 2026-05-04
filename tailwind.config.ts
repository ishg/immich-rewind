import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',       // immich dark bg
        surface: '#161616',
        surface2: '#212121', // immich dark gray
        border: '#323232',
        muted: '#6b7280',
        fg: '#e5e7eb',       // immich dark fg
        accent: '#acccfa',   // immich dark primary (blue)
        danger: '#f87171',
        success: '#4ade80',
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.3s ease both',
      },
    },
  },
  plugins: [],
}

export default config

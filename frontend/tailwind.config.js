export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0E1726',
        surface: '#172033',
        surface2: '#202C45',
        accent: '#32D4F5',
        accent2: '#8BD450',
        warning: '#FFB547',
        danger: '#FF6B6B',
        text: '#F8FAFC',
        muted: '#A8B3C7',
      },
      boxShadow: {
        soft: '0 18px 60px rgba(8, 18, 38, 0.35)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl: '1.5rem',
      },
    },
  },
  plugins: [],
}

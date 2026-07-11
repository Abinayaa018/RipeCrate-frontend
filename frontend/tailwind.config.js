export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#071224',
        surface: '#0E1830',
        surface2: '#17233E',
        surface3: '#1B2A48',
        accent: '#36D7FF',
        accent2: '#7CFF6B',
        warning: '#FFB84D',
        danger: '#FF5C5C',
        text: '#F8FAFC',
        muted: '#9AB2D1',
        dim: '#0B1530',
      },
      boxShadow: {
        glow: '0 0 40px rgba(54, 215, 255, 0.18)',
        soft: '0 24px 80px rgba(7, 18, 36, 0.40)',
        inner: 'inset 0 0 60px rgba(255,255,255,0.05)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        xl: '1.5rem',
        '2xl': '2rem',
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 22px rgba(54,215,255,0.15)' },
          '50%': { boxShadow: '0 0 44px rgba(124,255,107,0.20)' },
        },
      },
    },
  },
  plugins: [],
}

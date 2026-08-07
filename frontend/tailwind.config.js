/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19', // Deep dark blue background
        surface: '#131A2A', // Slightly lighter dark blue for cards
        primary: '#3B82F6', // Blue Neon
        accent: '#F97316', // Orange Accent
        textPrimary: '#FFFFFF',
        textSecondary: '#94A3B8',
        neonBlue: '#00F0FF',
        neonOrange: '#FF5E00',
        success: '#10B981',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-blue': '0 0 10px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.3)',
        'neon-orange': '0 0 10px rgba(255, 94, 0, 0.5), 0 0 20px rgba(255, 94, 0, 0.3)',
      },
      backdropBlur: {
        'glass': '12px',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      }
    },
  },
  plugins: [],
}

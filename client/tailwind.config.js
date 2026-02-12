/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                    950: '#1e1b4b',
                },
            },
            fontSize: {
                'page-title': ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],
                'section-title': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '600' }],
                'body': ['0.875rem', { lineHeight: '1.25rem' }],
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-out-down': {
                    '0%': { opacity: '1', transform: 'translateY(0)' },
                    '100%': { opacity: '0', transform: 'translateY(8px)' },
                },
                'slide-up': {
                    '0%': { opacity: '0', transform: 'translateY(16px) scale(0.98)' },
                    '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
                },
                'slide-in-right': {
                    '0%': { opacity: '0', transform: 'translateX(16px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                'toast-enter': {
                    '0%': { opacity: '0', transform: 'translateX(100%)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                'toast-exit': {
                    '0%': { opacity: '1', transform: 'translateX(0)' },
                    '100%': { opacity: '0', transform: 'translateX(100%)' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'status-flash': {
                    '0%': { backgroundColor: 'rgba(99, 102, 241, 0.15)' },
                    '100%': { backgroundColor: 'transparent' },
                },
            },
            animation: {
                'fade-in': 'fade-in 0.2s ease-out',
                'fade-in-up': 'fade-in-up 0.25s ease-out both',
                'fade-out-down': 'fade-out-down 0.2s ease-in both',
                'slide-up': 'slide-up 0.25s ease-out',
                'slide-in-right': 'slide-in-right 0.2s ease-out',
                'toast-enter': 'toast-enter 0.3s ease-out',
                'toast-exit': 'toast-exit 0.25s ease-in both',
                'shimmer': 'shimmer 1.5s ease-in-out infinite',
                'status-flash': 'status-flash 0.8s ease-out',
            },
        },
    },
    plugins: [],
}

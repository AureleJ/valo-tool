/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                emerald: {
                    500: '#10b981',
                    600: '#059669',
                    800: '#065f46',
                },
            },
            keyframes: {
                notification: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '5%': { transform: 'translateY(0)', opacity: '1' },
                    '95%': { transform: 'translateY(0)', opacity: '1' },
                    '100%': { transform: 'translateY(20px)', opacity: '0' },
                },
                shrink: {
                    '0%': { width: '100%' },
                    '100%': { width: '0%' },
                }
            },
            animation: {
                notification: 'notification 5s ease-in-out forwards',
                shrink: 'shrink 4.5s linear forwards',
            },
        },
    },
    plugins: [],
};
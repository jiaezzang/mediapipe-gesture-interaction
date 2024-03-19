/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            animation: {
                wiggle: 'wiggle 1200ms ease-in-out',
                wave: 'wave 2000ms linear infinite',
            },
        },
        keyframes: {
            wiggle: {
                '0%': { transform: 'rotate(-3deg)', opacity: '0' },
                '50%': { transform: 'rotate(3deg)', opacity: '1' },
                '100%': { transform: 'rotate(-3deg)', opacity: '0' },
            },

            wave: {
                '0%': { transform: 'rotate(0.0deg)' },
                '10%': { transform: 'rotate(30.0deg)' },
                '20%': { transform: 'rotate(-8.0deg)' },
                '30%': { transform: 'rotate(30.0deg)' },
                '40%': { transform: 'rotate(-4.0deg)' },
                '50%': { transform: 'rotate(20.0deg)' },
                '60%': { transform: 'rotate(0.0deg)' },
                '100%': { transform: 'rotate(0.0deg)' },
            },
        },
    },
    plugins: [],
};

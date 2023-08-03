module.exports = {
  important: '#tailwind-id',
  mode: 'jit',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './modules/**/*.{js,ts,jsx,tsx}',
    './elements/**/*.{js,ts,jsx,tsx}',
    './views/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      xs: '450px',
      sm: '600px',
      md: '768px',
      lg: '1024px',
      lgx: '1200px',
      xl: '1440px',
      '2xl': '1920px',
    },
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        primary: {
          black: '#000000',
          white: '#ffffff',
          'light-petrol': '#6da9b5',
          'dark-petrol': '#1e7182',
          'indigo-blue': '#3F0FB7',
          red: '#E9132D',
          green: '#77D866',
          rose: '#f093c6',
          activeGreen: '#aafc53',
        },
        grey: {
          light: '#F8F8F8',
          medium: '#CACACA',
          dark: '#909090',
          'super-dark': '#2d2d2d',
        },
      },
      width: {
        'side-drawer': '280px',
      },
      spacing: {
        'side-drawer-width': '260px',
      },
      background: {
        transparent: 'transparent',
      },
      backgroundImage: {
        'y-indigo-to-petrol':
          'linear-gradient(171deg, rgba(113,107,221,1) 0%, rgba(51,37,156,1) 41%, rgba(3,100,119,1) 80%)',
        'x-indigo-to-petrol':
          'linear-gradient(130deg, rgba(113,107,221,1.0) 0%, rgba(3,100,119,1.0) 70%)',
        'x-pink-to-blue':
          'linear-gradient(133deg, rgba(154,16,112,1) 32%, rgba(8,167,208,1) 90%, rgba(153,202,214,1) 100%, rgba(13,80,94,1) 100%, rgba(147,218,232,1) 100%)',
        'x-pink-to-blue-low-opacity':
          'linear-gradient(133deg, rgba(154,16,112,0.648879620207458) 32%, rgba(8,167,208,0.3883754185267857) 90%, rgba(153,202,214,1) 100%, rgba(13,80,94,1) 100%, rgba(147,218,232,1) 100%)',
      },
      boxShadow: {
        subtle: '2px 4px 15px 5px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [require('tailwindcss-gradients')],
}

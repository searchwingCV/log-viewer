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
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      primary: {
        black: '#000000',
        white: '#ffffff',
        'light-petrol': '#2c879a',
        'dark-petrol': '#1e7182',
        'indigo-blue': '#3F0FB7',
        red: '#E9132D',
        green: '#77D866',
        rose: '#b86777',
      },
      grey: {
        light: '#F4F4F4',
        medium: '#CACACA',
        dark: '#909090',
        'super-dark': '#2d2d2d',
      },
    },
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
      width: {
        'side-nav': '260px',
      },
      spacing: {
        'side-nav-width': '260px',
      },
      background: {
        transparent: 'transparent',
      },
      backgroundImage: {
        'y-indigo-to-petrol':
          'linear-gradient(171deg, rgba(113,107,221,1) 0%, rgba(51,37,156,1) 41%, rgba(3,100,119,1) 80%)',
        'x-indigo-to-petrol':
          'linear-gradient(130deg, rgba(113,107,221,1.0) 0%, rgba(3,100,119,1.0) 70%)',
      },
      boxShadow: {
        subtle: '2px 4px 15px 5px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [require('tailwindcss-gradients')],
}

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      sans: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ],
    },
    extend: {
      colors: {
        black: '#000000',
        mainBlue: '#5669FF',
        darkerBlue:'#3D37F1',
        pink:'#F178B6',
        boldPink: '#EF5DA8',
        darkPink: '#C55492',
        disabledButton:'#929EFF',
        orangeTransparent: '#ff6d007d',
        lightOrange: '#f89937',
        green: '#13CB89',
        blue: '#1f6ae2',
        lightBlue: '#F2F2FA',
        red: '#ff0505',
        dark: '#3c3c3c',
        gray: '#9a9a9a',
        boldGray:'#6A6A6A',
        lightGray: '#f6f7f7',
        mediumGray: '#cdcdcd',
        darkGray: '#567077',
        white: '#ffffff',
        yellow: '#E9B741',
        transparentYellow: '#FEFBF5',
        transparentWhite : '#ffffff69',
        transparentBlack: '#0808087d',
        shadowGray: '#959595',
      },
    },
  },
  plugins: [],
}
export default config

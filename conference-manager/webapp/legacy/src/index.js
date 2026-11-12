import React from 'react'
import ReactDOM from 'react-dom'
import 'typeface-roboto'
import 'typeface-exo'
import { BrowserRouter } from 'react-router-dom'
import dotenv from 'dotenv'
import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'
import { I18nextProvider } from 'react-i18next'
import './translations/i18n'
import i18next from 'i18next'

const root = document.getElementById('root')

dotenv.config({ path: './.env' })

ReactDOM.render(
  <BrowserRouter>
    <I18nextProvider i18n={i18next}>
      <App />
    </I18nextProvider>
  </BrowserRouter>,
  root
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls. Learn
// more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register()
// serviceWorker.unregister();

import I18n from "i18next";
import en from "./languages/en.json";
import es from "./languages/es.json";

import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    global: en
  },
  es: {
    global: es
  }
}

I18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",

  interpolation: {
    escapeValue: false
  }
});

export default I18n;

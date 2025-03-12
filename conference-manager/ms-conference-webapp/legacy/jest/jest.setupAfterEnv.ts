import '@testing-library/jest-dom/extend-expect'

jest.mock("react-i18next", () => ({
    ...jest.requireActual("react-i18next"),
    useTranslation: () => {
      const enFile = jest.requireActual("../src/translations/languages/en.json");
      return {
        t: (stringKey) =>
          stringKey.split(".").reduce((result, key) => result[key], enFile),
        i18n: {
          language: "en",
          changeLanguage: () => new Promise(() => { }),
        },
      };
    },
  }))

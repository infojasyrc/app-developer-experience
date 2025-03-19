import type { Preview } from '@storybook/react'

import '../src/shared/styles/global.css';

const preview: Preview = {
  parameters: {
    actions: {
      handles: ['click', 'contextmenu', 'submit', 'change', 'input'],
    },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
};

export default preview;
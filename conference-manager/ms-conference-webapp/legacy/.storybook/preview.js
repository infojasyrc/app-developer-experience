import React from 'react'
import { ThemeProvider, CssBaseline } from '@material-ui/core'
import { addDecorator } from '@storybook/react'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
}

const Center = ({ children }) => (
  <ThemeProvider>
    <CssBaseline />
    <div style={{ padding: '20px' }}>{children}</div>
  </ThemeProvider>
)

addDecorator((storyfn) => <Center>{storyfn()}</Center> )

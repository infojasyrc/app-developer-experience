import React, { ReactNode, useState } from 'react'

const LayoutTypes = {
  FULL: 0,
  NAVIGATION: 1,
  NONE: 3,
}

interface ContextProps {
  layout: number,
  title: string,
  showLogo: boolean,
  changeLayout: (layout: number, title: string, showLogo: boolean) => void
}

const defaultState = {
  layout: LayoutTypes.FULL,
  title: 'Special Spider App',
  showLogo: false,
  changeLayout: () => {},
}

const LayoutContext = React.createContext<ContextProps>(defaultState)

const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [layout, setLayout] = useState(defaultState.layout)
  const [title, setTitle] = useState(defaultState.title)
  const [showLogo, setShowLogo] = useState(defaultState.showLogo)

  const changeLayout = (newLayout: number, newTitle: string, showLogo: boolean) => {
    setLayout(newLayout)
    setTitle(newTitle)
    setShowLogo(showLogo)
  }

  return (
    <LayoutContext.Provider value={{ layout, title, showLogo, changeLayout }}>
      {children}
    </LayoutContext.Provider>
  )
}

export default LayoutContext
export { LayoutProvider, LayoutTypes }

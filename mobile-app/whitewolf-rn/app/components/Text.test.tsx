import { render } from "@testing-library/react-native"
import { NavigationContainer } from "@react-navigation/native"
import { ThemeContext } from "@/utils/useAppTheme"
import { Text } from "./Text"

const testText = "Test string"

describe("Text", () => {
  it("should render the component", async () => {
    const screen = await render(
      <ThemeContext.Provider value={{ themeScheme: "light", setThemeContextOverride: () => {} }}>
        <NavigationContainer>
          <Text text={testText} />
        </NavigationContainer>
      </ThemeContext.Provider>,
    )

    expect(screen.getByText(testText)).toBeDefined()
  })
})

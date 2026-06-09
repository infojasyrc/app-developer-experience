import { render, screen } from "@testing-library/react";
import { useTheme } from "@mui/material/styles";
import { MuiThemeAdapter } from "./MuiThemeAdapter";
import * as ThemeContextModule from "@/app/lib/contexts/ThemeContext";

function PaletteModeDisplay() {
  const theme = useTheme();
  return <span data-testid="palette-mode">{theme.palette.mode}</span>;
}

describe("MuiThemeAdapter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("applies light theme when ThemeContext.mode === 'light'", () => {
    vi.spyOn(ThemeContextModule, "useThemeMode").mockReturnValue({
      mode: "light",
      toggleTheme: vi.fn(),
    });

    render(
      <MuiThemeAdapter>
        <PaletteModeDisplay />
      </MuiThemeAdapter>
    );

    expect(screen.getByTestId("palette-mode")).toHaveTextContent("light");
  });

  it("applies dark theme when ThemeContext.mode === 'dark'", () => {
    vi.spyOn(ThemeContextModule, "useThemeMode").mockReturnValue({
      mode: "dark",
      toggleTheme: vi.fn(),
    });

    render(
      <MuiThemeAdapter>
        <PaletteModeDisplay />
      </MuiThemeAdapter>
    );

    expect(screen.getByTestId("palette-mode")).toHaveTextContent("dark");
  });
});

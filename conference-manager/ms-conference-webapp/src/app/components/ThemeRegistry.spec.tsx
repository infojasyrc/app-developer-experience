import { render, screen } from "@testing-library/react";
import { ThemeRegistry } from "./ThemeRegistry";
import { useThemeMode } from "@/app/lib/contexts/ThemeContext";
import { useTheme } from "@mui/material/styles";

vi.mock("next/navigation", () => ({
  useServerInsertedHTML: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/current-path",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

function ThemeContextConsumer() {
  const { mode } = useThemeMode();
  return <span data-testid="ctx-mode">{mode}</span>;
}

function MuiThemeConsumer() {
  const theme = useTheme();
  return <span data-testid="palette-mode">{theme.palette.mode}</span>;
}

describe("ThemeRegistry", () => {
  it("renders children without crashing", () => {
    render(
      <ThemeRegistry>
        <span data-testid="child">Hello</span>
      </ThemeRegistry>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("provides ThemeContextProvider in the tree", () => {
    render(
      <ThemeRegistry>
        <ThemeContextConsumer />
      </ThemeRegistry>
    );
    expect(screen.getByTestId("ctx-mode")).toHaveTextContent("light");
  });

  it("provides MuiThemeAdapter (ThemeProvider) in the tree", () => {
    render(
      <ThemeRegistry>
        <MuiThemeConsumer />
      </ThemeRegistry>
    );
    expect(screen.getByTestId("palette-mode")).toHaveTextContent("light");
  });
});

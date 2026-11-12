import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeContextProvider, useThemeMode } from "./ThemeContext";

// ─── helpers ─────────────────────────────────────────────────────────────────

function ThemeConsumer() {
  const { mode, toggleTheme } = useThemeMode();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <ThemeContextProvider>
      <ThemeConsumer />
    </ThemeContextProvider>
  );
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    vi.restoreAllMocks();
  });

  describe("ThemeContextProvider — default state", () => {
    it("defaults to light mode", () => {
      renderWithProvider();
      expect(screen.getByTestId("mode")).toHaveTextContent("light");
    });
  });

  describe("ThemeContextProvider — localStorage restore", () => {
    it("restores dark mode persisted in localStorage", async () => {
      localStorage.setItem("theme-mode", "dark");
      renderWithProvider();
      await waitFor(() =>
        expect(screen.getByTestId("mode")).toHaveTextContent("dark")
      );
    });

    it("restores light mode persisted in localStorage", async () => {
      localStorage.setItem("theme-mode", "light");
      renderWithProvider();
      await waitFor(() =>
        expect(screen.getByTestId("mode")).toHaveTextContent("light")
      );
    });

    it("ignores unrecognised values in localStorage and stays light", async () => {
      localStorage.setItem("theme-mode", "solarized");
      renderWithProvider();
      await act(async () => {});
      expect(screen.getByTestId("mode")).toHaveTextContent("light");
    });
  });

  describe("ThemeContextProvider — toggleTheme", () => {
    it("switches from light to dark", async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole("button", { name: "Toggle" }));

      expect(screen.getByTestId("mode")).toHaveTextContent("dark");
    });

    it("switches from dark back to light", async () => {
      localStorage.setItem("theme-mode", "dark");
      const user = userEvent.setup();
      renderWithProvider();

      await waitFor(() =>
        expect(screen.getByTestId("mode")).toHaveTextContent("dark")
      );
      await user.click(screen.getByRole("button", { name: "Toggle" }));

      expect(screen.getByTestId("mode")).toHaveTextContent("light");
    });

    it("persists the new mode to localStorage", async () => {
      const user = userEvent.setup();
      const spy = vi.spyOn(Storage.prototype, "setItem");
      renderWithProvider();

      await user.click(screen.getByRole("button", { name: "Toggle" }));

      expect(spy).toHaveBeenCalledWith("theme-mode", "dark");
    });

    it("persists toggled-back mode to localStorage", async () => {
      localStorage.setItem("theme-mode", "dark");
      const user = userEvent.setup();
      const spy = vi.spyOn(Storage.prototype, "setItem");
      renderWithProvider();

      await waitFor(() =>
        expect(screen.getByTestId("mode")).toHaveTextContent("dark")
      );
      await user.click(screen.getByRole("button", { name: "Toggle" }));

      expect(spy).toHaveBeenCalledWith("theme-mode", "light");
    });
  });

  describe("ThemeContextProvider — dark class on <html>", () => {
    it("does not add dark class in default light mode", async () => {
      renderWithProvider();
      await act(async () => {});
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("adds dark class when toggled to dark", async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole("button", { name: "Toggle" }));

      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("removes dark class when toggled back to light", async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole("button", { name: "Toggle" }));
      expect(document.documentElement.classList.contains("dark")).toBe(true);

      await user.click(screen.getByRole("button", { name: "Toggle" }));
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("adds dark class on mount when localStorage stored dark", async () => {
      localStorage.setItem("theme-mode", "dark");
      renderWithProvider();

      await waitFor(() =>
        expect(document.documentElement.classList.contains("dark")).toBe(true)
      );
    });

    it("does not add dark class when localStorage stored light", async () => {
      localStorage.setItem("theme-mode", "light");
      renderWithProvider();

      await act(async () => {});
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });

  describe("useThemeMode outside provider", () => {
    it("returns light mode as default context value", () => {
      function Standalone() {
        const { mode } = useThemeMode();
        return <span data-testid="mode">{mode}</span>;
      }
      render(<Standalone />);
      expect(screen.getByTestId("mode")).toHaveTextContent("light");
    });
  });
});

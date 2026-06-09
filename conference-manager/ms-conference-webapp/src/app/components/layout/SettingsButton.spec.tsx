import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeContextProvider } from "@/app/lib/contexts/ThemeContext";
import * as ThemeContextModule from "@/app/lib/contexts/ThemeContext";
import { SettingsButton } from "./SettingsButton";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeContextProvider>{children}</ThemeContextProvider>;
}

describe("SettingsButton", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("gear IconButton is present with aria-label='open settings'", () => {
    render(<SettingsButton />, { wrapper: Wrapper });
    expect(
      screen.getByRole("button", { name: "open settings" })
    ).toBeInTheDocument();
  });

  it("clicking the button opens the popover", async () => {
    const user = userEvent.setup();
    render(<SettingsButton />, { wrapper: Wrapper });

    await user.click(screen.getByRole("button", { name: "open settings" }));

    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("popover contains role='switch' for the toggle", async () => {
    const user = userEvent.setup();
    render(<SettingsButton />, { wrapper: Wrapper });

    await user.click(screen.getByRole("button", { name: "open settings" }));

    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("switch aria-label='toggle dark mode' is present", async () => {
    const user = userEvent.setup();
    render(<SettingsButton />, { wrapper: Wrapper });

    await user.click(screen.getByRole("button", { name: "open settings" }));

    expect(
      screen.getByRole("switch", { name: "toggle dark mode" })
    ).toBeInTheDocument();
  });

  it("clicking the switch calls toggleTheme", async () => {
    const toggleTheme = vi.fn();
    vi.spyOn(ThemeContextModule, "useThemeMode").mockReturnValue({
      mode: "light",
      toggleTheme,
    });
    const user = userEvent.setup();
    render(<SettingsButton />);

    await user.click(screen.getByRole("button", { name: "open settings" }));
    await user.click(screen.getByRole("switch", { name: "toggle dark mode" }));

    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });

  it("popover closes when clicking outside", async () => {
    const user = userEvent.setup();
    render(<SettingsButton />, { wrapper: Wrapper });

    await user.click(screen.getByRole("button", { name: "open settings" }));
    expect(screen.getByRole("switch")).toBeInTheDocument();

    // MUI Popover renders an invisible backdrop that captures outside clicks
    const backdrop = document.querySelector(".MuiBackdrop-root")!;
    await user.click(backdrop);

    await waitFor(() =>
      expect(screen.queryByRole("switch")).not.toBeInTheDocument()
    );
  });
});

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import * as ThemeContextModule from "@/app/lib/contexts/ThemeContext";
import Header, { HeaderProps } from "./Header";

function renderHeader(overrides: Partial<HeaderProps> = {}) {
  const defaults: HeaderProps = {
    isAuthenticated: false,
    username: "",
    onLogin: vi.fn(),
    onLogout: vi.fn(),
  };
  return render(<Header {...defaults} {...overrides} />);
}

describe("Header", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders logo image", () => {
    renderHeader();
    expect(screen.getByAltText("Conference Manager")).toBeInTheDocument();
  });

  it("renders version badge when version prop is passed", () => {
    renderHeader({ version: "1.2.3" });
    expect(screen.getByText("v1.2.3")).toBeInTheDocument();
  });

  it("does not render version badge when version is omitted", () => {
    renderHeader();
    expect(screen.queryByText(/^v\d/)).not.toBeInTheDocument();
  });

  describe("Sign In button", () => {
    it("is visible when not authenticated", () => {
      renderHeader({ isAuthenticated: false });
      expect(
        screen.getByRole("button", { name: "Sign in to your account" })
      ).toBeInTheDocument();
    });

    it("has type='button'", () => {
      renderHeader();
      expect(
        screen.getByRole("button", { name: "Sign in to your account" })
      ).toHaveAttribute("type", "button");
    });

    it("displays text 'Sign In'", () => {
      renderHeader();
      expect(
        screen.getByRole("button", { name: "Sign in to your account" })
      ).toHaveTextContent("Sign In");
    });

    it("calls onLogin when clicked", async () => {
      const onLogin = vi.fn();
      renderHeader({ onLogin });
      await userEvent.click(
        screen.getByRole("button", { name: "Sign in to your account" })
      );
      expect(onLogin).toHaveBeenCalledTimes(1);
    });

    it("is not visible when authenticated", () => {
      renderHeader({ isAuthenticated: true, username: "user@example.com" });
      expect(
        screen.queryByRole("button", { name: "Sign in to your account" })
      ).not.toBeInTheDocument();
    });
  });

  describe("theme toggle", () => {
    it("renders with aria-label='Toggle dark mode'", () => {
      renderHeader();
      expect(
        screen.getByRole("button", { name: "Toggle dark mode" })
      ).toBeInTheDocument();
    });

    it("has type='button'", () => {
      renderHeader();
      expect(
        screen.getByRole("button", { name: "Toggle dark mode" })
      ).toHaveAttribute("type", "button");
    });

    it("calls toggleTheme when clicked", async () => {
      const toggleTheme = vi.fn();
      vi.spyOn(ThemeContextModule, "useThemeMode").mockReturnValue({
        mode: "light",
        toggleTheme,
      });
      renderHeader();
      await userEvent.click(
        screen.getByRole("button", { name: "Toggle dark mode" })
      );
      expect(toggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe("authenticated user menu", () => {
    it("renders user menu button when authenticated", () => {
      renderHeader({ isAuthenticated: true, username: "admin@example.com" });
      expect(
        screen.getByRole("button", { name: "User menu" })
      ).toBeInTheDocument();
    });

    it("opens dropdown on user menu click", async () => {
      renderHeader({ isAuthenticated: true, username: "admin@example.com" });
      await userEvent.click(screen.getByRole("button", { name: "User menu" }));
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    it("calls onLogout when Logout is clicked", async () => {
      const onLogout = vi.fn();
      renderHeader({
        isAuthenticated: true,
        username: "admin@example.com",
        onLogout,
      });
      await userEvent.click(screen.getByRole("button", { name: "User menu" }));
      await userEvent.click(screen.getByText("Logout"));
      expect(onLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe("mobile hamburger", () => {
    it("renders hamburger button when onMenuOpen is provided", () => {
      renderHeader({ onMenuOpen: vi.fn() });
      expect(
        screen.getByRole("button", { name: "Open menu" })
      ).toBeInTheDocument();
    });

    it("does not render hamburger button when onMenuOpen is omitted", () => {
      renderHeader();
      expect(
        screen.queryByRole("button", { name: "Open menu" })
      ).not.toBeInTheDocument();
    });
  });
});

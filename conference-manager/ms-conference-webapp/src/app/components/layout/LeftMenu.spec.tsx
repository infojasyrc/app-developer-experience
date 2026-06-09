import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeContextProvider } from "@/app/lib/contexts/ThemeContext";
import LeftMenu from "./LeftMenu";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeContextProvider>{children}</ThemeContextProvider>;
}

function renderLeftMenu(isAdmin = false) {
  return render(<LeftMenu isAdmin={isAdmin} />, { wrapper: Wrapper });
}

describe("LeftMenu", () => {
  it("renders Conferences nav item", () => {
    renderLeftMenu();
    expect(screen.getByText("Conferences")).toBeInTheDocument();
  });

  it("renders Change Password nav item", () => {
    renderLeftMenu();
    expect(screen.getByText("Change Password")).toBeInTheDocument();
  });

  it("does not render Users nav item for non-admin", () => {
    renderLeftMenu(false);
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
  });

  it("renders Users nav item when isAdmin is true", () => {
    renderLeftMenu(true);
    expect(screen.getByText("Users")).toBeInTheDocument();
  });

  it("renders SettingsButton at the bottom", () => {
    renderLeftMenu();
    expect(
      screen.getByRole("button", { name: "open settings" })
    ).toBeInTheDocument();
  });

  it("settings button has aria-label='open settings'", () => {
    renderLeftMenu();
    expect(
      screen.getByRole("button", { name: "open settings" })
    ).toHaveAttribute("aria-label", "open settings");
  });
});

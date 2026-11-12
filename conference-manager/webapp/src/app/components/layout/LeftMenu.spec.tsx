import React from "react";
import { render, screen } from "@testing-library/react";
import LeftMenu from "./LeftMenu";

function renderLeftMenu(isAdmin = false) {
  return render(<LeftMenu isAdmin={isAdmin} />);
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
});

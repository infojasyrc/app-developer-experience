import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { describe, it, vi, expect, beforeEach } from "vitest";

import Version from "./Version";

vi.mock("../../../../package.json", () => ({
  default: {
    version: "2.0.0",
  },
}));

describe("Version component", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetModules();
  });

  it("should render the version from the mocked package.json", async () => {
    render(<Version />);
    const version = "Version: 2.0.0";
    const txtVersion = screen.getByText(version);
    expect(txtVersion).toBeInTheDocument();
  });

  it("should match snapshot with mocked version", async () => {
    const { asFragment } = render(<Version />);
    expect(asFragment()).toMatchSnapshot();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, it } from "vitest";

import Footer from "./Footer";

describe("Footer", () => {
  it("renders the footer component", () => {
    render(<Footer />);
    const footerElement = screen.getByRole("contentinfo");
    expect(footerElement).toBeInTheDocument();
  });

  it("renders all links with correct attributes", () => {
    render(<Footer />);
    const footerElement = screen.getByRole("contentinfo");
    const links = footerElement.querySelectorAll("a");
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute("href", "");
    expect(links[1]).toHaveAttribute("href", "");
    expect(links[2]).toHaveAttribute("href", "");

    links.forEach((link) => {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  it("renders all images with correct alt attributes", () => {
    render(<Footer />);
    const footerElement = screen.getByRole("contentinfo");
    const images = footerElement.querySelectorAll("img");
    expect(images).toHaveLength(3);
    expect(images[0]).toHaveAttribute("alt", "File icon");
    expect(images[1]).toHaveAttribute("alt", "Window icon");
    expect(images[2]).toHaveAttribute("alt", "Globe icon");
  });
});

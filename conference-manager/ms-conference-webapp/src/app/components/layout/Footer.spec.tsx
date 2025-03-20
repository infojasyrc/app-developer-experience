import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

describe("Footer", () => {
  it("renders the footer component", () => {
    render(<Footer />);
    const footerElement = screen.getByRole("contentinfo");
    expect(footerElement).toBeInTheDocument();
  });

  it("renders all links with correct href attributes", () => {
    render(<Footer />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute(
      "href",
      "https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app",
    );
    expect(links[1]).toHaveAttribute(
      "href",
      "https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app",
    );
    expect(links[2]).toHaveAttribute(
      "href",
      "https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app",
    );
  });

  it("renders all images with correct alt attributes", () => {
    render(<Footer />);
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(3);
    expect(images[0]).toHaveAttribute("alt", "File icon");
    expect(images[1]).toHaveAttribute("alt", "Window icon");
    expect(images[2]).toHaveAttribute("alt", "Globe icon");
  });
});

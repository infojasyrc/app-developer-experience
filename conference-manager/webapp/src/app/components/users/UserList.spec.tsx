import { render, screen } from "@testing-library/react";
import { describe, it } from "vitest";
import UserList from "./UserList";
import { User } from "../../shared/entities/user";

const mockUsers: User[] = [
  { uid: "uid-1", firstName: "Alice", lastName: "Smith", email: "alice@example.com", isAdmin: true },
  { uid: "uid-2", firstName: "Bob", lastName: "Jones", email: "bob@example.com", isAdmin: false },
];

describe("UserList", () => {
  it("renders empty state when no users", () => {
    render(<UserList users={[]} />);
    expect(screen.getByText("No users found.")).toBeInTheDocument();
  });

  it("renders column headers", () => {
    render(<UserList users={mockUsers} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders user full name and email", () => {
    render(<UserList users={mockUsers} />);
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();
  });

  it("shows Admin badge for admin users only", () => {
    render(<UserList users={mockUsers} />);
    const adminBadges = screen.getAllByText("Admin");
    expect(adminBadges).toHaveLength(2); // header + badge for Alice
  });

  it("renders a row per user", () => {
    render(<UserList users={mockUsers} />);
    const rows = screen.getAllByRole("row");
    // 1 header row + 2 data rows
    expect(rows).toHaveLength(3);
  });
});

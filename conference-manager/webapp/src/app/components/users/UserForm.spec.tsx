import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi } from "vitest";
import UserForm from "./UserForm";

describe("UserForm", () => {
  it("renders all required field labels", () => {
    render(<UserForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/firebase uid/i)).toBeInTheDocument();
  });

  it("renders Cancel and Create User buttons", () => {
    render(<UserForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create user/i })).toBeInTheDocument();
  });

  it("calls onCancel when Cancel is clicked", () => {
    const onCancel = vi.fn();
    render(<UserForm onSubmit={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("shows Required errors on empty submit", () => {
    render(<UserForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /create user/i }));
    const errors = screen.getAllByText("Required");
    expect(errors.length).toBeGreaterThanOrEqual(4);
  });

  it("shows invalid email error on blur", () => {
    render(<UserForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: "not-an-email" } });
    fireEvent.blur(emailInput);
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });

  it("calls onSubmit with correct values when form is valid", () => {
    const onSubmit = vi.fn();
    render(<UserForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "Smith" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "alice@test.com" } });
    fireEvent.change(screen.getByLabelText(/firebase uid/i), { target: { value: "uid-abc123" } });

    fireEvent.click(screen.getByRole("button", { name: /create user/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      firstName: "Alice",
      lastName: "Smith",
      email: "alice@test.com",
      uid: "uid-abc123",
    });
  });

  it("does not call onSubmit when form is invalid", () => {
    const onSubmit = vi.fn();
    render(<UserForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /create user/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disables both buttons while submitting", () => {
    render(<UserForm isSubmitting onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole("button", { name: /creating/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
  });

  it("shows 'Creating…' label on submit button while submitting", () => {
    render(<UserForm isSubmitting onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole("button", { name: /creating/i })).toBeInTheDocument();
  });
});

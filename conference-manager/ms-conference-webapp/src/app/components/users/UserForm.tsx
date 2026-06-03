"use client";
import { useState, ChangeEvent, FormEvent } from "react";

export interface UserFormValues {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface UserFormProps {
  isSubmitting?: boolean;
  onSubmit: (values: UserFormValues) => void;
  onCancel: () => void;
}

const INITIAL: UserFormValues = { uid: "", firstName: "", lastName: "", email: "" };

function isValidEmail(val: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

type FieldKey = keyof UserFormValues;

export default function UserForm({ isSubmitting, onSubmit, onCancel }: UserFormProps) {
  const [values, setValues] = useState<UserFormValues>(INITIAL);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});

  const errors: Partial<Record<FieldKey, string>> = {};
  if (!values.firstName.trim()) errors.firstName = "Required";
  if (!values.lastName.trim()) errors.lastName = "Required";
  if (!values.email.trim()) errors.email = "Required";
  else if (!isValidEmail(values.email)) errors.email = "Invalid email";
  if (!values.uid.trim()) errors.uid = "Required";

  const isValid = Object.keys(errors).length === 0;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (field: FieldKey) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched({ uid: true, firstName: true, lastName: true, email: true });
    if (!isValid) return;
    onSubmit(values);
  };

  const fields: { name: FieldKey; label: string; type?: string }[] = [
    { name: "firstName", label: "First Name" },
    { name: "lastName", label: "Last Name" },
    { name: "email", label: "Email", type: "email" },
    { name: "uid", label: "Firebase UID" },
  ];

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-4">
        {fields.map(({ name, label, type = "text" }) => {
          const hasError = touched[name] && errors[name];
          return (
            <div key={name}>
              <label htmlFor={name} className="block text-sm font-medium text-dark mb-1">
                {label} <span className="text-red">*</span>
              </label>
              <input
                id={name}
                name={name}
                type={type}
                value={values[name]}
                onChange={handleChange}
                onBlur={() => handleBlur(name)}
                className={`w-full border rounded px-3 py-2 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-mainBlue ${
                  hasError ? "border-red" : "border-mediumGray"
                }`}
              />
              {hasError && (
                <p className="text-xs text-red mt-1">{errors[name]}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 rounded border border-mediumGray text-boldGray text-sm hover:bg-lightGray transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded bg-mainBlue text-white text-sm font-medium hover:bg-darkerBlue transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Creating…" : "Create User"}
        </button>
      </div>
    </form>
  );
}

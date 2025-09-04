import { useId } from "react";
import { fieldA11y } from "@/utils/validation/forms";

type Props = {
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (v: string) => void;
  name?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  error?: string | null;
  id?: string;
};

export default function FormField({
  label,
  type = "text",
  value,
  onChange,
  name,
  placeholder,
  required,
  minLength,
  error,
  id,
}: Props) {
  const autoId = useId();
  const baseId = id || autoId;
  const a11y = fieldA11y(baseId, error || null);

  return (
    <div className="space-y-1">
      <label htmlFor={baseId} className="block text-sm text-midnight">
        {label}
      </label>
      <input
        id={baseId}
        name={name}
        type={type}
        value={value}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
        aria-invalid={a11y["aria-invalid"]}
        aria-describedby={a11y["aria-describedby"]}
      />
      {error && (
        <p id={`${baseId}-err`} className="text-sm text-red-600" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
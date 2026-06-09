import React, { useCallback, useMemo } from "react";
import { FiX } from "react-icons/fi";

type InputType = "text" | "number" | "tel" | "email" | "password";

const ALLOWED_KEYS = new Set([
  "Backspace",
  "Delete",
  "ArrowLeft",
  "ArrowRight",
  "Tab",
  "Enter",
]);

// Simplified key mapping using a more concise approach
const KEY_MAP = Object.fromEntries(
  [...Array(10)].flatMap((_, i) => [
    [`Digit${i}`, String(i)],
    [`Numpad${i}`, String(i)],
  ])
);

interface MeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  type?: InputType;
  min?: number;
  max?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  showDeleteButton?: boolean;
  deleteButtonColor?: string;
}

const MeInput: React.FC<MeInputProps> = ({
  value,
  onChange,
  placeholder = "",
  className = "",
  inputClassName = "me_input_better py-1 px-3 pr-8 w-full",
  type = "text",
  min,
  max,
  onKeyDown,
  onFocus,
  onBlur,
  showDeleteButton = true,
  deleteButtonColor = "text-white hover:text-grey",
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;

      if (type === "number") {
        if (newValue === "") {
          onChange("");
          return;
        }
        // Simplified number validation - only allow digits and a single minus at start
        const numericValue = newValue.replace(/[^0-9-]/g, "");
        newValue = numericValue.startsWith("-")
          ? "-" + numericValue.slice(1).replace(/-/g, "")
          : numericValue;
      }

      onChange(newValue);
    },
    [type, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (type !== "number") {
        onKeyDown?.(e);
        return;
      }

      // Handle special cases
      if ((e.ctrlKey && e.code === "KeyA") || ALLOWED_KEYS.has(e.key)) {
        onKeyDown?.(e);
        return;
      }

      const input = e.currentTarget;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const isAllSelected = start === 0 && end === input.value.length;

      e.preventDefault();

      // Handle digit input
      const digit = KEY_MAP[e.code];
      if (digit !== undefined) {
        const newValue =
          input.value.substring(0, start) + digit + input.value.substring(end);
        onChange(newValue);
        requestAnimationFrame(() => {
          input.setSelectionRange(start + 1, start + 1);
        });
        return;
      }

      // Handle minus sign
      if (e.key === "-" && start === 0) {
        const newValue = isAllSelected ? "-" : "-" + input.value;
        onChange(newValue);
        requestAnimationFrame(() => {
          input.setSelectionRange(1, 1);
        });
      }
    },
    [type, onChange, onKeyDown]
  );

  const inputProps = useMemo(
    () => ({
      type: "text",
      inputMode: (type === "number" ? "numeric" : "text") as "numeric" | "text",
      pattern: type === "number" ? "-?[0-9]*" : undefined,
      placeholder,
      value,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      onFocus,
      onBlur,
      className: inputClassName,
      tabIndex: -1,
      min,
      max,
    }),
    [
      type,
      placeholder,
      value,
      handleChange,
      handleKeyDown,
      onFocus,
      onBlur,
      inputClassName,
      min,
      max,
    ]
  );

  return (
    <div className={`relative border border-grey-more rounded ${className}`}>
      <input {...inputProps} />
      {value && showDeleteButton && (
        <button
          onClick={() => onChange("")}
          className={`absolute right-1 top-1/2 transform -translate-y-1/2 ${deleteButtonColor} focus:outline-none`}
          aria-label='Clear input'
        >
          <FiX />
        </button>
      )}
    </div>
  );
};

export default MeInput;

import clsx from "clsx";
import { Check } from "lucide-react";
import { type ReactNode, useId } from "react";

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  className?: string;
  disabled?: boolean;
  id?: string;
};

const Checkbox = ({
  checked,
  onChange,
  label,
  className,
  disabled,
  id,
}: CheckboxProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label
      htmlFor={inputId}
      className={clsx(
        "inline-flex items-center gap-2 select-none rounded",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <span
        aria-hidden
        className={clsx(
          "flex h-5 w-5 items-center justify-center rounded border-2 border-green-one outline-none transition",
          checked ? "bg-green-one text-white" : "bg-white text-transparent",
          disabled ? "border-opacity-50" : "hover:brightness-105"
        )}
      >
        <Check
          className={clsx(
            "h-4 w-4 transition-transform duration-150",
            checked ? "scale-100 opacity-100" : "scale-75 opacity-0"
          )}
          strokeWidth={3}
        />
      </span>
      {label && <span className="text-sm text-green-950">{label}</span>}
    </label>
  );
};

export default Checkbox;

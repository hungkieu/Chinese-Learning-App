import { useState, useRef, useEffect, type JSX } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownItem {
  label: string;
  icon?: JSX.Element;
  onClick: () => void;
}

interface DropdownMenuProps {
  label: string;
  items: DropdownItem[];
}

const Dropdown = ({ label, items }: DropdownMenuProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left cursor-pointer" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-one px-4 py-2 font-bold text-white transition cursor-pointer"
      >
        {label}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 cursor-pointer ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute cursor-pointer right-0 z-10 mt-2 origin-top-right animate-[fadeIn_0.15s_ease-out]">
          <div className="flex flex-col gap-2">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-green-gray transition cursor-pointer hover:scale-110"
              >
                {item.icon && (
                  <span className="w-4 h-4 text-white">{item.icon}</span>
                )}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Dropdown;

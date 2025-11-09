type ButtonProps = {
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
};

const Button = ({ className, children, onClick, disabled }: ButtonProps) => {
  return (
    <button
      className={`px-4 py-2 bg-green-one rounded-xl text-white font-bold hover:scale-105 active:scale-95 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;

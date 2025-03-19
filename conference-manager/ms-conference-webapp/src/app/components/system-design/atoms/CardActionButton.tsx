import { ReactNode } from 'react';

interface CardActionButtonProps {
  children: ReactNode;
  primary?: boolean;
  className?: string;
}

const CardActionButton = ({ children, primary = false, className = "" }: CardActionButtonProps) => {
  const baseClasses = "px-4 py-2 text-sm font-medium transition-colors";
  const primaryClasses = primary
    ? "text-blue-600 hover:text-blue-800"
    : "text-gray-600 hover:text-gray-800";

  return (
    <button className={`${baseClasses} ${primaryClasses} ${className}`}>
      {children}
    </button>
  );
};

export default CardActionButton;

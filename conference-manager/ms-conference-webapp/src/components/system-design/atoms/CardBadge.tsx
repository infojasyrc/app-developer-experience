import { ReactNode } from 'react';

interface CardBadgeProps {
  children: ReactNode;
  color?: "blue" | "green" | "red" | "yellow" | "gray";
  className?: string;
}

const CardBadge = ({ children, color = "blue", className = "" }: CardBadgeProps) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
    gray: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded ${colorClasses[color]} ${className}`}
    >
      {children}
    </span>
  );
};

export default CardBadge;

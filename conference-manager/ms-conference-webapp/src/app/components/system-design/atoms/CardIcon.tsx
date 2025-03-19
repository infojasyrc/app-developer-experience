import { ReactNode } from 'react';

interface CardIconProps {
  icon: ReactNode;
  className?: string;
}

const CardIcon = ({ icon, className = "" }: CardIconProps) => (
  <span className={`text-gray-500 ${className}`}>{icon}</span>
);

export default CardIcon;

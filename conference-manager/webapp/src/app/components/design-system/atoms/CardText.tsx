import { ReactNode } from 'react';

interface CardTextProps {
  children: ReactNode;
  className?: string;
}

const CardText = ({ children, className = "" }: CardTextProps) => (
  <p className={`text-gray-700 mb-6 ${className}`}>{children}</p>
);

export default CardText;

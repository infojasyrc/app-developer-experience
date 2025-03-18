// Card Container
import { ReactNode } from 'react';

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

const CardTitle = ({ children, className = "" }: CardTitleProps) => (
  <h2 className={`text-xl font-medium text-gray-800 mb-2 ${className}`}>
    {children}
  </h2>
);

export default CardTitle;
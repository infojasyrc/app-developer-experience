import { ReactNode } from 'react';

interface CardSubtitleProps {
  children: ReactNode;
  className?: string;
}

const CardSubtitle = ({ children, className = "" }: CardSubtitleProps) => (
  <h3 className={`text-sm text-gray-600 mb-4 ${className}`}>{children}</h3>
);

export default CardSubtitle;

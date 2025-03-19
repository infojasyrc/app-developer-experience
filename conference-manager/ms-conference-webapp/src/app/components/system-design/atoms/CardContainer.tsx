import { ReactNode } from 'react';

interface CardContainerProps {
  children: ReactNode;
  className?: string;
}

const CardContainer = ({ children, className = "" }: CardContainerProps) => (
  <div
    className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${className}`}
  >
    {children}
  </div>
);

export default CardContainer;

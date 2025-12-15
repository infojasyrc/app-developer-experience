import { ReactNode } from 'react';

interface CardActionsProps {
  children: ReactNode;
  className?: string;
}

const CardActions = ({ children, className = "" }: CardActionsProps) => (
  <div
    className={`flex items-center justify-end space-x-2 pt-2 border-t border-gray-200 ${className}`}
  >
    {children}
  </div>
);

export default CardActions;

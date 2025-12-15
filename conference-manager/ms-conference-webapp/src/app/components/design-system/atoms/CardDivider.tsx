interface CardDividerProps {
  className?: string;
}

const CardDivider = ({ className = "" }: CardDividerProps) => (
  <hr className={`my-2 border-gray-200 ${className}`} />
);

export default CardDivider;

interface CardTitleProps {
  title: string;
  className?: string;
}

const CardTitle = ({ title, className = "" }: CardTitleProps) => (
  <h2 className={`text-xl font-medium text-gray-800 mb-2 ${className}`}>
    {title}
  </h2>
);

export default CardTitle;
interface CardMediaProps {
  src: string;
  alt: string;
  className?: string;
}

// Card Media
const CardMedia = ({ src, alt, className = "" }: CardMediaProps) => (
  <img
    src={src}
    alt={alt || "Card image"}
    className={`w-full h-48 object-cover ${className}`}
  />
);

export default CardMedia;

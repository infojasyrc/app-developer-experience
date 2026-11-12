interface CardAvatarProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const CardAvatar = ({ src, alt, size = "md", className = "" }: CardAvatarProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <img
      src={src}
      alt={alt || "Avatar"}
      className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
    />
  );
};

export default CardAvatar;

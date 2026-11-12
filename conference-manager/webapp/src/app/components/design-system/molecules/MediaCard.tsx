import {
  CardContainer,
  CardMedia,
  CardContent,
  CardTitle,
  CardSubtitle,
  CardText,
  CardActions,
  CardActionButton,
} from "../atoms";

interface MediaCardProps {
  title: string;
  subtitle?: string;
  content: string;
  media: {
    src: string;
    alt: string;
  };
  actions?: {
    label: string;
    primary?: boolean;
  }[];
  className?: string;
}

const MediaCard = ({
  title,
  subtitle,
  content,
  media,
  actions = [],
  className = "",
}: MediaCardProps) => (
  <CardContainer className={className}>
    <CardMedia src={media.src} alt={media.alt} />
    <CardContent>
      <CardTitle title={title} />
      {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
      <CardText>{content}</CardText>
      {actions.length > 0 && (
        <CardActions>
          {actions.map((action, index) => (
            <CardActionButton key={index} primary={action.primary}>
              {action.label}
            </CardActionButton>
          ))}
        </CardActions>
      )}
    </CardContent>
  </CardContainer>
);

export default MediaCard;

import {
  CardContainer,
  CardMedia,
  CardContent,
  CardAvatar,
  CardTitle,
  CardSubtitle,
  CardText,
  CardActions,
  CardActionButton,
} from "../atoms";

interface ProfileCardProps {
  name: string;
  role: string;
  description: string;
  avatar: {
    src: string;
    alt: string;
  };
  media?: {
    src: string;
    alt: string;
  };
  actions?: {
    label: string;
    primary?: boolean;
  }[];
  className?: string;
}

const ProfileCard = ({
  name,
  role,
  description,
  avatar,
  media,
  actions = [],
  className = "",
}: ProfileCardProps) => (
  <CardContainer className={className}>
    {media && <CardMedia src={media.src} alt={media.alt} />}
    <CardContent>
      <div className="flex items-center mb-4">
        <CardAvatar src={avatar.src} alt={avatar.alt} />
        <div className="ml-3">
          <CardTitle className="mb-0" title={name} />
          <CardSubtitle className="mb-0">{role}</CardSubtitle>
        </div>
      </div>
      <CardText>{description}</CardText>
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

export default ProfileCard;

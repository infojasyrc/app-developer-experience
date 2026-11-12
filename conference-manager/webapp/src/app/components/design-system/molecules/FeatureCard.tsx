import {
  CardActionButton,
  CardActions,
  CardBadge,
  CardContainer,
  CardContent,
  CardIcon,
  CardText,
  CardTitle,
} from "../atoms";

interface FeatureCardProps {
  icon: string;
  title: string;
  content: string;
  badge?: {
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray';
    text: string;
  };
  actions?: {
    label: string;
    primary?: boolean;
  }[];
  className?: string;
}

const FeatureCard = ({
  icon,
  title,
  content,
  badge,
  actions = [],
  className = "",
}: FeatureCardProps) => (
  <CardContainer className={className}>
    <CardContent>
      <div className="flex items-start mb-4">
        <CardIcon icon={icon} className="text-2xl mr-3" />
        <div>
          <div className="flex items-center">
            <CardTitle className="mb-0 mr-2" title={title} />
            {badge && <CardBadge color={badge.color}>{badge.text}</CardBadge>}
          </div>
          <CardText>{content}</CardText>
        </div>
      </div>
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

export default FeatureCard;

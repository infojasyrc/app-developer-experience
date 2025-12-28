import {
  CardContainer,
  CardContent,
  CardTitle,
  CardText,
  CardActions,
  CardActionButton,
} from "../atoms";

interface BasicCardProps {
  title: string;
  content: string;
  actions?: { label: string; primary?: boolean }[];
  className?: string;
}

const BasicCard = ({
  title,
  content,
  actions = [],
  className = "",
}: BasicCardProps) => (
  <CardContainer className={className}>
    <CardContent>
      <CardTitle title={title} />
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

export default BasicCard;

import { ConferenceStatus } from "../../shared/entities/conference";

const STATUS_STYLES: Record<ConferenceStatus, string> = {
  created: "bg-green text-white",
  active: "bg-green text-white",
  opened: "bg-blue text-white",
  paused: "bg-mediumGray text-dark",
  closed: "bg-red text-white",
  inactive: "bg-gray text-white",
};

export interface ConferenceStatusBadgeProps {
  status: ConferenceStatus;
}

export default function ConferenceStatusBadge({
  status,
}: ConferenceStatusBadgeProps) {
  const styles = STATUS_STYLES[status] ?? "bg-gray text-white";
  return (
    <span
      data-testid="conference-status-badge"
      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${styles}`}
    >
      {status}
    </span>
  );
}

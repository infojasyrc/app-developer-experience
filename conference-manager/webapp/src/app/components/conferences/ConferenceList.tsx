import ConferenceCard from "./ConferenceCard";
import { Conference } from "../../shared/entities/conference";

interface ConferenceListProps {
  conferences: Conference[];
}

export default function ConferenceList({ conferences }: ConferenceListProps) {
  if (conferences.length === 0) {
    return (
      <div className="text-center py-16 text-gray">
        <p className="text-lg font-medium">No conferences found</p>
        <p className="text-sm mt-1">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {conferences.map((conference) => (
        <ConferenceCard key={conference._id} conference={conference} />
      ))}
    </div>
  );
}

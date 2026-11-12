"use client";
import { useConference } from "../../lib/api/queries/useConference";
import { Conference } from "../../shared/entities/conference";
import ConferenceDetailSkeleton from "./ConferenceDetailSkeleton";
import ConferenceForm from "./ConferenceForm";

export interface ConferenceEditFormProps {
  id: string;
  isSubmitting?: boolean;
  onSubmit: (data: Partial<Conference>) => void;
  onCancel: () => void;
}

export default function ConferenceEditForm({
  id,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: ConferenceEditFormProps) {
  const { data: conference, isLoading, isError } = useConference(id);

  if (isLoading) return <ConferenceDetailSkeleton />;

  if (isError || !conference) {
    return (
      <div className="text-center py-16 text-red-500">
        Conference not found.
      </div>
    );
  }

  return (
    <ConferenceForm
      defaultValues={conference}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
}

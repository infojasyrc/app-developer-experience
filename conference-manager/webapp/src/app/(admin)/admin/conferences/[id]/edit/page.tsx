"use client";
import { use } from "react";
import { useRouter } from "next/navigation";
import { Conference } from "../../../../../shared/entities/conference";
import { useUpdateConference } from "../../../../../lib/api/queries/useMutateConference";
import ConferenceEditForm from "../../../../../components/conferences/ConferenceEditForm";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminConferenceEditPage({ params }: EditPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { mutate: updateConference, isPending } = useUpdateConference();

  const handleSubmit = (data: Partial<Conference>) => {
    updateConference(
      { id, data },
      { onSuccess: () => router.push("/admin/conferences") }
    );
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-dark mb-6">Edit Conference</h1>
      <div className="bg-white rounded-xl border border-mediumGray p-6">
        <ConferenceEditForm
          id={id}
          isSubmitting={isPending}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/conferences")}
        />
      </div>
    </div>
  );
}

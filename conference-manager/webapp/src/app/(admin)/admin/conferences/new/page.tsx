"use client";
import { useRouter } from "next/navigation";
import { Conference } from "../../../../shared/entities/conference";
import { useAddConference } from "../../../../lib/api/queries/useMutateConference";
import ConferenceForm from "../../../../components/conferences/ConferenceForm";

export default function AdminConferencesNewPage() {
  const router = useRouter();
  const { mutate: addConference, isPending } = useAddConference();

  const handleSubmit = (data: Partial<Conference>) => {
    addConference(data, {
      onSuccess: () => router.push("/admin/conferences"),
    });
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-dark mb-6">Add Conference</h1>
      <div className="bg-white rounded-xl border border-mediumGray p-6">
        <ConferenceForm
          isSubmitting={isPending}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/conferences")}
        />
      </div>
    </div>
  );
}

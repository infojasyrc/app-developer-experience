"use client";
import { use } from "react";
import { useRouter } from "next/navigation";
import { useConference } from "../../../../lib/api/queries/useConference";
import ConferencePlayView from "../../../../components/conferences/ConferencePlayView";

interface PlayPageProps {
  params: Promise<{ id: string }>;
}

export default function ConferencePlayPage({ params }: PlayPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: conference, isLoading, isError } = useConference(id);

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-dark flex items-center justify-center">
        <span className="text-white/70 text-sm">Loading…</span>
      </div>
    );
  }

  if (isError || !conference) {
    return (
      <div className="w-full h-screen bg-dark flex flex-col items-center justify-center gap-4">
        <p className="text-white/70 text-sm">Conference not found.</p>
        <button
          onClick={() => router.push("/")}
          className="text-mainBlue text-sm hover:underline"
        >
          Back to home
        </button>
      </div>
    );
  }

  return (
    <ConferencePlayView
      conference={conference}
      onBack={() => router.push(`/conferences/${id}`)}
    />
  );
}

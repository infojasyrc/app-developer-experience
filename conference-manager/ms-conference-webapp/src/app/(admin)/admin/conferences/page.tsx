"use client";
import { useConferences } from "../../../lib/api/queries/useConferences";
import { useHeadquarters } from "../../../lib/api/queries/useHeadquarters";
import ConferenceAdminView from "../../../components/conferences/ConferenceAdminView";

export default function AdminConferencesPage() {
  const { data: conferences = [], isLoading } = useConferences();
  const { data: headquarters = [] } = useHeadquarters();

  return (
    <ConferenceAdminView
      conferences={conferences}
      headquarters={headquarters}
      isLoading={isLoading}
    />
  );
}

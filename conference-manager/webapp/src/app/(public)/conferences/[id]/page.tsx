import { Metadata } from "next";
import ConferenceDetails from "../../../components/conferences/ConferenceDetails";

export const metadata: Metadata = {
  title: "Conference Details",
};

interface ConferencePageProps {
  params: Promise<{ id: string }>;
}

export default async function ConferencePage({ params }: ConferencePageProps) {
  const { id } = await params;
  return <ConferenceDetails id={id} />;
}

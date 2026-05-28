import { Metadata } from "next";
import ConferencesView from "../components/conferences/ConferencesView";

export const metadata: Metadata = {
  title: "Conference Manager",
};

export default function HomePage() {
  return <ConferencesView />;
}

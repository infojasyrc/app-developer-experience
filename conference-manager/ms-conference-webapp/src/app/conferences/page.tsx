import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conferences",
};

interface ConferencesPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function Conferences() {
  return (
    <div><h1>Conferences</h1></div>
  );
}

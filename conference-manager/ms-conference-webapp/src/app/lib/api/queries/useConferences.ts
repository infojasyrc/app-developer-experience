import { useQuery } from "@tanstack/react-query";
import { Conference } from "../../../shared/entities/conference";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const fetchConferences = async (params?: {
  status?: string;
  headquarter?: string;
  year?: string;
  isAdmin?: boolean;
}): Promise<Conference[]> => {
  const url = new URL(`${BASE}conferences`);
  if (params?.status) url.searchParams.set("status", params.status);
  if (params?.headquarter) url.searchParams.set("headquarter", params.headquarter);
  if (params?.year) url.searchParams.set("year", params.year);
  if (params?.isAdmin !== undefined)
    url.searchParams.set("isAdmin", String(params.isAdmin));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch conferences");
  return res.json();
};

export function useConferences(params?: Parameters<typeof fetchConferences>[0]) {
  return useQuery<Conference[]>({
    queryKey: ["conferences", params],
    queryFn: () => fetchConferences(params),
  });
}

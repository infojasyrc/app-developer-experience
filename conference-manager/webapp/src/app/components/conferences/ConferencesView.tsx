"use client";
import { useState, useMemo } from "react";
import { useConferences } from "../../lib/api/queries/useConferences";
import { useHeadquarters } from "../../lib/api/queries/useHeadquarters";
import { sortAscending, sortDescending } from "../../shared/utils/sorting";
import ConferenceList from "./ConferenceList";

export default function ConferencesView() {
  const [selectedHQ, setSelectedHQ] = useState("");
  const [sortBy, setSortBy] = useState<"asc" | "desc">("asc");

  const { data: conferences = [], isLoading, isError } = useConferences({
    headquarter: selectedHQ || undefined,
  });
  const { data: headquarters = [] } = useHeadquarters();

  const sorted = useMemo(
    () => [...conferences].sort(sortBy === "asc" ? sortAscending : sortDescending),
    [conferences, sortBy]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-dark">Conferences</h1>
        <div className="flex gap-2 flex-wrap">
          <select
            value={selectedHQ}
            onChange={(e) => setSelectedHQ(e.target.value)}
            className="text-sm border border-mediumGray rounded px-3 py-1.5 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-mainBlue"
          >
            <option value="">All Locations</option>
            {headquarters.map((hq) => (
              <option key={hq._id} value={hq._id}>{hq.name}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "asc" | "desc")}
            className="text-sm border border-mediumGray rounded px-3 py-1.5 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-mainBlue"
          >
            <option value="asc">Earliest first</option>
            <option value="desc">Latest first</option>
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-16 text-gray">Loading conferences…</div>
      )}
      {isError && (
        <div className="text-center py-16 text-red-500">Failed to load conferences.</div>
      )}
      {!isLoading && !isError && <ConferenceList conferences={sorted} />}
    </div>
  );
}

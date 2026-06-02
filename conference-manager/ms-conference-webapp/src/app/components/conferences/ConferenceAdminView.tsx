"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { Conference, ConferenceStatus } from "../../shared/entities/conference";
import { Headquarter } from "../../shared/entities/headquarter";
import { sortAscending, sortDescending } from "../../shared/utils/sorting";
import { useDeleteConference, useUpdateConference } from "../../lib/api/queries/useMutateConference";
import ConferenceStatusBadge from "./ConferenceStatusBadge";
import { StatusEnum } from "../../shared/constants/constants";

export interface ConferenceAdminViewProps {
  conferences: Conference[];
  headquarters: Headquarter[];
  isLoading: boolean;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export default function ConferenceAdminView({
  conferences,
  headquarters,
  isLoading,
}: ConferenceAdminViewProps) {
  const router = useRouter();
  const [selectedHQ, setSelectedHQ] = useState("");
  const [sortBy, setSortBy] = useState<"asc" | "desc">("asc");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteResult, setDeleteResult] = useState<"idle" | "success" | "error">("idle");

  const { mutate: deleteMutation, isPending: isDeleting } = useDeleteConference();
  const { mutate: updateMutation } = useUpdateConference();

  const filtered = useMemo(() => {
    let list = selectedHQ
      ? conferences.filter((c) => c.headquarter?._id === selectedHQ)
      : conferences;
    return [...list].sort(sortBy === "asc" ? sortAscending : sortDescending);
  }, [conferences, selectedHQ, sortBy]);

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation(deleteId, {
      onSuccess: () => {
        setDeleteResult("success");
      },
      onError: () => {
        setDeleteResult("error");
      },
    });
  };

  const handleCloseModal = () => {
    setDeleteId(null);
    setDeleteResult("idle");
  };

  const handleToggleStatus = (conference: Conference) => {
    const newStatus: ConferenceStatus =
      conference.status !== StatusEnum.active ? StatusEnum.active : StatusEnum.inactive;
    updateMutation({ id: conference._id, data: { status: newStatus } });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray text-sm">
        Loading conferences…
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
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
              <option key={hq._id} value={hq._id}>
                {hq.name}
              </option>
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
          <button
            data-testid="add-conference-button"
            onClick={() => router.push("/admin/conferences/new")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-mainBlue text-white text-sm font-medium hover:bg-darkerBlue transition-colors"
          >
            <FiPlus size={14} />
            Add
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray text-sm">No conferences found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-mediumGray">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-lightGray text-boldGray text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-center px-4 py-3 font-semibold">Date</th>
                <th className="text-center px-4 py-3 font-semibold">Status</th>
                <th className="text-center px-4 py-3 font-semibold">Publish</th>
                <th className="text-center px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mediumGray bg-white">
              {filtered.map((conference) => (
                <tr key={conference._id} className="hover:bg-lightGray transition-colors">
                  <td className="px-4 py-3 text-dark font-medium max-w-[220px] truncate">
                    {conference.name}
                  </td>
                  <td className="px-4 py-3 text-center text-gray whitespace-nowrap">
                    {formatDate(conference.eventDate)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ConferenceStatusBadge status={conference.status} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleStatus(conference)}
                      className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                        conference.status !== StatusEnum.active
                          ? "bg-green text-white border-green hover:opacity-90"
                          : "border-mediumGray text-boldGray hover:bg-lightGray"
                      }`}
                    >
                      {conference.status !== StatusEnum.active ? "Enable" : "Disable"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/conferences/${conference._id}/edit`)}
                        className="p-1.5 rounded text-boldGray hover:text-mainBlue hover:bg-lightBlue transition-colors"
                        aria-label="Edit conference"
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteId(conference._id);
                          setDeleteResult("idle");
                        }}
                        className="p-1.5 rounded text-boldGray hover:text-red hover:bg-red/10 transition-colors"
                        aria-label="Delete conference"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparentBlack"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {deleteResult === "idle" && (
              <>
                <h3 className="text-lg font-bold text-dark mb-2">Delete conference?</h3>
                <p className="text-sm text-gray mb-6">
                  This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleCloseModal}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded border border-mediumGray text-boldGray text-sm hover:bg-lightGray transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded bg-red text-white text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </>
            )}
            {deleteResult === "success" && (
              <>
                <h3 className="text-lg font-bold text-green mb-4">Successfully deleted!</h3>
                <div className="flex justify-end">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 rounded border border-mediumGray text-boldGray text-sm hover:bg-lightGray transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
            {deleteResult === "error" && (
              <>
                <h3 className="text-lg font-bold text-red mb-4">Failed to delete</h3>
                <div className="flex justify-end">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 rounded border border-mediumGray text-boldGray text-sm hover:bg-lightGray transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

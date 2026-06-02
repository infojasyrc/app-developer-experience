"use client";
import { FiCalendar, FiMapPin, FiPhone, FiX } from "react-icons/fi";
import { Conference } from "../../shared/entities/conference";
import { getDateParts } from "../../shared/utils/dateHandler";
import ConferenceStatusBadge from "./ConferenceStatusBadge";
import ConferencePreviewActions from "./ConferencePreviewActions";

export interface ConferencePreviewProps {
  conference: Conference;
  onClose: () => void;
  onOpen: (id: string) => void;
  onPause: (id: string) => void;
  onConferenceClose: (id: string) => void;
  onEnter: (id: string) => void;
  onSynchronize: (id: string) => void;
}

export default function ConferencePreview({
  conference,
  onClose,
  onOpen,
  onPause,
  onConferenceClose,
  onEnter,
  onSynchronize,
}: ConferencePreviewProps) {
  const { day, month, year } = getDateParts(conference.eventDate);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparentBlack"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-mediumGray">
          <h2 className="text-xl font-bold text-mainBlue pr-4">{conference.name}</h2>
          <button
            className="text-gray hover:text-dark transition-colors shrink-0"
            onClick={onClose}
            aria-label="Close preview"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray uppercase mb-1">Date</p>
            <p className="text-sm text-dark flex items-center gap-1.5">
              <FiCalendar size={14} />
              {day} {month} {year}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray uppercase mb-1">Status</p>
            <ConferenceStatusBadge status={conference.status} />
          </div>

          {conference.headquarter && (
            <div>
              <p className="text-xs font-semibold text-gray uppercase mb-1">Headquarter</p>
              <p className="text-sm text-dark flex items-center gap-1.5">
                <FiMapPin size={14} />
                {conference.headquarter.name}
              </p>
            </div>
          )}

          {conference.address && (
            <div>
              <p className="text-xs font-semibold text-gray uppercase mb-1">Address</p>
              <p className="text-sm text-dark flex items-center gap-1.5">
                <FiMapPin size={14} />
                {conference.address}
              </p>
            </div>
          )}

          {conference.phoneNumber && (
            <div>
              <p className="text-xs font-semibold text-gray uppercase mb-1">Phone</p>
              <p className="text-sm text-dark flex items-center gap-1.5">
                <FiPhone size={14} />
                {conference.phoneNumber}
              </p>
            </div>
          )}

          {conference.description && (
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold text-gray uppercase mb-1">Description</p>
              <p className="text-sm text-dark leading-relaxed">{conference.description}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 pt-2 border-t border-mediumGray">
          <ConferencePreviewActions
            status={conference.status}
            conferenceId={conference._id}
            onOpen={onOpen}
            onPause={onPause}
            onClose={onConferenceClose}
            onEnter={onEnter}
            onSynchronize={onSynchronize}
          />
        </div>
      </div>
    </div>
  );
}

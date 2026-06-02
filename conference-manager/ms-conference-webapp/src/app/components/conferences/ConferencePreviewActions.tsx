"use client";
import { ConferenceStatus } from "../../shared/entities/conference";

export interface ConferencePreviewActionsProps {
  status: ConferenceStatus;
  conferenceId: string;
  onOpen: (id: string) => void;
  onPause: (id: string) => void;
  onClose: (id: string) => void;
  onEnter: (id: string) => void;
  onSynchronize: (id: string) => void;
}

function btnClass(variant: "outlined" | "contained" | "danger") {
  const base = "px-3 py-1.5 rounded text-sm font-medium transition-colors border";
  if (variant === "contained")
    return `${base} bg-mainBlue border-mainBlue text-white hover:bg-darkerBlue`;
  if (variant === "danger")
    return `${base} bg-red border-red text-white hover:opacity-90`;
  return `${base} border-mediumGray text-boldGray hover:bg-lightGray`;
}

function UploadButton({ conferenceId, onSynchronize }: { conferenceId: string; onSynchronize: (id: string) => void }) {
  return (
    <button
      data-testid="upload-attendees-conference-button"
      className={btnClass("outlined")}
      onClick={() => onSynchronize(conferenceId)}
    >
      Upload attendees
    </button>
  );
}

export default function ConferencePreviewActions({
  status,
  conferenceId,
  onOpen,
  onPause,
  onClose,
  onEnter,
  onSynchronize,
}: ConferencePreviewActionsProps) {
  if (status === "created") {
    return (
      <div className="flex gap-2 flex-wrap justify-end">
        <button
          data-testid="open-conference-button"
          className={btnClass("contained")}
          onClick={() => onOpen(conferenceId)}
        >
          Open
        </button>
        <UploadButton conferenceId={conferenceId} onSynchronize={onSynchronize} />
      </div>
    );
  }

  if (status === "opened") {
    return (
      <div className="flex gap-2 flex-wrap justify-end">
        <button
          data-testid="pause-conference-button"
          className={btnClass("outlined")}
          onClick={() => onPause(conferenceId)}
        >
          Pause
        </button>
        <button
          data-testid="close-conference-button"
          className={btnClass("danger")}
          onClick={() => onClose(conferenceId)}
        >
          Close
        </button>
        <button
          data-testid="enter-conference-button"
          className={btnClass("contained")}
          onClick={() => onEnter(conferenceId)}
        >
          Go!
        </button>
        <UploadButton conferenceId={conferenceId} onSynchronize={onSynchronize} />
      </div>
    );
  }

  if (status === "paused") {
    return (
      <div className="flex gap-2 flex-wrap justify-end">
        <button
          data-testid="unpause-conference-button"
          className={btnClass("contained")}
          onClick={() => onOpen(conferenceId)}
        >
          Unpause
        </button>
        <UploadButton conferenceId={conferenceId} onSynchronize={onSynchronize} />
      </div>
    );
  }

  return null;
}

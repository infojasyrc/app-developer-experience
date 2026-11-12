"use client";
import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiCalendar, FiMapPin, FiPhone, FiPlay, FiTag } from "react-icons/fi";
import { useConference } from "../../lib/api/queries/useConference";
import { getDateParts } from "../../shared/utils/dateHandler";
import ConferenceStatusBadge from "./ConferenceStatusBadge";
import ConferenceDetailSkeleton from "./ConferenceDetailSkeleton";
import { ImageMediaType } from "../../shared/entities/media";

const DEFAULT_IMAGE = "/programmingImg.png";

interface ConferenceDetailsProps {
  id: string;
}

function getImageUrl(images?: string[] | ImageMediaType[]): string {
  if (!images || images.length === 0) return DEFAULT_IMAGE;
  const first = images[0];
  if (typeof first === "string") return first || DEFAULT_IMAGE;
  return (first as ImageMediaType).url ?? DEFAULT_IMAGE;
}

export default function ConferenceDetails({ id }: ConferenceDetailsProps) {
  const { data: conference, isLoading, isError } = useConference(id);

  if (isLoading) return <ConferenceDetailSkeleton />;

  if (isError || !conference) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-red-500">
        Conference not found.
      </div>
    );
  }

  const { day, month, year } = getDateParts(conference.eventDate);
  const imageUrl = getImageUrl(conference.images);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-mainBlue hover:underline mb-6"
      >
        <FiArrowLeft size={14} /> Back to conferences
      </Link>

      <div className="relative h-56 w-full bg-lightGray rounded-xl overflow-hidden mb-6">
        <Image
          src={imageUrl}
          alt={conference.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 768px"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
          }}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-dark">{conference.name}</h1>
        <ConferenceStatusBadge status={conference.status} />
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-boldGray mb-6">
        <span className="flex items-center gap-1.5">
          <FiCalendar size={14} />
          {day} {month} {year}
        </span>
        {conference.headquarter && (
          <span className="flex items-center gap-1.5">
            <FiMapPin size={14} />
            {conference.headquarter.name}
          </span>
        )}
        {conference.address && (
          <span className="flex items-center gap-1.5">
            <FiMapPin size={14} />
            {conference.address}
          </span>
        )}
        {conference.phoneNumber && (
          <span className="flex items-center gap-1.5">
            <FiPhone size={14} />
            {conference.phoneNumber}
          </span>
        )}
      </div>

      {conference.description && (
        <p className="text-dark text-sm leading-relaxed mb-6">
          {conference.description}
        </p>
      )}

      {conference.tags && (
        <div className="flex flex-wrap items-start gap-2 mb-6">
          <FiTag size={14} className="text-boldGray mt-0.5 shrink-0" />
          {conference.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .map((tag) => (
              <span
                key={tag}
                className="bg-lightBlue text-mainBlue text-xs px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
        </div>
      )}

      <div className="pt-4 border-t border-mediumGray flex items-center gap-3 flex-wrap">
        {conference.subscribed ? (
          <span className="inline-block px-4 py-2 rounded border border-mediumGray text-gray text-sm">
            Already subscribed
          </span>
        ) : (
          <button className="px-4 py-2 rounded bg-mainBlue text-white text-sm font-medium hover:bg-darkerBlue transition-colors">
            Register for this conference
          </button>
        )}
        <Link
          href={`/conferences/${conference._id}/play`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded border border-mediumGray text-boldGray text-sm hover:border-mainBlue hover:text-mainBlue transition-colors"
        >
          <FiPlay size={13} />
          Play slideshow
        </Link>
      </div>
    </div>
  );
}

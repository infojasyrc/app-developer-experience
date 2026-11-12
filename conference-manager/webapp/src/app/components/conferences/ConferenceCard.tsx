"use client";
import Link from "next/link";
import Image from "next/image";
import { Conference } from "../../shared/entities/conference";
import { getDateParts } from "../../shared/utils/dateHandler";
import ConferenceStatusBadge from "./ConferenceStatusBadge";

const DEFAULT_IMAGE = "/programmingImg.png";

function getImageUrl(conference: Conference): string {
  const first = Array.isArray(conference.images) ? conference.images[0] : undefined;
  if (!first) return DEFAULT_IMAGE;
  if (typeof first === "string") return first;
  return (first as { url?: string }).url ?? DEFAULT_IMAGE;
}

export interface ConferenceCardProps {
  conference: Conference;
}

export default function ConferenceCard({ conference }: ConferenceCardProps) {
  const { day, month, year } = getDateParts(conference.eventDate);
  const imageUrl = getImageUrl(conference);

  return (
    <article className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Cover image */}
      <div className="relative h-40 w-full bg-lightGray">
        <Image
          src={imageUrl}
          alt={conference.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
          }}
        />
      </div>

      {/* Body */}
      <div className="flex gap-3 p-4 flex-1">
        {/* Date column */}
        <div className="flex flex-col items-center min-w-[44px] text-center pt-0.5">
          <span className="text-2xl font-bold text-dark leading-none">{day}</span>
          <span className="text-xs text-gray uppercase">{month}</span>
          <span className="text-xs text-gray">{year}</span>
        </div>

        {/* Info column */}
        <div className="flex flex-col flex-1 gap-1 min-w-0">
          <p className="font-semibold text-dark truncate text-sm">{conference.name}</p>
          {conference.headquarter && (
            <p className="text-xs text-boldGray truncate">
              {conference.headquarter.name}
            </p>
          )}
          <ConferenceStatusBadge status={conference.status} />
        </div>

        {/* Actions column */}
        <div className="flex flex-col items-end justify-between shrink-0">
          <Link
            href={`/conferences/${conference._id}`}
            className="text-xs text-mainBlue hover:underline"
          >
            More info
          </Link>
          <Link
            href={`/conferences/${conference._id}`}
            className={`mt-2 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
              conference.subscribed
                ? "border-mediumGray text-gray cursor-default pointer-events-none"
                : "border-mainBlue text-mainBlue hover:bg-mainBlue hover:text-white"
            }`}
          >
            {conference.subscribed ? "Subscribed" : "Register"}
          </Link>
        </div>
      </div>
    </article>
  );
}

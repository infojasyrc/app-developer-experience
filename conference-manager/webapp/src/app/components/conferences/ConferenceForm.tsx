"use client";
import { ChangeEvent, FormEvent, useState } from "react";
import { Conference, ConferenceDataValidation } from "../../shared/entities/conference";
import { useHeadquarters } from "../../lib/api/queries/useHeadquarters";

const EVENT_TYPES = ["Recruiting", "Sales"] as const;

const EMPTY_VALIDATION: ConferenceDataValidation = {
  name: { error: false, message: "" },
  eventDate: { error: false, message: "" },
};

export interface ConferenceFormProps {
  defaultValues?: Partial<Conference>;
  isSubmitting?: boolean;
  onSubmit: (data: Partial<Conference>) => void;
  onCancel: () => void;
}

function inputClass(error?: boolean) {
  return `w-full border ${error ? "border-red" : "border-mediumGray"} rounded px-3 py-2 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-mainBlue`;
}

function labelClass() {
  return "block text-xs font-semibold text-boldGray mb-1";
}

export default function ConferenceForm({
  defaultValues = {},
  isSubmitting = false,
  onSubmit,
  onCancel,
}: ConferenceFormProps) {
  const [name, setName] = useState(defaultValues.name ?? "");
  const [description, setDescription] = useState(defaultValues.description ?? "");
  const [eventDate, setEventDate] = useState(defaultValues.eventDate ?? "");
  const [address, setAddress] = useState(defaultValues.address ?? "");
  const [phoneNumber, setPhoneNumber] = useState(defaultValues.phoneNumber ?? "");
  const [type, setType] = useState(defaultValues.type ?? "");
  const [tags, setTags] = useState(defaultValues.tags ?? "");
  const [headquarterId, setHeadquarterId] = useState(
    defaultValues.headquarter?._id ?? ""
  );
  const [validation, setValidation] = useState<ConferenceDataValidation>(EMPTY_VALIDATION);

  const { data: headquarters = [], isLoading: hqLoading } = useHeadquarters();

  const validate = (): boolean => {
    const next: ConferenceDataValidation = {
      name: name.trim() ? { error: false, message: "" } : { error: true, message: "Name is required" },
      eventDate: eventDate ? { error: false, message: "" } : { error: true, message: "Date is required" },
    };
    setValidation(next);
    return !next.name.error && !next.eventDate.error;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedHQ = headquarters.find((hq) => hq._id === headquarterId);
    const payload: Partial<Conference> = {
      name: name.trim(),
      description: description.trim(),
      eventDate,
      address: address.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      type,
      tags: tags.trim() || undefined,
      headquarter: selectedHQ,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} noValidate autoComplete="off">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className={labelClass()} htmlFor="cf-name">
            Title <span className="text-red">*</span>
          </label>
          <input
            id="cf-name"
            type="text"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            className={inputClass(validation.name.error)}
            placeholder="Conference title"
          />
          {validation.name.error && (
            <p className="text-red text-xs mt-1">{validation.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className={labelClass()} htmlFor="cf-desc">
            Description
          </label>
          <textarea
            id="cf-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass()} resize-none h-24`}
            placeholder="Conference description"
          />
        </div>

        {/* Date */}
        <div>
          <label className={labelClass()} htmlFor="cf-date">
            Date <span className="text-red">*</span>
          </label>
          <input
            id="cf-date"
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className={inputClass(validation.eventDate.error)}
          />
          {validation.eventDate.error && (
            <p className="text-red text-xs mt-1">{validation.eventDate.message}</p>
          )}
        </div>

        {/* Headquarter */}
        <div>
          <label className={labelClass()} htmlFor="cf-hq">
            Headquarter
          </label>
          <select
            id="cf-hq"
            value={headquarterId}
            onChange={(e) => setHeadquarterId(e.target.value)}
            className={inputClass()}
            disabled={hqLoading}
          >
            <option value="">{hqLoading ? "Loading…" : "Select location"}</option>
            {headquarters.map((hq) => (
              <option key={hq._id} value={hq._id}>
                {hq.name}
              </option>
            ))}
          </select>
        </div>

        {/* Address */}
        <div>
          <label className={labelClass()} htmlFor="cf-address">
            Address
          </label>
          <input
            id="cf-address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={inputClass()}
            placeholder="Venue address"
          />
        </div>

        {/* Phone */}
        <div>
          <label className={labelClass()} htmlFor="cf-phone">
            Phone
          </label>
          <input
            id="cf-phone"
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className={inputClass()}
            placeholder="+1 555 000 0000"
          />
        </div>

        {/* Tags */}
        <div>
          <label className={labelClass()} htmlFor="cf-tags">
            Tags <span className="text-gray font-normal">(comma-separated)</span>
          </label>
          <input
            id="cf-tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className={inputClass()}
            placeholder="tech, cloud, devops"
          />
        </div>

        {/* Event Type */}
        <div>
          <p className={labelClass()}>Event Type</p>
          <div className="flex gap-4 mt-1">
            {EVENT_TYPES.map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer text-sm text-dark">
                <input
                  type="radio"
                  name="cf-type"
                  value={t}
                  checked={type === t}
                  onChange={() => setType(t)}
                  className="accent-mainBlue"
                />
                {t}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 rounded border border-mediumGray text-boldGray text-sm hover:bg-lightGray transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded bg-mainBlue text-white text-sm font-medium hover:bg-darkerBlue transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

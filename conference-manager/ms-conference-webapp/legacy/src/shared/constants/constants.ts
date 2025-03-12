import { convertYears } from "../tools"

export enum StatusEnum {
  active = 'active',
  inactive = 'inactive',
}

export enum CarouselEnum {
  MAX_DESKTOP_STEPS = 3,
}

export const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" }
]

export const allYears = [
  { key: convertYears(-1), label: convertYears(-1) },
  { key: convertYears(), label: convertYears()},
  { key: convertYears(1), label: convertYears(1)},
]

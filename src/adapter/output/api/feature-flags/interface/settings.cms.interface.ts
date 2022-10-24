import { z } from 'zod';

export const SettingSchema = z.object({
  id: z.string().optional(),
  enabled: z.boolean(),
  salesEnabled: z.boolean(),
});

export type Setting = z.infer<typeof SettingSchema>;

export const SettingsResponseSchema = z.object({
  data: z.object({
    setting: SettingSchema,
  }),
});

export type SettingsResponse = z.infer<typeof SettingsResponseSchema>;

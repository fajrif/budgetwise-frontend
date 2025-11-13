// src/utils/validation.ts
import { z } from "zod";

export const projectSchema = z.object({
  id: z.string().optional(),
  no_sp2k: z.string().min(1, "No SP2K required"),
  no_perjanjian: z.string().nullable().optional(),
  no_amandemen: z.string().nullable().optional(),
  tanggal_perjanjian: z.string().nullable().optional(), // ISO date string
  judul_pekerjaan: z.string().min(1, "Judul required"),
  jangka_waktu: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().int().positive().nullable().optional()),
  tanggal_mulai: z.string().min(1, "Tanggal mulai required"),
  tanggal_selesai: z.string().min(1, "Tanggal selesai required"),
  nilai_pekerjaan: z.preprocess((v) => Number(v), z.number().positive()),
  management_fee: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().nullable().optional()),
  tarif_management_fee_persen: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().nullable().optional()),
  client: z.string().nullable().optional(),
  pic_client: z.string().nullable().optional(),
  contact_client: z.string().nullable().optional(),
  alamat_client: z.string().nullable().optional(),
  jenis_kontrak: z.string().nullable().optional(),
  status_kontrak: z.string().optional().default("Active"),
});

export type Project = z.infer<typeof projectSchema>;

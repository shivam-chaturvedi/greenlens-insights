import { supabase } from "./supabaseClient";

export const REPORT_BUCKET = "consulting-reports";
export const REPORT_CATEGORIES = [
  "Lighting",
  "Appliances",
  "HVAC",
  "Windows/Ventilation",
  "Other",
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export const CATEGORY_COLOR_MAP: Record<ReportCategory, string> = {
  Lighting: "#f97316",
  Appliances: "#fbbf24",
  HVAC: "#22c55e",
  "Windows/Ventilation": "#38bdf8",
  Other: "#a855f7",
};

export type ConsultingReportRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  savings: number | string | null;
  pdf_bucket: string | null;
  pdf_path: string | null;
  summary: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ConsultingReport = {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  savings: number;
  pdfBucket: string;
  pdfPath: string;
  summary: string;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

const coerceCategory = (value: string | null): ReportCategory => {
  if (!value) return "Other";
  if (REPORT_CATEGORIES.includes(value as ReportCategory)) {
    return value as ReportCategory;
  }
  return "Other";
};

export const getReportPublicUrl = (path: string) => {
  if (!path) return "";
  return supabase.storage.from(REPORT_BUCKET).getPublicUrl(path).data.publicUrl ?? "";
};

export const fetchConsultingReports = async (): Promise<ConsultingReport[]> => {
  const { data, error } = await supabase
    .from<ConsultingReportRow>("consulting_reports")
    .select(
      "id, title, description, category, savings, pdf_bucket, pdf_path, summary, uploaded_by, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    category: coerceCategory(row.category),
    savings: typeof row.savings === "string" ? Number(row.savings) : row.savings ?? 0,
    pdfBucket: row.pdf_bucket ?? REPORT_BUCKET,
    pdfPath: row.pdf_path ?? "",
    summary: row.summary ?? "",
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
};

const sanitizeName = (name: string) => name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");

export const uploadReportPdf = async (file: File) => {
  const fileName = `${crypto.randomUUID()}-${sanitizeName(file.name)}`;
  const filePath = `reports/${fileName}`;
  const { error } = await supabase.storage
    .from(REPORT_BUCKET)
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (error) {
    throw error;
  }

  return filePath;
};

export const deleteReportPdf = async (path: string) => {
  if (!path) return;
  const { error } = await supabase.storage.from(REPORT_BUCKET).remove([path]);
  if (error) {
    throw error;
  }
};

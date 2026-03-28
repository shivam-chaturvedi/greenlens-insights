import { supabase } from "./supabaseClient";

export const REPORT_BUCKET = "consulting-reports";
export const REPORT_CATEGORIES = [
  "HVAC",
  "Lighting",
  "Electricity",
  "Water",
  "Appliances",
  "Windows/Ventilation",
  "Other",
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export const CATEGORY_COLOR_MAP: Record<ReportCategory, string> = {
  HVAC: "#22c55e",
  Lighting: "#f97316",
  Electricity: "#6366f1",
  Water: "#0ea5e9",
  Appliances: "#fbbf24",
  "Windows/Ventilation": "#38bdf8",
  Other: "#a855f7",
};

export type ConsultingReportRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | string[] | null;
  savings: number | string | null;
  pdf_bucket: string | null;
  pdf_path: string | null;
  summary: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
  category_savings: Record<string, number> | null;
};

export type ConsultingReport = {
  id: string;
  title: string;
  description: string;
  categories: ReportCategory[];
  savings: number;
  pdfBucket: string;
  pdfPath: string;
  summary: string;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
  categorySavings: Record<ReportCategory, number>;
};

const coerceCategories = (values: string | string[] | null | undefined): ReportCategory[] => {
  const list = Array.isArray(values) ? values : values ? [values] : [];
  if (!list.length) {
    return ["Other"];
  }

  const normalized: ReportCategory[] = list
    .map((value) => (REPORT_CATEGORIES.includes(value as ReportCategory) ? (value as ReportCategory) : null))
    .filter((value): value is ReportCategory => value !== null);

  const uniqueCategories = Array.from(new Set(normalized));
  return uniqueCategories.length ? uniqueCategories : ["Other"];
};

const normalizeCategorySavings = (
  values: Record<string, number> | null | undefined,
): Record<ReportCategory, number> =>
  REPORT_CATEGORIES.reduce((acc, category) => {
    const rawValue = values?.[category];
    const parsed =
      typeof rawValue === "string" ? Number(rawValue) : rawValue ?? 0;
    acc[category] = Number.isFinite(parsed) ? parsed : 0;
    return acc;
  }, {} as Record<ReportCategory, number>);

export const getReportPublicUrl = (path: string) => {
  if (!path) return "";
  return supabase.storage.from(REPORT_BUCKET).getPublicUrl(path).data.publicUrl ?? "";
};

export const fetchConsultingReports = async (): Promise<ConsultingReport[]> => {
  const { data, error } = await supabase
    .from<ConsultingReportRow>("consulting_reports")
    .select(
      "id, title, description, category, savings, pdf_bucket, pdf_path, summary, uploaded_by, created_at, updated_at, category_savings",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => {
    const categorySavings = normalizeCategorySavings(row.category_savings);
    const rawTotal =
      typeof row.savings === "string"
        ? Number(row.savings)
        : row.savings ?? Object.values(categorySavings).reduce((sum, value) => sum + value, 0);

    return {
      id: row.id,
      title: row.title,
      description: row.description ?? "",
      categories: coerceCategories(row.category),
      savings: Number.isNaN(rawTotal) ? 0 : rawTotal,
      pdfBucket: row.pdf_bucket ?? REPORT_BUCKET,
      pdfPath: row.pdf_path ?? "",
      summary: row.summary ?? "",
      uploadedBy: row.uploaded_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      categorySavings,
    };
  });
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

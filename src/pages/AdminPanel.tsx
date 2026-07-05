import { format } from "date-fns";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useDropzone } from "react-dropzone";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { supabase } from "@/lib/supabaseClient";
import {
  CATEGORY_COLOR_MAP,
  ConsultingReport,
  ReportCategory,
  deleteReportPdf,
  fetchConsultingReports,
  getReportPublicUrl,
  REPORT_BUCKET,
  REPORT_CATEGORIES,
  uploadReportPdf,
} from "@/lib/consultingReports";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Edit, Trash2, UploadCloud } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const categories = ["Investigation", "Report", "Analysis", "Feature", "Guide", "Education"];
const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

type AdminArticleRow = {
  id: number;
  title: string;
  category: string | null;
  status: string | null;
  likes_count: number | null;
  comments_count: number | null;
  published_at: string | null;
  article_likes?: { id: number }[];
  article_comments?: { id: number }[];
};

const formatPublishedDate = (value?: string | null) => (value ? format(new Date(value), "MMM d, yyyy") : "—");

const fetchAdminArticles = async () => {
  const { data, error } = await supabase
    .from<AdminArticleRow>("articles")
    .select(
      "id, title, category, status, likes_count, comments_count, published_at, article_likes(id), article_comments(id)",
    )
    .order("published_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((article) => {
    const { article_likes, article_comments, ...rest } = article;
    return {
      ...rest,
      likes_count: article_likes?.length ?? article.likes_count ?? 0,
      comments_count: article_comments?.length ?? article.comments_count ?? 0,
    };
  });
};

const getSignedImageUrl = async (bucket?: string | null, path?: string | null) => {
  if (!bucket || !path) {
    return null;
  }

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  if (error) {
    console.warn("Unable to load preview image", error.message);
    return null;
  }

  return data?.signedUrl ?? null;
};

const createSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

type AdminView = "consulting" | "articles";
const ADMIN_VIEW_OPTIONS: { id: AdminView; label: string }[] = [
  { id: "consulting", label: "Consulting reports" },
  { id: "articles", label: "Journalism articles" },
];

type ConsultingFormState = {
  title: string;
  description: string;
  categories: ReportCategory[];
  categorySavings: Record<ReportCategory, string>;
  summary: string;
};

const buildCategorySavingsInputState = (source?: Record<ReportCategory, number>) =>
  REPORT_CATEGORIES.reduce((acc, category) => {
    const value = source?.[category] ?? 0;
    acc[category] = value > 0 ? value.toString() : "";
    return acc;
  }, {} as Record<ReportCategory, string>);

const ConsultingAdminSection = () => {
  const { session, profileRole, loadingRole } = useSupabaseSession();
  const isAdmin = profileRole === "admin";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    data: reports,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["consultingReports"],
    queryFn: fetchConsultingReports,
    enabled: isAdmin,
    refetchOnWindowFocus: false,
  });

  const [formState, setFormState] = useState<ConsultingFormState>({
    title: "",
    description: "",
    categories: [REPORT_CATEGORIES[0]],
    categorySavings: buildCategorySavingsInputState(),
    summary: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingReport, setEditingReport] = useState<ConsultingReport | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [barCategoryFilter, setBarCategoryFilter] = useState<"all" | ReportCategory>("all");

  const categoryInsights = useMemo(() => {
    const map = REPORT_CATEGORIES.reduce((acc, category) => {
      acc[category] = { count: 0, savings: 0 };
      return acc;
    }, {} as Record<ReportCategory, { count: number; savings: number }>);
    reports?.forEach((report) => {
      REPORT_CATEGORIES.forEach((category) => {
        const entry = map[category];
        if (report.categories.includes(category)) {
          entry.count += 1;
        }
        entry.savings += report.categorySavings[category] ?? 0;
      });
    });
    return map;
  }, [reports]);

  const totalSavings = useMemo(() => {
    if (!reports) return 0;
    return reports.reduce((sum, report) => sum + report.savings, 0);
  }, [reports]);

  const pieData = useMemo(
    () =>
      REPORT_CATEGORIES.map((category) => ({
        name: category,
        value: categoryInsights[category]?.savings ?? 0,
      })),
    [categoryInsights],
  );

  const hasPieData = pieData.some((slice) => slice.value > 0);

  const highlightedReports = useMemo(() => {
    if (!reports) return [];
    return [...reports].sort((a, b) => b.savings - a.savings).slice(0, 3);
  }, [reports]);

  const reportNamesByCategory = useMemo(() => {
    const map = REPORT_CATEGORIES.reduce((acc, category) => {
      acc[category] = [];
      return acc;
    }, {} as Record<ReportCategory, string[]>);
    reports?.forEach((report) => {
      report.categories.forEach((category) => {
        if (map[category].length < 3) {
          map[category].push(report.title);
        }
      });
    });
    return map;
  }, [reports]);

  const barData = useMemo(() => {
    if (!reports) return [];
    return [...reports]
      .map((report) => ({
        id: report.id,
        name: report.title,
        savings:
          barCategoryFilter === "all"
            ? report.savings
            : report.categorySavings[barCategoryFilter] ?? 0,
        categories: report.categories,
      }))
      .sort((a, b) => b.savings - a.savings);
  }, [reports, barCategoryFilter]);

  const displayedBarData = barData.slice(0, 8);

  const totalCategoryInputs = formState.categories.reduce((sum, category) => {
    const raw = Number(formState.categorySavings[category] ?? "0");
    return sum + (Number.isFinite(raw) ? raw : 0);
  }, 0);

  const handleFieldChange = (
    field: keyof Omit<ConsultingFormState, "categories" | "categorySavings">,
    value: string,
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (category: ReportCategory) => {
    setFormState((prev) => {
      const alreadySelected = prev.categories.includes(category);
      if (alreadySelected && prev.categories.length === 1) {
        return prev;
      }
      const categories = alreadySelected
        ? prev.categories.filter((value) => value !== category)
        : [...prev.categories, category];
      return { ...prev, categories };
    });
  };

  const updateCategorySavings = (category: ReportCategory, value: string) => {
    setFormState((prev) => ({
      ...prev,
      categorySavings: {
        ...prev.categorySavings,
        [category]: value,
      },
    }));
  };

  const resetForm = () => {
    setFormState({
      title: "",
      description: "",
      categories: [REPORT_CATEGORIES[0]],
      categorySavings: buildCategorySavingsInputState(),
      summary: "",
    });
    setSelectedFile(null);
    setEditingReport(null);
  };

  const handleStartEdit = (report: ConsultingReport) => {
    setEditingReport(report);
    setFormState({
      title: report.title,
      description: report.description,
      categories: report.categories.length ? report.categories : [REPORT_CATEGORIES[0]],
      categorySavings: buildCategorySavingsInputState(report.categorySavings),
      summary: report.summary,
    });
    setSelectedFile(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAdmin) {
      toast({ title: "Unauthorized", description: "You need to be an admin to save reports." });
      return;
    }

    const trimmedTitle = formState.title.trim();
    if (!trimmedTitle || !formState.description.trim()) {
      toast({ title: "Missing fields", description: "Please provide both a title and description." });
      return;
    }

    if (!formState.categories.length) {
      toast({
        title: "Select a category",
        description: "Pick at least one category and provide an estimate for it.",
      });
      return;
    }

    const missingCategoryValues = formState.categories.some((category) => {
      const raw = formState.categorySavings[category]?.trim();
      return !raw || Number.isNaN(Number(raw));
    });

    if (missingCategoryValues) {
      toast({
        title: "Invalid savings",
        description: "Enter a numeric estimate for each selected category.",
      });
      return;
    }

    const parsedCategorySavings = REPORT_CATEGORIES.reduce((acc, category) => {
      const raw = formState.categorySavings[category]?.trim();
      const numeric = raw ? Number(raw) : 0;
      acc[category] = Number.isFinite(numeric) && numeric >= 0 ? numeric : 0;
      return acc;
    }, {} as Record<ReportCategory, number>);

    const totalEstimatedSavings = formState.categories.reduce(
      (sum, category) => sum + parsedCategorySavings[category],
      0,
    );

    if (totalEstimatedSavings <= 0) {
      toast({
        title: "Zero savings",
        description: "Category estimates must add up to more than zero.",
      });
      return;
    }

    if (!editingReport && !selectedFile) {
      toast({ title: "Upload required", description: "Please upload a PDF for the report." });
      return;
    }

    setIsSaving(true);

    try {
      let pdfPath = editingReport?.pdfPath ?? "";

      if (selectedFile) {
        pdfPath = await uploadReportPdf(selectedFile);
        if (editingReport?.pdfPath && editingReport.pdfPath !== pdfPath) {
          try {
            await deleteReportPdf(editingReport.pdfPath);
          } catch (cleanupError) {
            console.warn("Unable to remove old PDF", cleanupError);
          }
        }
      }

      const payload = {
        title: trimmedTitle,
        description: formState.description.trim(),
        category: formState.categories,
        savings: totalEstimatedSavings,
        category_savings: parsedCategorySavings,
        summary: formState.summary.trim(),
        pdf_path: pdfPath,
        pdf_bucket: REPORT_BUCKET,
        uploaded_by: session?.user.id ?? null,
      };

      if (editingReport) {
        const { error: updateError } = await supabase
          .from("consulting_reports")
          .update(payload)
          .eq("id", editingReport.id);
        if (updateError) throw updateError;
        toast({ title: "Updated", description: "Report updated successfully." });
      } else {
        const { error: insertError } = await supabase.from("consulting_reports").insert(payload);
        if (insertError) throw insertError;
        toast({ title: "Saved", description: "New report uploaded." });
      }

      resetForm();
      queryClient.invalidateQueries({ queryKey: ["consultingReports"] });
    } catch (mutationError) {
      toast({
        title: "Unable to save",
        description: mutationError instanceof Error ? mutationError.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (report: ConsultingReport) => {
    if (!isAdmin) return;
    if (!window.confirm(`Delete "${report.title}" permanently?`)) {
      return;
    }

    setDeleteLoadingId(report.id);
    try {
      const { error: deleteError } = await supabase.from("consulting_reports").delete().eq("id", report.id);
      if (deleteError) throw deleteError;
      if (report.pdfPath) {
        await deleteReportPdf(report.pdfPath);
      }
      toast({ title: "Deleted", description: "Report removed." });
      if (editingReport?.id === report.id) {
        resetForm();
      }
      queryClient.invalidateQueries({ queryKey: ["consultingReports"] });
    } catch (deleteError) {
      toast({
        title: "Delete failed",
        description: deleteError instanceof Error ? deleteError.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const accessContent = () => {
    if (loadingRole) {
      return (
        <div className="rounded-3xl border border-border bg-muted p-6 text-sm text-muted-foreground">
          Verifying admin access...
        </div>
      );
    }

    if (!session || !isAdmin) {
      return (
        <div className="rounded-3xl border border-border bg-card p-8 text-center space-y-4">
          <p className="text-xl font-semibold">Admin access required</p>
          <p className="text-sm text-muted-foreground">
            You must sign in with an admin account to manage consulting reports.
          </p>
          <Link
            to="/auth?mode=login"
            className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em]"
          >
            Sign in
          </Link>
        </div>
      );
    }

    const topCategory =
      Object.entries(categoryInsights).sort((a, b) => b[1].count - a[1].count)[0]?.[0] ?? "—";
    const barFill = barCategoryFilter === "all" ? "#6366f1" : CATEGORY_COLOR_MAP[barCategoryFilter];

    return (
      <div className="space-y-8">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Businesses helped</p>
            <p className="text-3xl font-bold mt-2">{reports ? reports.length : "—"}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Total savings</p>
            <p className="text-3xl font-bold mt-2">{currencyFormatter.format(totalSavings)}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Top category</p>
            <p className="text-2xl font-semibold mt-2">{topCategory}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {REPORT_CATEGORIES.map((category) => (
            <div key={category} className="rounded-3xl border border-border bg-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{category}</p>
                <span className="text-[11px] text-muted-foreground">
                  {categoryInsights[category]?.count ?? 0} reports
                </span>
              </div>
              <p className="text-2xl font-semibold">
                {currencyFormatter.format(categoryInsights[category]?.savings ?? 0)}
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                {reportNamesByCategory[category]?.length ? (
                  reportNamesByCategory[category].map((title) => (
                    <span key={`${category}-${title}`} className="rounded-full border border-border px-2 py-1">
                      {title}
                    </span>
                  ))
                ) : (
                  <span className="uppercase tracking-[0.3em] text-[11px] text-muted-foreground">
                    No reports yet
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Solution breakdown</p>
                <h2 className="font-display text-lg font-semibold">Category savings</h2>
              </div>
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Savings</span>
            </div>
            <div className="h-48">
              {hasPieData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                      }}
                      formatter={(value: number) => currencyFormatter.format(value)}
                      labelFormatter={(name) => `${name}`}
                    />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="55%"
                      outerRadius="100%"
                      paddingAngle={4}
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={CATEGORY_COLOR_MAP[entry.name as keyof typeof CATEGORY_COLOR_MAP]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No savings yet.</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Featured reports:</span>
              {highlightedReports.length ? (
                highlightedReports.map((report) => (
                  <span key={report.id} className="rounded-full border border-border px-2 py-1">
                    {report.title}
                  </span>
                ))
              ) : (
                <span>No reports yet</span>
              )}
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Reports overview</p>
                <h2 className="font-display text-lg font-semibold">Per-report savings</h2>
              </div>
              <select
                value={barCategoryFilter}
                onChange={(event) => setBarCategoryFilter(event.target.value as "all" | ReportCategory)}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]"
              >
                <option value="all">All categories</option>
                {REPORT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-muted-foreground">
              Showing {displayedBarData.length} reports by {barCategoryFilter === "all" ? "overall" : barCategoryFilter.toLowerCase()} savings.
            </div>
            <div className="h-64">
              {displayedBarData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayedBarData} margin={{ top: 10, right: 16, bottom: 30, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tickFormatter={(value) => currencyFormatter.format(value)} />
                    <Tooltip
                      formatter={(value: number) => currencyFormatter.format(value)}
                      labelFormatter={(label) => label}
                    />
                    <Bar dataKey="savings" fill={barFill ?? "#6366f1"} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No data yet to populate the bar chart.</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              {displayedBarData.slice(0, 3).map((report) => (
                <span key={report.id} className="rounded-full border border-border px-2 py-1">
                  {report.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="text-sm font-medium tracking-widest text-muted-foreground">Admin · Consulting Reports</p>
        <h1 className="font-display text-4xl font-bold">Consulting Admin Console</h1>
        <p className="text-muted-foreground max-w-2xl">
          Add, update, or remove consulting reports and keep analytics in sync with Supabase storage and metadata.
        </p>
      </div>

      {accessContent()}

      {isAdmin && (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[420px_1fr]">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">
                {editingReport ? "Update report" : "Upload new report"}
              </h2>
              <Button variant="ghost" size="sm" onClick={resetForm} disabled={isSaving}>
                <UploadCloud className="w-4 h-4" />
                Reset
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Title</label>
              <Input
                value={formState.title}
                onChange={(event) => handleFieldChange("title", event.target.value)}
                placeholder="Business or project name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Description</label>
              <Textarea
                value={formState.description}
                onChange={(event) => handleFieldChange("description", event.target.value)}
                placeholder="Brief overview of the engagement"
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Categories & savings</p>
              <div className="grid gap-3 md:grid-cols-2">
                {REPORT_CATEGORIES.map((category) => {
                  const selected = formState.categories.includes(category);
                  return (
                    <label
                      key={category}
                      className={`flex flex-col rounded-2xl border bg-muted/10 p-3 transition ${
                        selected ? "border-foreground/60 bg-muted/60" : "border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{category}</span>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleCategory(category)}
                          className="h-4 w-4 accent-foreground"
                        />
                      </div>
                      {selected && (
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={formState.categorySavings[category]}
                          onChange={(event) => updateCategorySavings(category, event.target.value)}
                          placeholder="0"
                          className="mt-3 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm focus-visible:outline focus-visible:outline-primary"
                        />
                      )}
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Total estimated savings: <span className="font-semibold">{currencyFormatter.format(totalCategoryInputs)}</span>
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Summary</label>
              <Textarea
                value={formState.summary}
                onChange={(event) => handleFieldChange("summary", event.target.value)}
                placeholder="Optional highlight or executive summary"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">PDF upload</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                {selectedFile
                  ? selectedFile.name
                  : editingReport
                  ? editingReport.pdfPath.split("/").pop() ?? "Current PDF"
                  : "Select a PDF file"}
              </p>
            </div>
            <div className="flex justify-between gap-3">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : editingReport ? "Update report" : "Save report"}
              </Button>
              {editingReport && (
                <Button variant="outline" type="button" onClick={resetForm} disabled={isSaving}>
                  Cancel edit
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Files are stored in <span className="font-semibold">{REPORT_BUCKET}</span> bucket.
            </p>
          </form>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Report inventory</p>
                <h2 className="font-display text-2xl font-semibold">Active entries</h2>
              </div>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["consultingReports"] })} variant="ghost">
                Refresh list
              </Button>
            </div>

            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <AdminReportSkeleton key={i} />)}
              </div>
            )}
            {isError && (
              <div className="rounded-3xl border border-destructive/70 bg-destructive/10 p-6 text-sm text-destructive">
                {error instanceof Error ? error.message : "Unable to load reports"}
              </div>
            )}
            {!isLoading && reports && reports.length === 0 && (
              <div className="rounded-3xl border border-border bg-muted p-6 text-sm text-muted-foreground">
                No reports yet. Upload your first consulting analysis.
              </div>
            )}

            {reports && (
              <div className="space-y-4">
                {reports.map((report) => {
                  const pdfUrl = getReportPublicUrl(report.pdfPath);
                  return (
                    <div key={report.id} className="rounded-3xl border border-border bg-card p-5 space-y-3">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                            {report.categories.length ? report.categories.join(", ") : "Other"}
                          </p>
                          <h3 className="text-xl font-semibold text-foreground">{report.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            Uploaded {format(new Date(report.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Savings</p>
                          <p className="text-2xl font-semibold text-foreground">
                            {currencyFormatter.format(report.savings)}
                          </p>
                          <p className="text-xs text-muted-foreground">{report.summary && "Summary provided"}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{report.description}</p>
                      <div className="grid gap-2 md:grid-cols-3">
                        {report.categories.map((category) => (
                          <div
                            key={`${report.id}-${category}`}
                            className="rounded-2xl border border-border bg-muted/10 px-3 py-2 text-xs"
                          >
                            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">{category}</p>
                            <p className="text-sm font-semibold text-foreground">
                              {currencyFormatter.format(report.categorySavings[category] ?? 0)}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {pdfUrl && (
                          <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-foreground hover:border-foreground"
                          >
                            View PDF
                          </a>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleStartEdit(report)}>
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={deleteLoadingId === report.id}
                          onClick={() => handleDelete(report)}
                        >
                          <Trash2 className="w-4 h-4" />
                          {deleteLoadingId === report.id ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
const ArticlesAdminSection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [status, setStatus] = useState(statusOptions[0].value);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [remotePreviewUrl, setRemotePreviewUrl] = useState<string | null>(null);
  const [remoteImagePath, setRemoteImagePath] = useState<string | null>(null);
  const [remoteImageBucket, setRemoteImageBucket] = useState<string | null>(null);
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [isModalLoadingArticle, setIsModalLoadingArticle] = useState(false);
  const [existingPublishedAt, setExistingPublishedAt] = useState<string | null>(null);

  const tagList = useMemo(() => tags, [tags]);

  const addTagFromInput = useCallback(() => {
    const trimmed = tagInput.trim();
    if (!trimmed) {
      return;
    }

    setTags((previous) => (previous.includes(trimmed) ? previous : [...previous, trimmed]));
    setTagInput("");
  }, [tagInput]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    setSelectedImage(acceptedFiles[0]);
    setRemoteImagePath(null);
    setRemoteImageBucket(null);
    setRemotePreviewUrl(null);
  }, []);

  useEffect(() => {
    if (!selectedImage) {
      setLocalPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedImage);
    setLocalPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/*": [],
    },
  });

  const previewImageUrl = localPreviewUrl ?? remotePreviewUrl;

  const resetForm = () => {
    setTitle("");
    setSummary("");
    setCategory(categories[0]);
    setStatus(statusOptions[0].value);
    setContent("");
    setTags([]);
    setTagInput("");
    setSelectedImage(null);
    setLocalPreviewUrl(null);
    setRemotePreviewUrl(null);
    setRemoteImagePath(null);
    setRemoteImageBucket(null);
    setExistingPublishedAt(null);
  };

  const openCreateModal = () => {
    resetForm();
    setEditingArticleId(null);
    setIsModalLoadingArticle(false);
    setExistingPublishedAt(null);
    setIsModalOpen(true);
  };

  const handleEditArticle = async (articleId: number) => {
    resetForm();
    setEditingArticleId(articleId);
    setIsModalLoadingArticle(true);
    setIsModalOpen(true);

    const { data, error } = await supabase
      .from("articles")
      .select(
        "title, summary, content, category, status, tags, featured_image_path, featured_image_bucket, published_at",
      )
      .eq("id", articleId)
      .maybeSingle();

    setIsModalLoadingArticle(false);

    if (error || !data) {
      toast({
        title: "Unable to load article",
        description: error?.message ?? "Please try again later.",
      });
      setIsModalOpen(false);
      setEditingArticleId(null);
      return;
    }

    setTitle(data.title);
    setSummary(data.summary ?? "");
    setContent(data.content ?? "");
    setCategory(data.category ?? categories[0]);
    setStatus(
      statusOptions.some((option) => option.value === data.status)
        ? data.status ?? statusOptions[0].value
        : statusOptions[0].value,
    );
    setTags(data.tags ?? []);
    setTagInput("");
    setSelectedImage(null);
    setRemoteImagePath(data.featured_image_path ?? null);
    setRemoteImageBucket(data.featured_image_bucket ?? null);
    setExistingPublishedAt(data.published_at ?? null);

    if (data.featured_image_bucket && data.featured_image_path) {
      const signedUrl = await getSignedImageUrl(data.featured_image_bucket, data.featured_image_path);
      setRemotePreviewUrl(signedUrl);
    } else {
      setRemotePreviewUrl(null);
    }
  };

  const handleDeleteArticle = async (articleId: number) => {
    if (!window.confirm("Are you sure you want to delete this article?")) {
      return;
    }

    const { error } = await supabase.from("articles").delete().eq("id", articleId);
    if (error) {
      toast({
        title: "Unable to delete article",
        description: error.message ?? "Try again later.",
      });
      return;
    }

    toast({
      title: "Article deleted",
      description: "The article was removed from the feed.",
    });
    queryClient.invalidateQueries({ queryKey: ["adminArticles"] });
  };

  const handleCreateArticle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle || !trimmedContent) {
      toast({
        title: "Missing required fields",
        description: "Please provide both a title and the article content.",
      });
      return;
    }

    setIsSaving(true);
    const tagsArray = tags;

    let featuredImagePath: string | null = null;
    const bucketName = "journalism-article-images";

    if (selectedImage) {
      const safeName = `${Date.now()}-${selectedImage.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(safeName, selectedImage, { upsert: true });

      if (uploadError) {
        toast({
          title: "Image upload failed",
          description: uploadError.message ?? "Try again with a different file.",
        });
        setIsSaving(false);
        return;
      }

      featuredImagePath = safeName;
    }

    if (!featuredImagePath && remoteImagePath) {
      featuredImagePath = remoteImagePath;
    }

    const finalBucketName = featuredImagePath ? remoteImageBucket ?? bucketName : null;

    const payload = {
      title: trimmedTitle,
      slug: createSlug(trimmedTitle),
      summary: summary.trim() || null,
      content: trimmedContent,
      category,
      status,
      author_name: "Admin",
      read_time: null,
      tags: tagsArray,
      published_at: status === "published" ? existingPublishedAt ?? new Date().toISOString() : null,
      featured_image_path: featuredImagePath,
      featured_image_bucket: featuredImagePath ? finalBucketName : null,
    };

    const executor = editingArticleId
      ? () => supabase.from("articles").update(payload).eq("id", editingArticleId)
      : () => supabase.from("articles").insert([payload]);

    const { error } = await executor();
    setIsSaving(false);

    if (error) {
      toast({
        title: "Unable to save article",
        description: error.message ?? "Try again in a moment.",
      });
      return;
    }

    toast({
      title: editingArticleId ? "Article updated" : "Draft created",
      description: editingArticleId
        ? "Your changes have been saved."
        : "The new article is now in the feed.",
    });
    resetForm();
    setEditingArticleId(null);
    setIsModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ["adminArticles"] });
  };

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["adminArticles"],
    queryFn: fetchAdminArticles,
    onError: (error) => {
      toast({
        title: "Unable to load articles",
        description: error.message ?? "Please try again later.",
      });
    },
  });

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Admin panel</p>
            <h1 className="mt-1 text-3xl font-semibold text-foreground">Journalism dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Trusted admins can review every published story stored in the articles table. All counts, statuses, and metadata surface directly from the same source of truth.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="btn-squared-primary px-4 py-2 text-xs font-semibold"
            >
              Create article
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-background p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Published feed</p>
            <h2 className="text-2xl font-semibold text-foreground">Articles created by admins</h2>
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{articles.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <tr>
                <th className="px-3 py-3 text-left">Title</th>
                <th className="px-3 py-3 text-left">Category</th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-3 py-3 text-left">Likes</th>
                <th className="px-3 py-3 text-left">Comments</th>
                <th className="px-3 py-3 text-left">Published</th>
                <th className="px-3 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-muted/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                    Loading articles...
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                    No articles found. Create a story above to have it appear here once published.
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.id} className="hover:bg-background">
                    <td className="px-3 py-4 font-semibold text-foreground max-w-xs truncate">{article.title}</td>
                    <td className="px-3 py-4 text-muted-foreground">{article.category}</td>
                    <td className="px-3 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      {article.status}
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">{article.likes_count ?? 0}</td>
                    <td className="px-3 py-4 text-muted-foreground">{article.comments_count ?? 0}</td>
                    <td className="px-3 py-4 text-muted-foreground">{formatPublishedDate(article.published_at)}</td>
                    <td className="px-3 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditArticle(article.id)}
                          className="text-xs font-semibold text-primary"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteArticle(article.id)}
                          className="text-xs font-semibold text-destructive"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 py-6">
        <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl border border-border bg-background shadow-2xl">
          <div className="px-6 py-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                    {editingArticleId ? "Update article" : "New article"}
                  </p>
                  <h3 className="text-xl font-semibold text-foreground">
                    {editingArticleId ? "Edit story" : "Compose a story"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setEditingArticleId(null);
                    setIsModalOpen(false);
                    setIsModalLoadingArticle(false);
                  }}
                  className="text-sm font-semibold text-muted-foreground hover:text-foreground transition"
                >
                  Close
                </button>
              </div>
              {isModalLoadingArticle ? (
                <div className="space-y-4 py-6">
                  <Skeleton className="h-10 w-3/4" />
                  <Skeleton className="h-4 w-1/4 mb-8" />
                  <Skeleton className="w-full aspect-video rounded-xl mb-4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ) : (
                <form onSubmit={handleCreateArticle} className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      Title
                      <input
                        required
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Headline for the article"
                        className="mt-2 w-full rounded-2xl border border-border bg-muted/10 px-4 py-3 text-sm text-foreground focus:outline-none focus-visible:outline focus-visible:outline-primary"
                      />
                    </label>
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      Category
                      <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-border bg-muted/10 px-4 py-3 text-sm text-foreground focus:outline-none focus-visible:outline focus-visible:outline-primary"
                      >
                        {categories.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      Status
                      <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-border bg-muted/10 px-4 py-3 text-sm text-foreground focus:outline-none focus-visible:outline focus-visible:outline-primary"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      Tags
                      <input
                        value={tagInput}
                        onChange={(event) => setTagInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addTagFromInput();
                          }
                        }}
                        placeholder="press enter to add tag"
                        className="mt-2 w-full rounded-2xl border border-border bg-muted/10 px-4 py-3 text-sm text-foreground focus:outline-none focus-visible:outline focus-visible:outline-primary"
                      />
                      {tagList.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                          {tagList.map((tag) => (
                            <span key={tag} className="group flex items-center gap-1 rounded-full border border-border px-3 py-1">
                              {tag}
                              <button
                                type="button"
                                onClick={() => setTags((previous) => previous.filter((existing) => existing !== tag))}
                                className="text-[11px] font-semibold text-destructive transition opacity-0 group-hover:opacity-100"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </label>
                  </div>
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Summary
                    <textarea
                      value={summary}
                      onChange={(event) => setSummary(event.target.value)}
                      rows={3}
                      placeholder="Short hook for the feed"
                      className="mt-2 w-full rounded-2xl border border-border bg-muted/10 px-4 py-3 text-sm text-foreground focus:outline-none focus-visible:outline focus-visible:outline-primary"
                    />
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Content
                    <div className="mt-2 rounded-2xl border border-border bg-muted/10">
                      <ReactQuill value={content} onChange={setContent} className="rounded-2xl" />
                    </div>
                  </label>
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      <span className="w-3 h-3 rounded-full bg-foreground" />
                      Hero image
                    </div>
                    <div
                      {...getRootProps()}
                      className="mt-2 flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/5 px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      <input {...getInputProps()} />
                      <p>{isDragActive ? "Drop the image here" : "Drag files here or click to browse"}</p>
                      <p className="text-[11px] text-muted-foreground">JPEG, PNG, or WEBP up to 15MB</p>
                      {previewImageUrl && (
                        <figure className="mt-4 w-full overflow-hidden rounded-2xl">
                          <img src={previewImageUrl} alt="Preview" className="h-40 w-full object-cover" />
                        </figure>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="btn-squared-primary px-4 py-2 text-sm font-semibold"
                    >
                      {isSaving ? "Saving..." : editingArticleId ? "Save changes" : "Save draft"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setEditingArticleId(null);
                        setIsModalOpen(false);
                        setIsModalLoadingArticle(false);
                      }}
                      className="text-sm font-semibold text-muted-foreground hover:text-foreground transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const AdminReportSkeleton = () => (
  <div className="rounded-3xl border border-border bg-card p-6 flex justify-between items-center space-y-0">
    <div className="space-y-2">
      <Skeleton className="h-5 w-[200px]" />
      <Skeleton className="h-4 w-[150px]" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
);

const AdminArticleSkeleton = () => (
  <div className="rounded-3xl border border-border bg-card p-6 flex justify-between items-center space-y-0">
    <div className="space-y-2 flex-1">
      <Skeleton className="h-5 w-[250px]" />
      <Skeleton className="h-4 w-[180px]" />
      <Skeleton className="h-3 w-[100px] mt-2" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
);

const AdminPanel = () => {
  const [activeView, setActiveView] = useState<AdminView>("consulting");

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <main className="pt-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-wrap gap-3">
            {ADMIN_VIEW_OPTIONS.map((option) => (
              <Button
                key={option.id}
                size="sm"
                variant={activeView === option.id ? "default" : "outline"}
                onClick={() => setActiveView(option.id)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          {activeView === "consulting" ? <ConsultingAdminSection /> : <ArticlesAdminSection />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPanel;

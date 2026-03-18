import { format } from "date-fns";
import { useMemo, useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import {
  CATEGORY_COLOR_MAP,
  fetchConsultingReports,
  getReportPublicUrl,
  REPORT_CATEGORIES,
  ConsultingReport,
} from "@/lib/consultingReports";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const REPORTS_PER_PAGE = 6;
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "highest", label: "Highest savings" },
  { value: "lowest", label: "Lowest savings" },
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const Consulting = () => {
  const {
    data: reports,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["consultingReports"],
    queryFn: fetchConsultingReports,
    refetchOnWindowFocus: false,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0].value);
  const [currentPage, setCurrentPage] = useState(1);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredReports = useMemo(() => {
    if (!reports) return [];

    return [...reports]
      .filter((report) => {
        const matchesCategory = categoryFilter === "All" || report.category === categoryFilter;
        const matchesSearch = !normalizedSearch
          ? true
          : [report.title, report.description, report.summary].some((value) =>
              value?.toLowerCase().includes(normalizedSearch),
            );
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case "oldest":
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case "highest":
            return b.savings - a.savings;
          case "lowest":
            return a.savings - b.savings;
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [reports, categoryFilter, normalizedSearch, sortOption]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / REPORTS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((prev) => (prev > totalPages ? totalPages : prev));
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, searchTerm]);

  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * REPORTS_PER_PAGE;
    return filteredReports.slice(start, start + REPORTS_PER_PAGE);
  }, [filteredReports, currentPage]);

  const totalSavings = useMemo(() => {
    if (!reports) return 0;
    return reports.reduce((acc, report) => acc + report.savings, 0);
  }, [reports]);

  const categoryInsights = useMemo(() => {
    const map: Record<string, { count: number; savings: number }> = {};
    REPORT_CATEGORIES.forEach((category) => {
      map[category] = { count: 0, savings: 0 };
    });
    reports?.forEach((report) => {
      const entry = map[report.category];
      entry.count += 1;
      entry.savings += report.savings;
    });
    return map;
  }, [reports]);

  const pieData = useMemo(() => {
    return REPORT_CATEGORIES.map((category) => ({
      name: category,
      value: categoryInsights[category]?.savings ?? 0,
    }));
  }, [categoryInsights]);

  const hasPieData = pieData.some((slice) => slice.value > 0);

  const mostCommonCategory = useMemo(() => {
    const entries = Object.entries(categoryInsights);
    if (!entries.length) return "—";
    entries.sort((a, b) => b[1].count - a[1].count);
    const [category] = entries[0];
    return category;
  }, [categoryInsights]);

  const highestSavingsReport = useMemo(() => {
    if (!reports || !reports.length) return null;
    return reports.reduce((best, report) => (report.savings > (best?.savings ?? 0) ? report : best), null as ConsultingReport | null);
  }, [reports]);

  const loadingState = (
    <div className="space-y-4">
      {[...Array(REPORTS_PER_PAGE)].map((_, index) => (
        <div key={index} className="animate-pulse rounded-2xl bg-muted p-6" />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <Navbar />
      <main className="pt-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 space-y-2">
            <p className="text-sm font-medium tracking-widest text-muted-foreground">CONSULTING</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold">Consulting Reports</h1>
            <p className="text-muted-foreground max-w-2xl">
              Insights, savings estimates, and audited proof points for organizations GreenLens has helped optimize.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
            <aside className="space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Businesses Helped</p>
                <p className="text-4xl font-bold">{reports ? reports.length : "—"}</p>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Total Savings Proposed</p>
                  <p className="text-2xl font-semibold text-foreground">{currencyFormatter.format(totalSavings)}</p>
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-card p-6 space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">Solution Breakdown</h2>
                  <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Savings</span>
                </div>
                <div className="h-48">
                  {hasPieData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          contentStyle={{
                            borderRadius: 14,
                            backgroundColor: "var(--card)",
                            borderColor: "var(--border)",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
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
                            <Cell key={entry.name} fill={CATEGORY_COLOR_MAP[entry.name as keyof typeof CATEGORY_COLOR_MAP]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground">No data yet. Upload reports to populate the breakdown.</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  {REPORT_CATEGORIES.map((category) => (
                    <div key={category} className="space-y-1">
                      <div className="h-1 w-full rounded-full" style={{ background: CATEGORY_COLOR_MAP[category] }} />
                      <p className="font-semibold text-foreground">{categoryInsights[category]?.count ?? 0} reports</p>
                      <p>{currencyFormatter.format(categoryInsights[category]?.savings ?? 0)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-card p-6 space-y-3">
                <h2 className="font-display text-lg font-semibold">Quick Insights</h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <span className="text-foreground font-semibold">Most common category:</span> {mostCommonCategory}
                  </p>
                  <p>
                    <span className="text-foreground font-semibold">Highest savings report:</span>{" "}
                    {highestSavingsReport ? highestSavingsReport.title : "—"}
                  </p>
                </div>
              </div>
            </aside>
            <section className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Search</label>
                  <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2">
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Search by project, business, or category"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="border-0 bg-transparent px-0 focus-visible:ring-0"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="All">All categories</option>
                    {REPORT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Sort</label>
                  <select
                    value={sortOption}
                    onChange={(event) => setSortOption(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isLoading && loadingState}
              {isError && (
                <div className="rounded-3xl border border-destructive/70 bg-destructive/10 p-6 text-sm text-destructive">
                  {error instanceof Error ? error.message : "Unable to load reports"}
                </div>
              )}
              {!isLoading && !filteredReports.length && (
                <div className="rounded-3xl border border-border bg-muted p-6 text-center text-muted-foreground">
                  No reports match your filters yet. Check back after new data is uploaded.
                </div>
              )}

              <div className="space-y-6">
                {paginatedReports.map((report) => {
                  const pdfUrl = getReportPublicUrl(report.pdfPath);
                  return (
                    <article key={report.id} className="rounded-3xl border border-border bg-card p-6 shadow-lg">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{report.category}</p>
                          <h3 className="font-display text-2xl font-semibold">{report.title}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Estimated savings</p>
                          <p className="text-2xl font-semibold text-foreground">
                            {currencyFormatter.format(report.savings)}
                          </p>
                          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                            {format(new Date(report.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                        {report.description}
                      </p>

                      {report.summary && (
                        <details className="mt-4 space-y-2 rounded-2xl border border-border bg-muted p-4 text-sm text-muted-foreground">
                          <summary className="font-semibold text-foreground">Summary</summary>
                          <p className="whitespace-pre-line">{report.summary}</p>
                        </details>
                      )}

                      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                        {pdfUrl ? (
                          <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-border px-4 py-2 font-semibold tracking-wide text-xs uppercase text-foreground transition hover:border-foreground"
                          >
                            View PDF
                          </a>
                        ) : (
                          <span className="text-xs font-semibold text-muted-foreground">No PDF yet</span>
                        )}
                        {pdfUrl && (
                          <a
                            href={pdfUrl}
                            download
                            className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
                          >
                            Download
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              {filteredReports.length > REPORTS_PER_PAGE && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card px-4 py-3 text-sm">
                  <div>
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="rounded-full" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button size="sm" className="rounded-full" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Consulting;

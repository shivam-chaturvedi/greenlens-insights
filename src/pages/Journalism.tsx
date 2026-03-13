import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowUpRight, FileText, MessageSquare, Search, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

const placeholderImage = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80";

type RawArticle = {
  id: number;
  title: string;
  summary: string | null;
  category: string | null;
  author_name: string | null;
  read_time: string | null;
  published_at: string | null;
  featured_image_path: string | null;
  featured_image_bucket: string | null;
  likes_count: number | null;
  comments_count: number | null;
  slug: string;
};

type JournalismArticle = RawArticle & {
  imageUrl: string | null;
};

type RawArticleWithRelations = RawArticle & {
  article_likes?: { id: number }[];
  article_comments?: { id: number }[];
};

const resolveArticleImage = async (bucket?: string | null, path?: string | null) => {
  if (!bucket || !path) {
    return null;
  }

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  if (error) {
    console.warn("Unable to load article image", error.message);
    return null;
  }

  return data?.signedUrl ?? null;
};

const fetchPublishedArticles = async () => {
  const { data, error } = await supabase
    .from<RawArticleWithRelations>("articles")
    .select(
      "id, slug, title, summary, category, author_name, read_time, published_at, featured_image_path, featured_image_bucket, likes_count, comments_count, article_likes(id), article_comments(id)",
    )
    .ilike("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const articlesWithImages: JournalismArticle[] = await Promise.all(
    rows.map(async (article) => {
      const { article_likes, article_comments, ...rest } = article;
      return {
        ...rest,
        likes_count: article_likes?.length ?? article.likes_count ?? 0,
        comments_count: article_comments?.length ?? article.comments_count ?? 0,
        imageUrl: await resolveArticleImage(article.featured_image_bucket, article.featured_image_path),
      };
    }),
  );

  return articlesWithImages;
};

const formatPublishedDate = (value?: string | null) => (value ? format(new Date(value), "MMMM d, yyyy") : "—");

const Journalism = () => {
  const { toast } = useToast();
  const { data: articles = [], isLoading } = useQuery<JournalismArticle[]>({
    queryKey: ["publishedArticles"],
    queryFn: fetchPublishedArticles,
    staleTime: 1000 * 60,
    onError: (error) => {
      toast({
        title: "Unable to load the journalism feed",
        description: error.message ?? "Please try again later.",
      });
    },
  });

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    if (!articles.length) {
      return ["All"];
    }

    const uniqueCategories = Array.from(
      new Set(articles.map((article) => article.category ?? "").filter(Boolean)),
    );

    return ["All", ...uniqueCategories];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesCategory = activeCategory === "All" || article.category === activeCategory;
      if (!matchesCategory) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = `${article.title} ${article.summary ?? ""} ${article.author_name ?? ""}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [articles, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-medium tracking-widest text-muted-foreground mb-4">
            GREEN JOURNALISM HUB
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            Data-backed <span className="highlight-box">stories</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mb-8">
            Transforming complex emission data into compelling narratives that drive transparency and accountability.
          </p>

          <div className="flex flex-wrap gap-8 pt-8 border-t border-border">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="font-display text-2xl font-bold">{articles.length}</p>
                <p className="text-xs text-muted-foreground">Published Articles</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 text-xs font-medium tracking-wide transition-colors ${
                    activeCategory === category
                      ? "bg-foreground text-background"
                      : "bg-muted text-foreground hover:bg-secondary"
                  }`}
                >
                  {category.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="font-display text-3xl font-bold">Latest Articles</h2>
            <p className="text-sm text-muted-foreground">{filteredArticles.length} articles found</p>
          </div>

          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground">Loading articles...</div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No articles match the current filters.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
              {filteredArticles.map((article) => (
                <Link
                  key={article.slug}
                  to={`/journalism/${article.slug}`}
                  className="bg-background group cursor-pointer block"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.imageUrl ?? placeholderImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-medium tracking-widest text-muted-foreground mb-3 block">
                      {(article.category ?? "Uncategorized").toUpperCase()}
                    </span>
                    <h3 className="font-display text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {article.summary ?? "Summary coming soon."}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {article.likes_count ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {article.comments_count ?? 0}
                        </span>
                      </div>
                      <span>
                        {article.read_time ?? "—"} · {formatPublishedDate(article.published_at)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section-padding bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">Have a story to tell?</h2>
          <p className="text-primary-foreground/80 text-lg mb-10">
            We're always looking for data-driven stories about sustainability, greenwashing, and climate accountability. Join our community of environmental storytellers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/about"
              className="px-6 py-3 bg-primary-foreground text-primary font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary-foreground/90 transition-colors"
            >
              Contact Us
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Journalism;

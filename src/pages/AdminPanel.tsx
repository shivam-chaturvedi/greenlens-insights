import { format } from "date-fns";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useDropzone } from "react-dropzone";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

const formatPublishedDate = (value?: string | null) => (value ? format(new Date(value), "MMM d, yyyy") : "—");

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

const AdminPanel = () => {
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
        ? (data.status ?? statusOptions[0].value)
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

  const createSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

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
      published_at:
        status === "published" ? existingPublishedAt ?? new Date().toISOString() : null,
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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-6xl space-y-8 px-6">
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
        </div>
      </main>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 py-6">
          <div className="w-full max-w-3xl max-h-[50vh] overflow-hidden rounded-3xl border border-border bg-background shadow-2xl">
            <div className="h-full overflow-y-auto px-6 py-6">
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
                <div className="py-10 text-center text-muted-foreground">Loading article...</div>
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
      <Footer />
    </div>
  );
};

export default AdminPanel;

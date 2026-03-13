import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Calendar, MessageSquare, Share2, ThumbsUp, User, Bookmark } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";

const placeholderImage = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400&q=80";

type ArticleRecord = {
  id: number;
  title: string;
  summary: string | null;
  content: string;
  category: string | null;
  author_name: string | null;
  published_at: string | null;
  read_time: string | null;
  likes_count: number | null;
  comments_count: number | null;
  featured_image_path: string | null;
  featured_image_bucket: string | null;
};

type ArticleWithImage = ArticleRecord & {
  imageUrl: string | null;
};

type ArticleComment = {
  id: number;
  content: string;
  created_at: string | null;
  user_id: string | null;
  profiles?: {
    full_name?: string | null;
  };
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

const fetchArticleMetrics = async (articleId: number) => {
  const [likesResult, commentsResult] = await Promise.all([
    supabase
      .from("article_likes")
      .select("id", { count: "exact", head: true })
      .eq("article_id", articleId),
    supabase
      .from("article_comments")
      .select("id", { count: "exact", head: true })
      .eq("article_id", articleId),
  ]);

  if (likesResult.error) {
    throw likesResult.error;
  }

  if (commentsResult.error) {
    throw commentsResult.error;
  }

  return {
    likes_count: likesResult.count ?? 0,
    comments_count: commentsResult.count ?? 0,
  };
};

const fetchArticleBySlug = async (articleSlug: string): Promise<ArticleWithImage> => {
  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, title, summary, content, category, author_name, published_at, read_time, featured_image_path, featured_image_bucket, likes_count, comments_count",
    )
    .eq("slug", articleSlug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Article not found");
  }

  const metrics = await fetchArticleMetrics(data.id);

  if (
    metrics.likes_count !== data.likes_count ||
    metrics.comments_count !== data.comments_count
  ) {
    await supabase
      .from("articles")
      .update({
        likes_count: metrics.likes_count,
        comments_count: metrics.comments_count,
      })
      .eq("id", data.id);
  }

  return {
    ...data,
    likes_count: metrics.likes_count,
    comments_count: metrics.comments_count,
    imageUrl: await resolveArticleImage(data.featured_image_bucket, data.featured_image_path),
  } as ArticleWithImage;
};

const fetchArticleComments = async (articleId: number): Promise<ArticleComment[]> => {
  const { data, error } = await supabase
    .from("article_comments")
    .select("id, content, created_at, user_id, profiles(full_name)")
    .eq("article_id", articleId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
};

const formatDate = (value?: string | null) => (value ? format(new Date(value), "MMMM d, yyyy") : "—");

const ArticleDetail = () => {
  const { slug } = useParams();
  const articleSlug = slug ?? "";
  const { toast } = useToast();
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { session } = useSupabaseSession();
  const queryClient = useQueryClient();

  const isValidSlug = Boolean(articleSlug.trim());

  const {
    data: article,
    isLoading: isArticleLoading,
  } = useQuery<ArticleWithImage, Error, ArticleWithImage>({
    queryKey: ["article", articleSlug],
    queryFn: () => fetchArticleBySlug(articleSlug),
    enabled: isValidSlug,
    onError: (error) => {
      toast({ title: "Unable to load article", description: error.message ?? "Try again later." });
    },
  });

  const { data: comments = [], isLoading: areCommentsLoading } = useQuery<ArticleComment[], Error>({
    queryKey: ["articleComments", article?.id],
    queryFn: () => fetchArticleComments(article?.id ?? 0),
    enabled: Boolean(article?.id),
    onError: (error) => {
      toast({ title: "Unable to load comments", description: error.message ?? "Try again later." });
    },
  });

  const {
    data: userLike,
  } = useQuery<{ id: number } | null>({
    queryKey: ["articleLike", article?.id, session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("article_likes")
        .select("id")
        .match({ article_id: article?.id ?? 0, user_id: session?.user?.id ?? "" })
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    },
    enabled: Boolean(article?.id && session?.user?.id),
    staleTime: 0,
  });

  useEffect(() => {
    if (article) {
      setLikes(article.likes_count ?? 0);
    }
  }, [article]);

  useEffect(() => {
    setIsLiked(Boolean(userLike?.id));
  }, [userLike]);

  const commentCount = comments.length > 0 ? comments.length : article?.comments_count ?? 0;
  const isAuthenticated = Boolean(session?.user);
  const requireAuthAction = (message: string) => {
    if (!session) {
      toast({ title: "Sign in required", description: message, variant: "destructive" });
      return false;
    }
    return true;
  };

  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!article) {
        throw new Error("Unable to post comment without the article context.");
      }

      const trimmedComment = commentText.trim();
      if (!trimmedComment) {
        throw new Error("Comment cannot be empty.");
      }

      const { error } = await supabase.from("article_comments").insert({
        article_id: article.id,
        content: trimmedComment,
        user_id: session?.user.id ?? null,
      });

      if (error) {
        throw error;
      }

      const { error: updateError } = await supabase
        .from("articles")
        .update({ comments_count: (article.comments_count ?? 0) + 1 })
        .eq("id", article.id);

      if (updateError) {
        throw updateError;
      }
    },
    onSuccess: () => {
      toast({ title: "Comment posted", description: "Your feedback is live on the story." });
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["articleComments", article?.id] });
      queryClient.invalidateQueries({ queryKey: ["article", articleSlug] });
      queryClient.invalidateQueries({ queryKey: ["publishedArticles"] });
      queryClient.invalidateQueries({ queryKey: ["adminArticles"] });
    },
      onError: (error) => {
        toast({
          title: "Unable to post comment",
          description: (error as Error).message ?? "Please try again.",
        });
      },
    });

  const likeMutation = useMutation({
    mutationFn: async (wasLiked: boolean) => {
      if (!article) {
        throw new Error("Unable to update like without the article context.");
      }
      if (!session?.user?.id) {
        throw new Error("Sign in required to like articles.");
      }

      if (wasLiked) {
        const { error } = await supabase
          .from("article_likes")
          .delete()
          .match({ article_id: article.id, user_id: session.user.id });
        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.from("article_likes").insert({
          article_id: article.id,
          user_id: session.user.id,
        });
        if (error) {
          throw error;
        }
      }

      const { count, error: countError } = await supabase
        .from("article_likes")
        .select("id", { count: "exact", head: true })
        .eq("article_id", article.id);

      if (countError) {
        throw countError;
      }

      const updatedCount = count ?? 0;
      const { error: updateError } = await supabase
        .from("articles")
        .update({ likes_count: updatedCount })
        .eq("id", article.id);

      if (updateError) {
        throw updateError;
      }
    },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["article", articleSlug] });
        queryClient.invalidateQueries({ queryKey: ["articleLike", article?.id, session?.user?.id] });
        queryClient.invalidateQueries({ queryKey: ["publishedArticles"] });
        queryClient.invalidateQueries({ queryKey: ["adminArticles"] });
      },
    onError: (error) => {
      toast({
        title: "Unable to update like",
        description: (error as Error).message ?? "Please try again.",
      });
    },
  });

  const handleCommentSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!requireAuthAction("Sign in to comment on articles.")) {
      return;
    }
    if (!article) {
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    commentMutation.mutate();
  };

  const handleLike = () => {
    if (!requireAuthAction("Sign in to like articles.")) {
      return;
    }

    if (!article) {
      return;
    }

    const previousLiked = isLiked;
    setIsLiked(!previousLiked);
    setLikes((prev) => Math.max(0, prev + (previousLiked ? -1 : 1)));
    likeMutation.mutate(previousLiked);

    if (!previousLiked) {
      toast({ title: "Liked!", description: "You've liked this article." });
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Removed from bookmarks" : "Bookmarked!",
      description: isBookmarked ? "Article removed from your saved list." : "Article saved to your bookmarks.",
    });
  };

  const handleShare = async () => {
    if (!article) {
      return;
    }

    const shareData = {
      title: article.title,
      text: article.summary ?? article.content.substring(0, 100),
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({ title: "Shared!", description: "Article shared successfully." });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied!", description: "Article link has been copied to your clipboard." });
  };

  if (!isValidSlug) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex min-h-[calc(100vh-6rem)] items-center justify-center pt-24 pb-16 px-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Invalid article</h1>
            <Link to="/journalism" className="text-primary hover:underline flex items-center gap-2 justify-center">
              <ArrowLeft className="w-4 h-4" /> Back to Journalism
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isArticleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-20 px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <p className="text-lg font-semibold text-muted-foreground">Loading article...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex min-h-[calc(100vh-6rem)] items-center justify-center pt-24 pb-16 px-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Article not found</h1>
            <Link to="/journalism" className="text-primary hover:underline flex items-center gap-2 justify-center">
              <ArrowLeft className="w-4 h-4" /> Back to Journalism Hub
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <Link to="/journalism" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Journalism Hub
          </Link>

          <div className="mb-12">
            <span className="text-xs font-bold tracking-widest text-primary uppercase mb-4 block">
              {article.category ?? "UNCATEGORIZED"}
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8">
              {article.title}
            </h1>
            <p className="text-base text-muted-foreground max-w-3xl leading-relaxed mb-5">
              {article.summary ?? "The story is coming together—please check back soon."}
            </p>

            <div className="flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-[0.4em] text-muted-foreground mb-6">
              <span className="rounded-full border border-border px-3 py-1 bg-background/80">
                {likes} Likes
              </span>
              <span className="rounded-full border border-border px-3 py-1 bg-background/80">
                {commentCount} Comments
              </span>
              <span className="flex items-center gap-2 rounded-full border border-primary/60 px-3 py-1 text-primary">
                <Share2 className="w-3 h-3" /> Share Article attributes
              </span>
            </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground py-6 border-y border-border">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  {article.author_name ?? "GreenLens Editorial"}
                </div>
                <div className="flex items-center gap-2 underline decoration-primary/20">
                  <Calendar className="w-4 h-4" />
                  {formatDate(article.published_at)}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={handleShare}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-full transition-colors ${
                    isBookmarked ? "bg-primary/20 text-primary" : "hover:bg-muted text-muted-foreground"
                  }`}
                  title="Bookmark"
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-primary" : ""}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="aspect-[21/9] overflow-hidden rounded-lg mb-12 shadow-2xl">
            <img src={article.imageUrl ?? placeholderImage} alt={article.title} className="w-full h-full object-cover" />
          </div>

          <div
            className="prose prose-lg prose-neutral dark:prose-invert max-w-none mb-16"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          <div className="flex items-center justify-between py-8 border-t border-border">
            <div className="flex items-center gap-8">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 transition-colors group ${
                  isLiked ? "text-primary font-bold" : "hover:text-primary text-muted-foreground"
                }`}
              >
                <ThumbsUp className={`w-5 h-5 ${isLiked ? "fill-primary" : "group-hover:fill-primary/10"}`} />
                <span>{likes} Likes</span>
              </button>
              <button
                onClick={() => setShowComments(!showComments)}
                className={`flex items-center gap-2 transition-colors group ${
                  showComments ? "text-primary font-bold" : "hover:text-primary text-muted-foreground"
                }`}
              >
                <MessageSquare className={`w-5 h-5 ${showComments ? "fill-primary/10" : "group-hover:fill-primary/10"}`} />
                <span>{commentCount} Comments</span>
              </button>
            </div>
            <button onClick={handleShare} className="btn-squared-outline text-sm">
              Share Article
            </button>
          </div>

          {showComments && (
            <div className="mt-8 p-8 bg-muted/30 border border-border animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="font-display text-xl font-bold mb-6">Discussion</h3>
              <form onSubmit={handleCommentSubmit} className="space-y-3 mb-6">
                <label className="text-sm font-semibold text-muted-foreground block">
                  <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Add a comment</span>
                  <textarea
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder={isAuthenticated ? "Share your perspective..." : "Sign in to comment."}
                    rows={3}
                    required
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus-visible:outline focus-visible:outline-primary"
                    disabled={commentMutation.isLoading || !isAuthenticated}
                  />
                </label>
                <div className="flex items-center justify-between">
                  {!isAuthenticated && (
                    <p className="text-xs text-destructive">Sign in to participate in the discussion.</p>
                  )}
                  <button
                    type="submit"
                    disabled={!commentText.trim() || commentMutation.isLoading || !isAuthenticated}
                    className="btn-squared-primary text-sm px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {commentMutation.isLoading ? "Posting..." : "Post comment"}
                  </button>
                </div>
              </form>
              {areCommentsLoading ? (
                <p className="text-sm text-muted-foreground">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No comments yet. Check back later or contribute via the community board.</p>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment) => {
                    const author = comment.profiles?.full_name ?? comment.user_id ?? "Contributor";
                    const timeAgo = comment.created_at
                      ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
                      : "";
                    return (
                      <div key={comment.id} className="group">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary uppercase">
                            {author.charAt(0)}
                          </div>
                          <span className="text-sm font-bold">{author}</span>
                          <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
                        </div>
                        <p className="text-sm text-foreground ml-9 leading-relaxed">{comment.content}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArticleDetail;

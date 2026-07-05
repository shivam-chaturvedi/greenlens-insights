import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  MessageSquare,
  ThumbsUp,
  PenLine,
  Plus,
  X,
  Sparkles,
  Link as LinkIcon,
  Edit,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { CATEGORIES, CalculationHistoryItem, SUBTOPICS } from "@/data/community-data";
import type { PostAttachment } from "@/types/post";
import { Skeleton } from "@/components/ui/skeleton";

type PostRow = {
  id: number;
  user_id: string | null;
  title: string;
  content: string;
  category: string;
  upload_type: string | null;
  has_direct_data: boolean | null;
  tags: string[] | null;
  likes: number | null;
  created_at: string | null;
  attachments: PostAttachment[] | null;
};

type CommentRow = {
  id: number;
  post_id: number;
  user_id: string | null;
  content: string;
  created_at: string | null;
};

type CommunityComment = {
  id: number;
  postId: number;
  authorId: string | null;
  author: string;
  role: string;
  content: string;
  createdAt: string;
};

type CommunityPost = {
  id: number;
  userId: string | null;
  title: string;
  content: string;
  category: string;
  uploadType: string;
  hasDirectData: boolean;
  tags: string[] | null;
  likes: number;
  createdAt: string;
  author: string;
  role: string;
  avatar: string;
  attachments: PostAttachment[];
  comments: CommunityComment[];
  userLiked?: boolean;
};


const parseMarkdownBold = (content: string) => {
  if (!content) return "";
  return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};


const PostSkeleton = () => (
  <div className="bg-background border border-border shadow-sm rounded-2xl overflow-hidden p-6 space-y-4">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-3 w-[100px]" />
        </div>
      </div>
    </div>
    <Skeleton className="h-8 w-3/4" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
    <div className="flex gap-4 pt-4 border-t border-border mt-4">
      <Skeleton className="h-4 w-[80px]" />
      <Skeleton className="h-4 w-[80px]" />
      <Skeleton className="h-4 w-[80px]" />
    </div>
  </div>
);

const AttachmentPreview = ({ attachment }: { attachment: PostAttachment }) => {
  const url = supabase.storage.from(attachment.bucket).getPublicUrl(attachment.path).data.publicUrl;
  if (attachment.mime_type.startsWith("image/")) {
    return <img src={url} alt={attachment.name} className="w-full max-h-[400px] object-contain rounded-lg border border-border bg-muted/20" />;
  }
  if (attachment.mime_type.startsWith("video/")) {
    return <video src={url} controls className="w-full max-h-[400px] rounded-lg border border-border bg-muted/20" />;
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
      <LinkIcon className="w-5 h-5 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attachment.name}</p>
        <p className="text-xs text-muted-foreground">{(attachment.size / 1024).toFixed(1)} KB</p>
      </div>
    </a>
  );
};

const DEFAULT_AUTHOR_NAME = "Community contributor";

const getInitials = (value?: string | null) => {
  if (!value) return "GL";
  const segments = value
    .split(" ")
    .map((segment) => segment.trim())
    .filter(Boolean);
  if (!segments.length) return "GL";
  return segments.map((segment) => segment[0]?.toUpperCase()).join("").slice(0, 2);
};

const formatRelativeTime = (value?: string | null) => {
  if (!value) return "Unknown";
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) return "Unknown";
  const diffMinutes = Math.round((Date.now() - timestamp.getTime()) / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const ATTACHMENT_ACCEPT = [
  "image/*",
  "video/*",
  "application/pdf",
  "text/*",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
  "application/gzip",
  "application/octet-stream",
].join(",");

const storageBucketForUploadType = (uploadType: string) => {
  const normalized = uploadType.toLowerCase();
  if (normalized.includes("video")) return "community-post-videos";
  if (normalized.includes("image")) return "community-post-images";
  if (normalized.includes("document") || normalized.includes("write") || normalized.includes("link")) {
    return "community-post-documents";
  }
  return "community-post-media";
};

const sanitizeFileName = (value: string) => {
  const cleaned = value
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned || "attachment";
};

const buildStoragePath = (userId: string, fileName: string) => `${userId}/${Date.now()}-${sanitizeFileName(fileName)}`;

const DEFAULT_UPLOAD_TYPE = "Community media";

const Community = () => {
  const { toast } = useToast();
  const { session, profileRole } = useSupabaseSession();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState<string>("");
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<string>(SUBTOPICS[0]);
  const newUploadType = DEFAULT_UPLOAD_TYPE;
  const [newDirectData, setNewDirectData] = useState(true);
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [expandedCommentsId, setExpandedCommentsId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const requireAuthAction = (message: string) => {
    if (!session) {
      toast({ title: "Sign in required", description: message, variant: "destructive" });
      return false;
    }
    return true;
  };

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setNewTags((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag(tagInput);
      setTagInput("");
    }
  };

  const uploadAttachedFiles = async (uploadType: string): Promise<PostAttachment[]> => {
    if (!session || !attachedFiles.length) return [];
    const bucket = storageBucketForUploadType(uploadType);
    const attachments: PostAttachment[] = [];

    for (const file of attachedFiles) {
      const storagePath = buildStoragePath(session.user.id, file.name);
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
          cacheControl: "3600",
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      attachments.push({
        bucket,
        path: data?.path ?? storagePath,
        name: file.name,
        size: file.size,
        mime_type: file.type || "application/octet-stream",
        uploaded_at: new Date().toISOString(),
      });
    }

    return attachments;
  };

  const loadCommunityPosts = useCallback(async (): Promise<CommunityPost[]> => {
    const { data: postRows, error: postError } = await supabase
      .from("posts")
      .select(
        "id, user_id, title, content, category, upload_type, has_direct_data, tags, likes, created_at, attachments",
      )
      .order("created_at", { ascending: false });

    if (postError) {
      console.warn("Unable to load community posts", postError.message);
      return [];
    }

    const postsData = postRows ?? [];
    const postIds = postsData.map((post) => post.id);
    let commentRows: CommentRow[] = [];

    if (postIds.length) {
      const { data: commentData, error: commentError } = await supabase
        .from("comments")
        .select("id, post_id, user_id, content, created_at")
        .in("post_id", postIds)
        .order("created_at", { ascending: true });
      if (commentError) {
        console.warn("Unable to load comments", commentError.message);
      }
      commentRows = commentData ?? [];
    }

    const userIds = Array.from(
      new Set([
        ...postsData.map((post) => post.user_id).filter((id): id is string => Boolean(id)),
        ...commentRows.map((comment) => comment.user_id).filter((id): id is string => Boolean(id)),
      ]),
    );

    const profileMap = new Map<string, { fullName: string | null; role: string | null }>();

    if (userIds.length) {
      const { data: profileRows, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, full_name, role")
        .in("user_id", userIds);
      if (profileError) {
        console.warn("Unable to load profile data", profileError.message);
      } else {
        profileRows?.forEach((profile) => {
          if (profile.user_id) {
            profileMap.set(profile.user_id, { fullName: profile.full_name, role: profile.role });
          }
        });
      }
    }

    const commentsByPost = commentRows.reduce<Record<number, CommentRow[]>>((acc, comment) => {
      if (!acc[comment.post_id]) acc[comment.post_id] = [];
      acc[comment.post_id].push(comment);
      return acc;
    }, {});

    return postsData.map((post) => {
      const authorProfile = (post.user_id && profileMap.get(post.user_id)) ?? {
        fullName: null,
        role: null,
      };
      const mappedComments = (commentsByPost[post.id] ?? []).map((comment) => {
        const commenterProfile = (comment.user_id && profileMap.get(comment.user_id)) ?? {
          fullName: null,
          role: null,
        };
        return {
          id: comment.id,
          postId: comment.post_id,
          authorId: comment.user_id,
          author: commenterProfile.fullName ?? DEFAULT_AUTHOR_NAME,
          role: commenterProfile.role ?? "Community Member",
          content: comment.content,
          createdAt: comment.created_at ?? "",
        };
      });

      return {
        id: post.id,
        userId: post.user_id,
        title: post.title,
        content: post.content,
        category: post.category,
        uploadType: post.upload_type ?? "Other",
        hasDirectData: Boolean(post.has_direct_data),
        tags: post.tags,
        likes: post.likes ?? 0,
        createdAt: post.created_at ?? "",
        author: authorProfile.fullName ?? DEFAULT_AUTHOR_NAME,
        role: authorProfile.role ?? "Community Member",
        avatar: getInitials(authorProfile.fullName ?? DEFAULT_AUTHOR_NAME),
        comments: mappedComments,
        attachments: post.attachments ?? [],
      };
    });
  }, []);

  const refreshCommunityPosts = useCallback(async () => {
    setLoadingPosts(true);
    const data = await loadCommunityPosts();
    setPosts(data);
    setLoadingPosts(false);
  }, [loadCommunityPosts]);

  useEffect(() => {
    let active = true;
    const fetchPosts = async () => {
      setLoadingPosts(true);
      const data = await loadCommunityPosts();
      if (!active) return;
      setPosts(data);
      setLoadingPosts(false);
    };
    fetchPosts();
    return () => {
      active = false;
    };
  }, [loadCommunityPosts]);

  useEffect(() => {
    let active = true;

    if (!session) {
      setHistory([]);
      return;
    }

    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from("calculator_history")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!active) return;
      if (error) {
        console.warn("Unable to load saved calculations", error.message);
        return;
      }

      if (data) {
        setHistory(
          data.map((entry) => {
            const changeValue = entry.change_pct ?? entry.percentage_change ?? null;
            const normalizedChange =
              typeof changeValue === "number"
                ? changeValue
                : changeValue
                ? Number.parseFloat(changeValue)
                : null;
            return {
              id: entry.id ?? `${entry.user_id}-${entry.created_at}`,
              title: entry.title ?? entry.calculation_name ?? "Saved calculation",
              summary: entry.summary ?? entry.details ?? "Direct data import",
              impact: entry.impact ?? `${entry.co2_saved ?? "—"} tCO₂e`,
              timestamp: entry.created_at
                ? new Date(entry.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Unknown",
              change: Number.isFinite(normalizedChange) ? normalizedChange : null,
            } as CalculationHistoryItem;
          }),
        );
      } else {
        setHistory([]);
      }
    };

    fetchHistory();

    return () => {
      active = false;
    };
  }, [session]);

  const filteredPosts = useMemo(
    () => posts.filter((post) => activeCategory === "All" || post.category === activeCategory),
    [posts, activeCategory],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((post) => {
      counts[post.category] = (counts[post.category] ?? 0) + 1;
    });
    return counts;
  }, [posts]);

  const topicCount = useMemo(() => new Set(posts.map((post) => post.category)).size, [posts]);

  const historyChanges = useMemo(
    () => history.filter((item) => item.change !== null) as CalculationHistoryItem[],
    [history],
  );

  const latestChange = historyChanges[0]?.change ?? null;
  const averageChange =
    historyChanges.length > 0
      ? historyChanges.reduce((sum, entry) => sum + (entry.change ?? 0), 0) / historyChanges.length
      : null;

  const userDisplayName = session?.user.user_metadata?.full_name || session?.user.email || "Sign in to see your stats";
  const userRole = profileRole || session?.user.user_metadata?.role || "Community Contributor";
  const userPostCount = session ? posts.filter((post) => post.userId === session.user.id).length : 0;
  const userCommentCount = session
    ? posts.reduce(
        (total, post) => total + post.comments.filter((comment) => comment.authorId === session.user.id).length,
        0,
      )
    : 0;

  const handleEditPost = (post: CommunityPost) => {
    setNewTitle(post.title);
    setNewContent(post.content);
    setNewCategory(post.category);
    setNewTags(post.tags || []);
    setNewDirectData(post.hasDirectData);
    setEditingPostId(post.id);
    setIsCreatingPost(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePost = async () => {
    if (!deletingPostId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from("posts").delete().eq("id", deletingPostId);
      if (error) {
        toast({ title: "Delete failed", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Post deleted", description: "Your post has been removed." });
      await refreshCommunityPosts();
    } finally {
      setIsDeleting(false);
      setDeletingPostId(null);
    }
  };

  const handleCreatePost = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast({ title: "Validation Error", description: "Title and content are required.", variant: "destructive" });
      return;
    }
    if (!requireAuthAction("Log in or sign up to publish a post.")) return;
    if (!session) return;

    const tagsArray = newTags.filter(Boolean);
    setIsSubmittingPost(true);
    try {
      const attachmentsPayload = attachedFiles.length ? await uploadAttachedFiles(DEFAULT_UPLOAD_TYPE) : [];

      const payload: Record<string, unknown> = {
        user_id: session.user.id,
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        upload_type: newUploadType,
        has_direct_data: newDirectData,
        tags: tagsArray.length ? tagsArray : null,
      };

      if (attachmentsPayload.length) {
        payload.attachments = attachmentsPayload;
      }

      let error;
      if (editingPostId) {
        const { error: updateError } = await supabase.from("posts").update(payload).eq("id", editingPostId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from("posts").insert([payload]);
        error = insertError;
      }
      
      if (error) {
        toast({ title: editingPostId ? "Update failed" : "Post failed", description: error.message, variant: "destructive" });
        return;
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setNewTitle("");
      setNewContent("");
      setNewCategory(SUBTOPICS[0]);
      setNewTags([]);
      setTagInput("");
      setNewDirectData(true);
      setAttachedFiles([]);
      setIsCreatingPost(false);
      setEditingPostId(null);
      toast({ title: "Post queued", description: "Your insight will appear on the board shortly." });
      await refreshCommunityPosts();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to upload attachments";
      toast({ title: "Upload failed", description: message, variant: "destructive" });
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleLike = (id: number) => {
    if (!requireAuthAction("Please log in to upvote content.")) return;

    let shouldToast = false;
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === id) {
          const isLiked = !!post.userLiked;
          if (!isLiked) {
            shouldToast = true;
          }
          return {
            ...post,
            likes: isLiked ? post.likes - 1 : post.likes + 1,
            userLiked: !isLiked,
          };
        }
        return post;
      }),
    );
    if (shouldToast) {
      toast({ title: "Upvoted!", description: "Your upvote keeps the sustainability signal strong." });
    }
  };

  const handleShare = async (id: number) => {
    try {
      const shareUrl = `${window.location.origin}/community?postId=${id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied!", description: "Link copied to clipboard." });
    } catch (err) {
      toast({ title: "Failed to copy", description: "Could not copy link.", variant: "destructive" });
    }
  };


  const handleEditComment = async () => {
    if (!editingCommentId || !editingCommentContent.trim()) return;
    try {
      const { error } = await supabase.from("comments").update({ content: editingCommentContent.trim() }).eq("id", editingCommentId);
      if (error) throw error;
      toast({ title: "Comment updated!" });
      await refreshCommunityPosts();
      setEditingCommentId(null);
      setEditingCommentContent("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      toast({ title: "Update failed", description: message, variant: "destructive" });
    }
  };

  const handleDeleteComment = async () => {
    if (!deletingCommentId) return;
    setIsDeletingComment(true);
    try {
      const { error } = await supabase.from("comments").delete().eq("id", deletingCommentId);
      if (error) throw error;
      toast({ title: "Comment deleted" });
      await refreshCommunityPosts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      toast({ title: "Delete failed", description: message, variant: "destructive" });
    } finally {
      setIsDeletingComment(false);
      setDeletingCommentId(null);
    }
  };

  const handleAddComment = async (postId: number) => {
    if (!newComment.trim()) return;
    if (!requireAuthAction("Log in to add comments and join the conversation.")) return;
    if (!session) return;

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: session.user.id,
      content: newComment.trim(),
    });

    if (error) {
      toast({ title: "Comment failed", description: error.message, variant: "destructive" });
      return;
    }

    setNewComment("");
    setExpandedCommentsId(postId);
    await refreshCommunityPosts();
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    if (event.dataTransfer?.files?.length) {
      const files = Array.from(event.dataTransfer.files);
      setAttachedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setAttachedFiles((prev) => [...prev, ...files]);
    event.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const displayedPosts = loadingPosts ? [] : filteredPosts;

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <main className="pt-32 pb-16 px-6 md:px-12 max-w-7xl mx-auto flex flex-col gap-8">
        <div className="grid lg:grid-cols-[1.95fr_1fr] gap-8">
          <section className="space-y-6">
            <div className="bg-background border border-border p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Community Access</p>
                  <h2 className="text-3xl font-display font-bold">Join the discussion</h2>
                  <p className="text-sm text-muted-foreground">
                    Use the navigation controls above to authenticate before contributing data or reacting to posts.
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-foreground/10 text-foreground">
                  {session ? "" : "Sign in required"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold font-display">Community Board</h1>
                <p className="text-sm text-muted-foreground">Find & Post Volunteer Opportunities, Filter by topic and keep every discussion action-oriented.</p>
              </div>
              <button
                onClick={() => {
                  if (!requireAuthAction("Log in to create posts.")) return;
                  setIsCreatingPost(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap px-6 py-3 font-bold text-primary-foreground bg-primary rounded-xl shadow-[0_5px_0_rgb(20,83,45)] hover:shadow-[0_2px_0_rgb(20,83,45)] hover:translate-y-[3px] transition-all active:shadow-none active:translate-y-[5px]"
                disabled={!session}
              >
                <Plus className="w-5 h-5" /> Create Post
              </button>
            </div>

            {!session && (
              <div className="border border-destructive/60 rounded-xl bg-destructive/5 px-5 py-3 text-sm text-destructive">
                Sign in to post, comment, or upvote. Every interaction stays tied to your profile.
              </div>
            )}

            {session && isCreatingPost && (
              <div className="bg-background border border-border p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold font-display">{editingPostId ? "Edit post" : "Create a new post"}</h2>
                                    <button
                    type="button"
                    onClick={() => {
                      setIsCreatingPost(false);
                      setEditingPostId(null);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleCreatePost} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Post title"
                    value={newTitle}
                    onChange={(event) => setNewTitle(event.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border focus:outline-none focus:border-primary transition-colors"
                  />
                  <div className="grid md:grid-cols-2 gap-3">
                    <select
                      value={newCategory}
                      onChange={(event) => setNewCategory(event.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border focus:outline-none focus:border-primary transition-colors"
                    >
                      {SUBTOPICS.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                    <div className="w-full border border-border rounded-xl px-4 py-3 bg-muted/10 text-sm text-muted-foreground">
                      <p className="text-[11px] uppercase tracking-[0.3em]">Upload policy</p>
                      <p className="font-semibold text-foreground">{DEFAULT_UPLOAD_TYPE}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Files are stored in the mixed media bucket; images, videos, and docs go in the same place.
                      </p>
                    </div>
                  </div>
                  <ReactQuill
                    theme="snow"
                    value={newContent}
                    onChange={setNewContent}
                    placeholder="Share your observation, data, or ask"
                    className="bg-background [&_.ql-container]:min-h-[150px] [&_.ql-editor]:min-h-[150px] mb-4"
                  />
                  <input
                    type="text"
                    placeholder="Add tags (press Enter to save)"
                    value={tagInput}
                    onChange={(event) => setTagInput(event.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    className="w-full px-4 py-2 bg-background border border-border focus:outline-none focus:border-primary transition-colors"
                  />
                  {newTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newTags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 bg-muted/50 text-xs px-3 py-1 rounded-full border border-border"
                        >
                          <span className="truncate max-w-[8rem]">{tag}</span>
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => handleRemoveTag(tag)}
                            aria-label={`Remove ${tag}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={newDirectData}
                      onChange={(event) => setNewDirectData(event.target.checked)}
                      className="h-4 w-4"
                    />
                    Based on direct data
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ATTACHMENT_ACCEPT}
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div
                    role="button"
                    tabIndex={0}
                    className={`border-2 rounded-lg px-3 py-6 text-center transition-colors ${
                      dragActive ? "border-primary bg-primary/5" : "border-dashed border-border bg-muted/10"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    <p className="text-sm font-semibold text-foreground">Drag files here (links, videos, images, docs)</p>
                    <p className="text-xs text-muted-foreground">Attachments will appear below once uploaded.</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Or{" "}
                      <span className="text-primary font-semibold underline decoration-dashed">browse files</span>
                    </p>
                  </div>
                  {attachedFiles.length > 0 && (
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {attachedFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="flex items-center gap-2 justify-between border border-border rounded px-3 py-2"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="truncate block">{file.name}</span>
                            <span className="text-[11px] text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="text-[11px] text-destructive font-semibold uppercase tracking-wider"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 border-t border-border pt-4 mt-2">
                    <div className="text-xs text-muted-foreground max-w-md">
                      {session && (
                        <p className="font-medium text-foreground mb-1">Posts show the upload type, category, and tags for easier discovery.</p>
                      )}
                      <p>Every upload, comment, and vote stays tied to your profile. Live calculators keep the data you saved in sync.</p>
                    </div>
                    <button type="submit" className="btn-squared-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto shrink-0" disabled={!session || isSubmittingPost}>
                      <PenLine className="w-4 h-4" />
                      {isSubmittingPost ? "Publishing…" : editingPostId ? "Save Changes" : "Publish Post"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
                    activeCategory === category
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground hover:border-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {loadingPosts ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <PostSkeleton key={i} />)}
                </div>
              ) : displayedPosts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-background border border-border">
                  No posts found in this topic yet.
                </div>
              ) : (
                displayedPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-background border border-border hover:border-border/80 transition-colors shadow-sm rounded-2xl overflow-hidden"
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                            {post.avatar}
                          </div>
                          <div>
                            <Link
                              to={`/community/profile/${encodeURIComponent(post.author)}`}
                              className="text-base font-semibold text-foreground hover:text-primary"
                            >
                              {post.author}
                            </Link>
                            <p className="text-xs text-muted-foreground">{post.role}</p>
                            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                              {post.category}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatRelativeTime(post.createdAt)}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide border border-border">
                            {post.uploadType}
                          </span>
                          {session?.user.id === post.userId && (
                            <div className="flex items-center gap-1 ml-2">
                              <button onClick={() => handleEditPost(post)} className="p-1 hover:text-primary transition-colors rounded-full" title="Edit post">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => setDeletingPostId(post.id)} className="p-1 hover:text-destructive transition-colors rounded-full" title="Delete post">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold font-display flex-1">{post.title}</h3>
                      </div>
                      <div className="text-foreground/80 leading-relaxed prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdownBold(post.content) }} />
                      {post.attachments && post.attachments.length > 0 && (
                        <div className="py-4">
                          {post.attachments.length === 1 ? (
                            <AttachmentPreview attachment={post.attachments[0]} />
                          ) : (
                            <Carousel className="w-full max-w-3xl mx-auto group">
                              <CarouselContent>
                                {post.attachments.map((att, idx) => (
                                  <CarouselItem key={idx}>
                                    <AttachmentPreview attachment={att} />
                                  </CarouselItem>
                                ))}
                              </CarouselContent>
                              <div className="hidden group-hover:block transition-opacity">
                                <CarouselPrevious className="left-2" />
                                <CarouselNext className="right-2" />
                              </div>
                            </Carousel>
                          )}
                        </div>
                      )}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <span key={tag} className="text-xs px-2 py-1 border border-border rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-4 border-t border-border">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-2 font-medium transition-colors ${
                            post.userLiked ? "text-primary" : "hover:text-primary"
                          }`}
                        >
                          <ThumbsUp className={`w-4 h-4 ${post.userLiked ? "fill-primary" : ""}`} />
                          {post.likes} Upvotes
                        </button>
                        <button
                          onClick={() => setExpandedCommentsId((prev) => (prev === post.id ? null : post.id))}
                          className="flex items-center gap-2 hover:text-primary transition-colors font-medium"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {post.comments.length} Comments
                        </button>
                        <button
                          onClick={() => handleShare(post.id)}
                          className="flex items-center gap-2 hover:text-primary transition-colors ml-auto font-medium"
                        >
                          Share
                        </button>
                        <div className="flex items-center gap-1 text-[11px] uppercase tracking-[0.3em]">
                          <LinkIcon className="w-3 h-3" />
                          <span>{post.uploadType}</span>
                        </div>
                      </div>
                    </div>
                    {expandedCommentsId === post.id && (
                      <div className="bg-muted/30 p-6 border-t border-border space-y-4">
                        <h4 className="text-sm font-semibold">Comments</h4>
                        <div className="space-y-3">
                          {post.comments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No comments yet. Add the first insight.</p>
                          ) : (
                            post.comments.map((comment) => (
                              <div key={comment.id} className="bg-background border border-border p-4 rounded-2xl text-sm space-y-2">
                                <div className="flex items-center justify-between">
                                  <Link
                                    to={`/community/profile/${encodeURIComponent(comment.author)}`}
                                    className="text-xs font-semibold text-foreground hover:text-primary"
                                  >
                                    {comment.author}
                                  </Link>
                                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                    {formatRelativeTime(comment.createdAt)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
                                  <span className="px-2 py-0.5 rounded-full bg-muted/80 text-muted-foreground">{comment.role}</span>
                                  <span>{post.category}</span>
                                </div>
                                                                  {editingCommentId === comment.id ? (
                                    <div className="space-y-2 mt-2">
                                      <input
                                        type="text"
                                        value={editingCommentContent}
                                        onChange={(e) => setEditingCommentContent(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleEditComment();
                                          }
                                        }}
                                        className="w-full px-3 py-1.5 bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors rounded-md"
                                      />
                                      <div className="flex justify-end gap-3">
                                        <button onClick={() => setEditingCommentId(null)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                                        <button onClick={handleEditComment} className="text-xs text-primary font-semibold hover:text-primary/80">Save</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-start justify-between gap-4 mt-2">
                                      <p className="text-foreground/80 leading-relaxed flex-1">{comment.content}</p>
                                      {session?.user?.id === comment.authorId && (
                                        <div className="flex items-center gap-1 shrink-0 mt-1">
                                          <button onClick={() => { setEditingCommentId(comment.id); setEditingCommentContent(comment.content); }} className="p-1 text-muted-foreground hover:text-primary transition-colors rounded-full" title="Edit comment">
                                            <Edit className="w-3.5 h-3.5" />
                                          </button>
                                          <button onClick={() => setDeletingCommentId(comment.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors rounded-full" title="Delete comment">
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                              </div>
                            ))
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(event) => setNewComment(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                handleAddComment(post.id);
                              }
                            }}
                            className="flex-1 px-4 py-2 bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors"
                            disabled={!session}
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="btn-squared-primary px-4 py-2 text-sm"
                            disabled={!session}
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="bg-background border border-border p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold">Profile</h3>
                  <p className="text-xs text-muted-foreground">Everything you share remains associated with your profile.</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  {session ? "Signed in" : "Guest"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {session
                    ? (session.user.user_metadata?.full_name || session.user.email || "GL")
                        .slice(0, 2)
                        .toUpperCase()
                    : "GL"}
                </div>
                <div>
                  <p className="text-sm font-semibold">{userDisplayName}</p>
                  <p className="text-xs text-muted-foreground">{session ? userRole : "Sign in to personalize"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div className="border border-border rounded-md px-3 py-2 text-center">
                  <p className="text-foreground font-semibold text-sm">{session ? userPostCount : "—"}</p>
                  <p>Posts</p>
                </div>
                <div className="border border-border rounded-md px-3 py-2 text-center">
                  <p className="text-foreground font-semibold text-sm">{session ? userCommentCount : "—"}</p>
                  <p>Comments</p>
                </div>
                <div className="border border-border rounded-md px-3 py-2 text-center">
                  <p className="text-foreground font-semibold text-sm">{session ? history.length : "—"}</p>
                  <p>Saved calculators</p>
                </div>
                <div className="border border-border rounded-md px-3 py-2 text-center">
                  <p className="text-foreground font-semibold text-sm">{session ? topicCount : "—"}</p>
                  <p>Active topics</p>
                </div>
              </div>
            </div>

            {session && (
              <>
                <div className="bg-background border border-border p-6 shadow-sm space-y-4">
                  <h3 className="font-display text-lg font-bold">Calculation History</h3>
                <div className="space-y-3">
                  {history.length > 0 ? (
                    history.slice(0, 4).map((entry) => (
                        <div key={entry.id} className="border border-border rounded-lg p-3 bg-muted/20">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">{entry.title}</p>
                            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{entry.timestamp}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{entry.summary}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                            <span>{entry.impact}</span>
                            {entry.change !== null ? (
                              <span className="font-semibold text-foreground">
                                Δ {entry.change > 0 ? "+" : ""}
                                {entry.change.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">No variance logged</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No calculator history saved yet.</p>
                    )}
                  </div>
                </div>
              </>
            )}
            <div className="bg-background border border-border p-6 shadow-sm space-y-4">
              <h3 className="font-display text-lg font-bold">Subtopic categories</h3>
              <div className="space-y-2 text-sm leading-snug">
                {SUBTOPICS.map((topic) => (
                  <div
                    key={topic}
                    className="flex items-center justify-between px-3 py-2 rounded-md border border-border transition-colors hover:border-foreground"
                  >
                    <span className="font-semibold text-foreground">{topic}</span>
                    <span className="text-xs text-muted-foreground">{categoryCounts[topic] ?? 0} posts</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />

      <AlertDialog open={!!deletingPostId} onOpenChange={(open) => !open && setDeletingPostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post and remove the data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDeletePost(); }} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Deleting..." : "Delete Post"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingCommentId} onOpenChange={(open) => !open && setDeletingCommentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your comment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingComment}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDeleteComment(); }} disabled={isDeletingComment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeletingComment ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default Community;

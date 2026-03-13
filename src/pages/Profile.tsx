import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { useToast } from "@/hooks/use-toast";
import type { PostAttachment } from "@/types/post";

type PostRow = {
  id: number;
  title: string;
  content: string;
  category: string;
  upload_type: string | null;
  has_direct_data: boolean;
  tags: string[] | null;
  created_at: string;
  attachments: PostAttachment[] | null;
};

type CommentRow = {
  id: number;
  content: string;
  created_at: string;
  post?: {
    title: string;
    category: string;
  };
};

type HistoryRow = {
  id: string;
  title: string | null;
  summary: string | null;
  impact: string | null;
  change_pct: number | null;
  total_emissions: number | null;
  created_at: string;
  breakdown?: { name: string; value: number }[] | null;
};

type ProfileRecord = {
  fullName: string | null;
  organization: string | null;
  bio: string | null;
  role: string | null;
};

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { session } = useSupabaseSession();
  const { toast } = useToast();
  const normalizedName = username ? decodeURIComponent(username) : null;
  const sessionName = (session?.user.user_metadata?.full_name || session?.user.email || "").trim();
  const normalizedSessionName = sessionName.toLowerCase();
  const normalizedParamName = normalizedName?.toLowerCase().trim() || "";
  const isOwnProfile = Boolean(session && (!normalizedName || normalizedSessionName === normalizedParamName));
  const [profileRecord, setProfileRecord] = useState<ProfileRecord | null>(null);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [historyRows, setHistoryRows] = useState<HistoryRow[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [formValues, setFormValues] = useState({
    fullName: sessionName,
    organization: "",
    bio: "",
  });
  const [passwordValues, setPasswordValues] = useState({ password: "", confirm: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [postDraft, setPostDraft] = useState({ title: "", content: "", tags: "" });
  const [postSavingId, setPostSavingId] = useState<number | null>(null);
  const [postDeletingId, setPostDeletingId] = useState<number | null>(null);

  const stats = isOwnProfile
    ? {
        posts: posts.length,
        comments: comments.length,
        history: historyRows.length,
        interactions: posts.length + comments.length,
      }
    : {
        posts: 0,
        comments: 0,
        history: 0,
        interactions: 0,
      };

  const historyEntries = isOwnProfile ? historyRows : [];
  const calculationEntries = historyEntries;
  const changeValues = historyEntries.filter((entry) => typeof entry.change_pct === "number");
  const latestChange = changeValues[0]?.change_pct ?? null;
  const averageChange = changeValues.length
    ? changeValues.reduce((sum, entry) => sum + (entry.change_pct ?? 0), 0) / changeValues.length
    : null;
  const latestEntry = calculationEntries[0];
  const highestTotalEmissions = calculationEntries.reduce((max, entry) => {
    const total = entry.total_emissions;
    return typeof total === "number" ? Math.max(max, total) : max;
  }, 0);
  const latestTotalEmissions =
    typeof latestEntry?.total_emissions === "number" ? latestEntry.total_emissions : null;

  const displayName = normalizedName || sessionName || "GreenLens member";
  const displayRole = isOwnProfile
    ? profileRecord?.role || "Community Contributor"
    : "Community Member";
  const displayBio = isOwnProfile
    ? profileRecord?.bio || "Update your profile so the community knows your focus."
    : "Sign in and publish an update to share your community perspective.";
  const displayOrganization = isOwnProfile ? profileRecord?.organization : null;
  const postsToShow = isOwnProfile ? posts : [];
  const commentsToShow = isOwnProfile ? comments : [];

  const displayInitials = displayName
    .split(" ")
    .map((segment) => segment[0]?.toUpperCase())
    .join("")
    .slice(0, 3) || "GL";

  useEffect(() => {
    let active = true;

    if (!session || !isOwnProfile) {
      setProfileRecord(null);
      setPosts([]);
      setComments([]);
      setHistoryRows([]);
      setProfileLoading(false);
      return;
    }

    const fetchUserData = async () => {
      setProfileLoading(true);
      const [profileResult, postsResult, commentsResult, historyResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", session.user.id).maybeSingle(),
        supabase
          .from("posts")
          .select("id, title, content, category, upload_type, has_direct_data, tags, created_at, attachments")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("comments")
          .select("id, content, created_at, post:posts(title, category)")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("calculator_history")
          .select("id, title, summary, impact, change_pct, total_emissions, created_at, breakdown")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (!active) return;

      if (profileResult.error) {
        console.warn("Unable to load profile", profileResult.error.message);
      } else {
        const record = profileResult.data;
        if (record) {
          setProfileRecord({
            fullName: record.full_name,
            organization: record.organization,
            bio: record.bio,
            role: record.role,
          });
          setFormValues({
            fullName: record.full_name || sessionName,
            organization: record.organization || "",
            bio: record.bio || "",
          });
        } else {
          setFormValues({
            fullName: sessionName,
            organization: "",
            bio: "",
          });
        }
      }

      if (postsResult.error) {
        console.warn("Unable to load posts", postsResult.error.message);
      } else {
        setPosts(
          (postsResult.data ?? []).map((post) => ({
            ...post,
            attachments: post.attachments ?? [],
          })),
        );
      }

      if (commentsResult.error) {
        console.warn("Unable to load comments", commentsResult.error.message);
      } else {
        setComments(
          (commentsResult.data ?? []).map((comment) => ({
            id: comment.id,
            content: comment.content,
            created_at: comment.created_at,
            post: comment.post ?? undefined,
          })),
        );
      }

      if (historyResult.error) {
        console.warn("Unable to load calculator history", historyResult.error.message);
      } else {
        setHistoryRows(historyResult.data ?? []);
      }

      setProfileLoading(false);

      if (!profileResult.data) {
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            user_id: session.user.id,
            full_name: sessionName,
          })
          .onConflict("user_id")
          .ignore();

        if (insertError) {
          console.warn("Unable to seed profile row", insertError.message);
        }
      }
    };

    fetchUserData();

    return () => {
      active = false;
    };
  }, [session, isOwnProfile, sessionName]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session) return;
    setProfileSaving(true);
    const updates = {
      full_name: formValues.fullName || sessionName,
      organization: formValues.organization,
      bio: formValues.bio,
    };
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", session.user.id);
    setProfileSaving(false);
    if (error) {
      toast({ title: "Profile update failed", description: error.message, variant: "destructive" });
      return;
    }
    setProfileRecord((prev) => ({
      fullName: updates.full_name,
      organization: updates.organization,
      bio: updates.bio,
      role: prev?.role ?? null,
    }));
    toast({ title: "Profile saved", description: "Your GreenLens profile is up to date." });
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session) return;
    if (!passwordValues.password || passwordValues.password !== passwordValues.confirm) {
      toast({ title: "Passwords do not match", description: "Confirm your new password before saving.", variant: "destructive" });
      return;
    }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: passwordValues.password });
    setPasswordSaving(false);
    if (error) {
      toast({ title: "Password update failed", description: error.message, variant: "destructive" });
      return;
    }
    setPasswordValues({ password: "", confirm: "" });
    toast({ title: "Password updated", description: "You can now sign in with your new credentials." });
  };

  const startEditPost = (post: PostRow) => {
    setEditingPostId(post.id);
    setPostDraft({
      title: post.title,
      content: post.content,
      tags: (post.tags ?? []).join(", "),
    });
  };

  const handlePostSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session || !editingPostId) return;
    setPostSavingId(editingPostId);
    const tagsArray = postDraft.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const { error } = await supabase
      .from("posts")
      .update({ title: postDraft.title, content: postDraft.content, tags: tagsArray })
      .eq("id", editingPostId);
    setPostSavingId(null);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setPosts((prev) =>
      prev.map((post) =>
        post.id === editingPostId ? { ...post, title: postDraft.title, content: postDraft.content, tags: tagsArray } : post,
      ),
    );
    setEditingPostId(null);
    toast({ title: "Post updated", description: "Your content has been refreshed." });
  };

  const handleDeletePost = async (postId: number) => {
    if (!session) return;
    setPostDeletingId(postId);
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    setPostDeletingId(null);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    setPosts((prev) => prev.filter((post) => post.id !== postId));
    toast({ title: "Post removed", description: "It will no longer appear on the board." });
  };

  const formatDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <main className="pt-32 pb-16 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1fr]">
          <aside className="space-y-6">
            <div className="bg-background border border-border rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl font-display font-semibold">
                  {displayInitials}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Profile</p>
                  <h1 className="font-display text-3xl font-bold">{displayName}</h1>
                  <p className="text-sm text-muted-foreground">{displayRole}</p>
                  {displayOrganization && (
                    <p className="text-xs text-muted-foreground">Organization: {displayOrganization}</p>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{displayBio}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => scrollToSection("manage-posts")}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] rounded-full border border-border hover:border-foreground transition-colors"
                >
                  Manage posts
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection("history-section")}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] rounded-full border border-border hover:border-foreground transition-colors"
                >
                  Calculator history
                </button>
                <Link
                  to="/community"
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] rounded-full border border-primary text-primary hover:bg-primary/10 transition-colors"
                >
                  Community board
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div className="border border-border rounded-2xl px-3 py-2 text-center">
                  <p className="text-foreground font-semibold text-sm">{stats.posts}</p>
                  <p>Posts</p>
                </div>
                <div className="border border-border rounded-2xl px-3 py-2 text-center">
                  <p className="text-foreground font-semibold text-sm">{stats.comments}</p>
                  <p>Comments</p>
                </div>
                <div className="border border-border rounded-2xl px-3 py-2 text-center">
                  <p className="text-foreground font-semibold text-sm">{stats.history}</p>
                  <p>Calculators</p>
                </div>
                <div className="border border-border rounded-2xl px-3 py-2 text-center">
                  <p className="text-foreground font-semibold text-sm">{stats.interactions}</p>
                  <p>Interactions</p>
                </div>
              </div>
            </div>

            <div className="bg-background border border-border rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">Profile settings</h3>
                {profileLoading && <span className="text-xs text-muted-foreground">Syncing your data</span>}
              </div>
              {session && isOwnProfile ? (
                <form className="space-y-3" onSubmit={handleProfileSubmit}>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1 text-sm">
                      <label className="font-medium text-foreground">Organization</label>
                      <input
                        type="text"
                        value={formValues.organization}
                        onChange={(event) => setFormValues((prev) => ({ ...prev, organization: event.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-1 text-sm">
                      <label className="font-medium text-foreground">Full name</label>
                      <input
                        type="text"
                        value={formValues.fullName}
                        onChange={(event) => setFormValues((prev) => ({ ...prev, fullName: event.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <label className="font-medium text-foreground">Short bio</label>
                    <textarea
                      value={formValues.bio}
                      onChange={(event) => setFormValues((prev) => ({ ...prev, bio: event.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full btn-squared-primary px-4 py-2 text-sm font-semibold"
                    disabled={profileSaving}
                  >
                    {profileSaving ? "Saving..." : "Update profile"}
                  </button>
                </form>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sign in to manage your profile, update your bio, and restore credentials.
                </p>
              )}
            </div>

            <div className="bg-background border border-border rounded-3xl p-6 shadow-sm space-y-3">
              <h3 className="font-display text-lg font-bold">Password & security</h3>
              {session && isOwnProfile ? (
                <form className="space-y-3" onSubmit={handlePasswordSubmit}>
                  <input
                    type="password"
                    placeholder="New password"
                    value={passwordValues.password}
                    onChange={(event) => setPasswordValues((prev) => ({ ...prev, password: event.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:border-primary transition-colors"
                  />
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={passwordValues.confirm}
                    onChange={(event) => setPasswordValues((prev) => ({ ...prev, confirm: event.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="submit"
                    className="w-full btn-squared-primary px-4 py-2 text-sm font-semibold"
                    disabled={passwordSaving}
                  >
                    {passwordSaving ? "Updating..." : "Update password"}
                  </button>
                </form>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You must be signed in to change your password or secure your account settings.
                </p>
              )}
            </div>
          </aside>

          <section className="space-y-6">

            <div id="manage-posts" className="bg-background border border-border rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Your board</p>
                  <h2 className="font-display text-2xl font-bold">Manage posts</h2>
                </div>
                <Link to="/community" className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                  Create new
                </Link>
              </div>
              {session && isOwnProfile ? (
                postsToShow.length === 0 ? (
                  <p className="text-sm text-muted-foreground">You haven’t shared anything yet. Begin in the community board.</p>
                ) : (
                  <div className="space-y-3">
                    {postsToShow.map((post) => (
                      <div key={post.id} className="border border-border rounded-2xl p-4 space-y-3 bg-muted/20">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold">{post.title}</p>
                            <p className="text-xs text-muted-foreground">{post.category}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                            <span>{formatDate(post.created_at)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-foreground/80">{post.content}</p>
                        <div className="flex flex-wrap gap-2">
                          {(post.tags ?? []).map((tag) => (
                            <span key={tag} className="text-xs px-2 py-1 border border-border rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                        {editingPostId === post.id ? (
                          <form className="space-y-2" onSubmit={handlePostSave}>
                            <input
                              type="text"
                              value={postDraft.title}
                              onChange={(event) => setPostDraft((prev) => ({ ...prev, title: event.target.value }))}
                              className="w-full px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:border-primary transition-colors"
                            />
                            <textarea
                              value={postDraft.content}
                              onChange={(event) => setPostDraft((prev) => ({ ...prev, content: event.target.value }))}
                              rows={3}
                              className="w-full px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:border-primary transition-colors resize-none"
                            />
                            <input
                              type="text"
                              value={postDraft.tags}
                              onChange={(event) => setPostDraft((prev) => ({ ...prev, tags: event.target.value }))}
                              placeholder="Tags (comma separated)"
                              className="w-full px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:border-primary transition-colors"
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                className="btn-squared gap-2 px-4 py-2 text-xs font-semibold"
                                disabled={postSavingId === post.id}
                              >
                                {postSavingId === post.id ? "Saving..." : "Save changes"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingPostId(null)}
                                className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] border border-border rounded-full"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEditPost(post)}
                              className="px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border rounded-full"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-destructive text-destructive rounded-full"
                              disabled={postDeletingId === post.id}
                            >
                              {postDeletingId === post.id ? "Removing..." : "Delete"}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sign in to manage your posts, edit drafts, and stay organized.
                </p>
              )}
            </div>

            <div className="bg-background border border-border rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Past comments</p>
                  <h2 className="font-display text-2xl font-bold">Discussion log</h2>
                </div>
                <span className="text-xs text-muted-foreground">{commentsToShow.length} entries</span>
              </div>
              <div className="space-y-3">
                {commentsToShow.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {session ? "You haven’t commented yet." : "Sign in to follow conversations."}
                  </p>
                ) : (
                  commentsToShow.slice(0, 5).map((comment) => (
                    <div key={comment.id} className="border border-border rounded-2xl p-4 space-y-2 bg-muted/10">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">{comment.post?.title ?? "Community post"}</p>
                        <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                        {comment.post?.category || "Community"}
                      </p>
                      <p className="text-sm text-foreground/80">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
        <div
          id="history-section"
          className="w-full bg-background border border-border rounded-3xl p-6 shadow-sm space-y-6 mt-10"
        >
          <div className="flex flex-col gap-2 md:flex-row items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Calculator history</p>
              <h2 className="font-display text-2xl font-bold">Impact tracker</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {calculationEntries.length} entr{calculationEntries.length === 1 ? "y" : "ies"}
            </span>
          </div>
          <div className="space-y-5">
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
              <div className="rounded-2xl border border-border p-3 text-center">
                <p className="text-[11px] text-muted-foreground uppercase tracking-[0.3em] mb-1">Latest variance</p>
                <p
                  className={`text-xl font-semibold ${
                    latestChange === null ? "text-foreground" : latestChange > 0 ? "text-destructive" : "text-emerald-500"
                  }`}
                >
                  {latestChange === null ? "—" : `${latestChange > 0 ? "+" : ""}${latestChange.toFixed(1)}%`}
                </p>
              </div>
              <div className="rounded-2xl border border-border p-3 text-center">
                <p className="text-[11px] text-muted-foreground uppercase tracking-[0.3em] mb-1">Average change</p>
                <p className="text-xl font-semibold text-foreground">
                  {averageChange === null ? "—" : `${averageChange > 0 ? "+" : ""}${averageChange.toFixed(1)}%`}
                </p>
              </div>
              <div className="rounded-2xl border border-border p-3 text-center">
                <p className="text-[11px] text-muted-foreground uppercase tracking-[0.3em] mb-1">Latest total</p>
                <p className="text-xl font-semibold text-foreground">
                  {latestTotalEmissions === null ? "—" : `${latestTotalEmissions.toFixed(1)}t`}
                </p>
              </div>
              <div className="rounded-2xl border border-border p-3 text-center">
                <p className="text-[11px] text-muted-foreground uppercase tracking-[0.3em] mb-1">Highest total</p>
                <p className="text-xl font-semibold text-foreground">
                  {highestTotalEmissions === 0 ? "—" : `${highestTotalEmissions.toFixed(1)}t`}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {calculationEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No history yet. Run a calculator to start tracking progress.</p>
              ) : (
                calculationEntries.slice(0, 2).map((entry) => (
                  <div key={entry.id} className="border border-border rounded-2xl p-4 bg-muted/10 space-y-2">
                    <p className="text-sm font-semibold">{entry.title ?? "Personal footprint snapshot"}</p>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                      {formatDate(entry.created_at)}
                    </p>
                    <p className="text-sm text-foreground/80">{entry.summary?.replace(/Annualized estimate based on /, "Annualized estimate based on ")}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{entry.impact ?? "0.0 tCO₂e annually"}</span>
                      {entry.change_pct !== null ? (
                        <span className="font-semibold text-foreground">
                          Δ {entry.change_pct > 0 ? "+" : ""}
                          {entry.change_pct.toFixed(1)}%
                        </span>
                      ) : (
                        <span>No variance logged</span>
                      )}
                    </div>
                    {entry.breakdown && entry.breakdown.length > 0 && (
                      <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                        {entry.breakdown.map((segment) => (
                          <span key={segment.name} className="border border-border rounded-full px-3 py-1">
                            {segment.name}: {segment.value.toFixed(2)}t
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Every saved calculation contributes to your timeline. Sign in to persist inputs, compare progress, and export raw metadata if needed.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;

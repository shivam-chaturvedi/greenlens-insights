import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MessageSquare, ThumbsUp, PenLine, Flag, Trash2, ShieldAlert, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type CommentType = {
    id: number;
    author: string;
    content: string;
    time: string;
};

type PostType = {
    id: number;
    title: string;
    content: string;
    author: string;
    role: string;
    avatar: string;
    category: string;
    likes: number;
    comments: CommentType[];
    time: string;
    isDeleted?: boolean;
    userLiked?: boolean;
};

const initialPosts: PostType[] = [
    {
        id: 1,
        title: "Looking for volunteers for weekend river cleanup",
        content: "We're organizing a river cleanup this Saturday at 10 AM. Gloves and trash bags will be provided. Anyone interested in joining?",
        author: "Emma Rodriguez",
        role: "Local Organizer",
        avatar: "ER",
        category: "Volunteer Opportunities",
        likes: 45,
        comments: [
            { id: 101, author: "John D.", content: "I'll be there! Can I bring a friend?", time: "2 hours ago" },
        ],
        time: "4 hours ago",
    },
    {
        id: 2,
        title: "New city solar initiative announced!",
        content: "The city council just approved a new initiative to heavily subsidize solar panels for local businesses. This is a huge win for local sustainability.",
        author: "Dr. Sarah Chen",
        role: "Climate Researcher",
        avatar: "SC",
        category: "Local Sustainability Projects",
        likes: 112,
        comments: [],
        time: "1 day ago",
    },
    {
        id: 3,
        title: "Is anyone tracking the emissions of the new factory?",
        content: "I've been using GreenLens to analyze the public data for the new industrial park, and the numbers don't seem to match their initial proposals.",
        author: "Mark Thompson",
        role: "Sustainability Journalist",
        avatar: "MT",
        category: "General Discussion",
        likes: 89,
        comments: [
            { id: 102, author: "Alice W.", content: "Yes! I noticed the same discrepancy.", time: "4 hours ago" },
            { id: 103, author: "Tom H.", content: "We should compile our findings and publish a report.", time: "1 hour ago" },
        ],
        time: "2 days ago",
    }
];

const CATEGORIES = ["All", "Volunteer Opportunities", "Local Sustainability Projects", "General Discussion"];

const Community = () => {
    const { toast } = useToast();
    const [posts, setPosts] = useState<PostType[]>(initialPosts);
    const [activeCategory, setActiveCategory] = useState("All");

    // Post Creation State
    const [isCreatingPost, setIsCreatingPost] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newCategory, setNewCategory] = useState("General Discussion");

    // Interaction State
    const [expandedCommentsId, setExpandedCommentsId] = useState<number | null>(null);
    const [newComment, setNewComment] = useState("");

    const filteredPosts = posts.filter(post => !post.isDeleted && (activeCategory === "All" || post.category === activeCategory));

    const handleCreatePost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newContent.trim()) {
            toast({ title: "Validation Error", description: "Title and content are required.", variant: "destructive" });
            return;
        }

        const newPost: PostType = {
            id: Date.now(),
            title: newTitle,
            content: newContent,
            author: "Current User",
            role: "Community Member",
            avatar: "CU",
            category: newCategory,
            likes: 0,
            comments: [],
            time: "Just now",
        };

        setPosts([newPost, ...posts]);
        setIsCreatingPost(false);
        setNewTitle("");
        setNewContent("");
        setNewCategory("General Discussion");
        toast({ title: "Success", description: "Post created successfully!" });
    };

    const handleDeletePost = (id: number) => {
        setPosts(posts.map(post => post.id === id ? { ...post, isDeleted: true } : post));
        toast({ title: "Moderation Action", description: "Post has been removed." });
    };

    const handleLike = (id: number) => {
        setPosts(posts.map(post => {
            if (post.id === id) {
                const isLiked = !!post.userLiked;
                return {
                    ...post,
                    likes: isLiked ? post.likes - 1 : post.likes + 1,
                    userLiked: !isLiked
                };
            }
            return post;
        }));

        const post = posts.find(p => p.id === id);
        if (post && !post.userLiked) {
            toast({
                title: "Upvoted!",
                description: "You've upvoted this post.",
            });
        }
    };

    const handleShare = async (id: number) => {
        const post = posts.find(p => p.id === id);
        if (!post) return;

        const shareData = {
            title: post.title,
            text: post.content,
            url: window.location.href,
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                toast({ title: "Shared!", description: "Post shared successfully." });
            } catch (err) {
                if ((err as Error).name !== "AbortError") {
                    console.error("Error sharing:", err);
                }
            }
        } else {
            // Fallback for browsers that don't support navigator.share
            navigator.clipboard.writeText(window.location.href);
            toast({
                title: "Link copied!",
                description: "The link has been copied to your clipboard.",
            });
        }
    };

    const handleAddComment = (postId: number) => {
        if (!newComment.trim()) return;

        setPosts(posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    comments: [...post.comments, {
                        id: Date.now(),
                        author: "Current User",
                        content: newComment,
                        time: "Just now"
                    }]
                };
            }
            return post;
        }));
        setNewComment("");
    };

    return (
        <div className="min-h-screen bg-muted/30">
            <Navbar />

            <main className="pt-32 pb-16 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

                {/* Main Feed Area */}
                <div className="w-full lg:w-2/3 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h1 className="font-display text-4xl font-bold">Community Board</h1>
                        <button
                            onClick={() => setIsCreatingPost(true)}
                            className="btn-squared flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Create Post
                        </button>
                    </div>

                    {/* Create Post Form */}
                    {isCreatingPost && (
                        <div className="bg-background border border-border p-6 shadow-sm relative animate-in fade-in slide-in-from-top-4 duration-300">
                            <button
                                onClick={() => setIsCreatingPost(false)}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <h2 className="text-xl font-bold mb-4 font-display">Create a New Post</h2>
                            <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
                                <input
                                    type="text"
                                    placeholder="Post Title"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full px-4 py-2 bg-background border border-border focus:outline-none focus:border-primary transition-colors"
                                />
                                <select
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full px-4 py-2 bg-background border border-border focus:outline-none focus:border-primary transition-colors appearance-none"
                                >
                                    {CATEGORIES.filter(c => c !== "All").map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <textarea
                                    placeholder="What are your thoughts?"
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2 bg-background border border-border focus:outline-none focus:border-primary transition-colors resize-none"
                                />
                                <div className="flex justify-end">
                                    <button type="submit" className="btn-squared gap-2">
                                        <PenLine className="w-4 h-4" /> Publish Post
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Feed */}
                    <div className="flex flex-col gap-4">
                        {filteredPosts.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground bg-background border border-border">
                                No posts found in this category.
                            </div>
                        ) : (
                            filteredPosts.map(post => (
                                <div key={post.id} className="bg-background border border-border hover:border-border/80 transition-colors">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center font-bold text-sm overflow-hidden">
                                                    {post.avatar}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold">{post.author} <span className="text-muted-foreground font-normal text-xs ml-2">• {post.time}</span></p>
                                                    <p className="text-xs text-muted-foreground">{post.role} | <span className="text-primary">{post.category}</span></p>
                                                </div>
                                            </div>

                                            {/* Moderation Controls (Simulated for author/admin) */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toast({ title: "Reported", description: "This post has been flagged for review." })}
                                                    className="text-muted-foreground hover:text-amber-500 transition-colors p-1"
                                                    title="Report Post"
                                                >
                                                    <Flag className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePost(post.id)}
                                                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                                    title="Moderate / Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold font-display mb-2">{post.title}</h3>
                                        <p className="text-foreground/80 leading-relaxed mb-6">
                                            {post.content}
                                        </p>

                                        {/* Engagement Bar */}
                                        <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t border-border">
                                            <button
                                                onClick={() => handleLike(post.id)}
                                                className={`flex items-center gap-2 transition-colors font-medium ${post.userLiked ? "text-primary" : "hover:text-primary"}`}
                                            >
                                                <ThumbsUp className={`w-4 h-4 ${post.userLiked ? "fill-primary" : ""}`} />
                                                {post.likes} Upvotes
                                            </button>
                                            <button
                                                onClick={() => setExpandedCommentsId(expandedCommentsId === post.id ? null : post.id)}
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
                                        </div>
                                    </div>

                                    {/* Comments Section */}
                                    {expandedCommentsId === post.id && (
                                        <div className="bg-muted/30 p-6 border-t border-border">
                                            <h4 className="text-sm font-semibold mb-4">Comments</h4>
                                            <div className="space-y-4 mb-4">
                                                {post.comments.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground">No comments yet. Be the first to start the discussion!</p>
                                                ) : (
                                                    post.comments.map(comment => (
                                                        <div key={comment.id} className="bg-background p-4 border border-border text-sm">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="font-semibold">{comment.author}</span>
                                                                <span className="text-muted-foreground text-xs">{comment.time}</span>
                                                            </div>
                                                            <p className="text-foreground/80">{comment.content}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Write a comment..."
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleAddComment(post.id);
                                                    }}
                                                    className="flex-1 px-4 py-2 bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors"
                                                />
                                                <button
                                                    onClick={() => handleAddComment(post.id)}
                                                    className="btn-squared-primary px-4 py-2 text-sm"
                                                >
                                                    Post
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">

                    {/* Categories Card */}
                    <div className="bg-background border border-border p-6 shadow-sm">
                        <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                            Filter by Category
                        </h3>
                        <div className="flex flex-col gap-2">
                            {CATEGORIES.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`text-left px-4 py-3 text-sm font-medium transition-colors border-l-2 ${activeCategory === category
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-transparent text-foreground hover:bg-muted"
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* About Community Card */}
                    <div className="bg-background border border-border p-6 shadow-sm">
                        <h3 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-primary" /> About Community
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                            Welcome to the GreenLens Community Board. This is a place to connect, organize actions,
                            and discuss sustainability issues backed by data.
                        </p>
                        <div className="space-y-2 text-xs text-muted-foreground">
                            <p className="flex justify-between border-b border-border pb-2">
                                <span>Members</span>
                                <span className="font-semibold text-foreground">1,245</span>
                            </p>
                            <p className="flex justify-between border-b border-border pb-2">
                                <span>Online</span>
                                <span className="font-semibold text-foreground">42</span>
                            </p>
                            <p className="flex justify-between pb-1 pt-1">
                                <span>Created</span>
                                <span className="font-semibold text-foreground">Feb 2026</span>
                            </p>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Community;

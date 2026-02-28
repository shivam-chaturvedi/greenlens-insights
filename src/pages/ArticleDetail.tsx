import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Calendar, User, Clock, MessageSquare, ThumbsUp, Share2, Bookmark, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const articles = [
    {
        id: 1,
        title: "The Hidden Gap: Why 40% of Green Claims Don't Add Up",
        content: `
      <p className="mb-6">Despite growing corporate commitments to sustainability, a significant gap remains between public claims and actual environmental impact. A recent investigation into corporate reporting standards has revealed that nearly 40% of green claims made by major organizations are either exaggerated, misleading, or completely unverifiable.</p>
      
      <h2 className="text-2xl font-bold mb-4 mt-8">The Rise of Greenwashing</h2>
      <p className="mb-6">As consumer demand for sustainable products grows, so does the incentive for companies to appear greener than they are. This phenomenon, known as greenwashing, has become increasingly sophisticated. It's often not about outright lies, but rather the selective use of data or vague terminology like "eco-friendly" and "natural" that lack regulated definitions.</p>
      
      <blockquote className="border-l-4 border-primary p-6 bg-muted my-8 italic">
        "Transparency is the only antidote to greenwashing. Without verifiable data, a sustainability claim is just marketing."
      </blockquote>
      
      <h2 className="text-2xl font-bold mb-4 mt-8">What the Data Tells Us</h2>
      <p className="mb-6">Our analysis utilized the GreenLens engine to cross-reference declared climate targets against verified emission datasets. The results were startling. In many cases, companies reported "net-zero" progress while their Scope 3 emissions—the emissions generated in their supply chain—continued to climb at double-digit rates.</p>
      
      <p className="mb-6">To close this gap, we need more than just voluntary reporting. We need standardized, auditable data protocols that allow journalists, researchers, and the public to verify progress in real-time.</p>
    `,
        author: "Anna Panjwani",
        date: "January 2026",
        readTime: "8 min read",
        category: "Investigation",
        likes: 156,
        comments: 24,
        image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&h=600&fit=crop",
    },
    {
        id: 2,
        title: "Schools Leading the Charge: Green School Index 2026",
        content: `
      <p className="mb-6">While global policy changes often move slowly, educational institutions are proving to be dynamic hubs for climate action. The 2026 Green School Index highlights how schools around the world are integrating sustainability into their core operations and curriculum.</p>
      
      <h2 className="text-2xl font-bold mb-4 mt-8">Measuring School Footprints</h2>
      <p className="mb-6">The most successful schools in our index started with one simple step: measurement. By using carbon calculators tailored for campus environments, students and faculty identified that food waste and HVAC systems were their primary emission drivers.</p>
      
      <h2 className="text-2xl font-bold mb-4 mt-8">Education as a Catalyst</h2>
      <p className="mb-6">It's not just about technical fixes. These schools are fostering a new generation of climate-literate leaders. By involving students in the data collection and analysis process, they are turning abstract climate science into a tangible, problem-solving exercise.</p>
    `,
        author: "Research Team",
        date: "January 2026",
        readTime: "12 min read",
        category: "Report",
        likes: 203,
        comments: 18,
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=600&fit=crop",
    },
    {
        id: 3,
        title: "Understanding the 42% Challenge",
        content: `
      <p className="mb-6">The UNEP Emissions Gap Report 2023 set a stark target: to keep global warming below 1.5°C, we must reduce global emissions by 42% by 2030. This is what climate scientists call the '42% Challenge'.</p>
      
      <h2 className="text-2xl font-bold mb-4 mt-8">Breaking Down the Numbers</h2>
      <p className="mb-6">A 42% reduction requires a fundamental shift in every sector of the global economy. It means more than just a transition to renewable energy; it requires a radical rethinking of how we produce food, how we build cities, and how we consume goods.</p>
      
      <p className="mb-6">At GreenLens, we believe that tracking this progress at the organizational level is the only way to ensure we meet the 2030 target. Accountability must move from national pledges to individual balance sheets.</p>
    `,
        author: "Anna Panjwani",
        date: "December 2025",
        readTime: "6 min read",
        category: "Analysis",
        likes: 289,
        comments: 42,
        image: "https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=1200&h=600&fit=crop",
    },
    {
        id: 4,
        title: "From Data to Action: Carbon Literacy for Students",
        content: `
      <p className="mb-6">Carbon literacy is becoming as essential as financial literacy in the 21st century. For students, understanding the relationship between energy use, consumption, and carbon emissions is the first step toward effective advocacy.</p>
      
      <h2 className="text-2xl font-bold mb-4 mt-8">Data-Driven Advocacy</h2>
      <p className="mb-6">We've seen students use emission data to successfully lobby their school boards for solar installations and better waste management systems. When students can point to specific numbers, their voices become impossible to ignore.</p>
    `,
        author: "Education Team",
        date: "December 2025",
        readTime: "10 min read",
        category: "Education",
        likes: 178,
        comments: 31,
        image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&h=600&fit=crop",
    },
    {
        id: 5,
        title: "Net-Zero Promises: A Verification Guide",
        content: `
      <p className="mb-6">As "Net-Zero" becomes a standard corporate catchphrase, the need for rigorous verification has never been greater. This guide provides a framework for researchers and journalists to deconstruct corporate climate pledges.</p>
      
      <h2 className="text-2xl font-bold mb-4 mt-8">Key Verification Steps</h2>
      <p className="mb-6">1. Check Scope 3 Inclusion: Are they counting the emissions of their suppliers and customers? 2. Analyze Offset Strategy: Are they actually reducing emissions, or just paying for offsets that may not be permanent?</p>
    `,
        author: "Anna Panjwani",
        date: "November 2025",
        readTime: "15 min read",
        category: "Guide",
        likes: 412,
        comments: 56,
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop",
    },
    {
        id: 6,
        title: "Appliance-Level Tracking: The Future of Carbon Accounting",
        content: `
      <p className="mb-6">The future of carbon accounting is granular. Moving away from broad estimates, appliance-level tracking allow us to see the real-time energy use of individual devices in homes and offices.</p>
      
      <h2 className="text-2xl font-bold mb-4 mt-8">The Power of Granularity</h2>
      <p className="mb-6">When you know exactly which machine is wasting energy, you can fix it. This level of detail transforms carbon reduction from a guessing game into a precision science.</p>
    `,
        author: "Research Team",
        date: "November 2025",
        readTime: "7 min read",
        category: "Technology",
        likes: 134,
        comments: 15,
        image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&h=600&fit=crop",
    },
];

const ArticleDetail = () => {
    const { id } = useParams();
    const { toast } = useToast();
    const article = articles.find((a) => a.id === Number(id));

    const [likes, setLikes] = useState(article?.likes || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [localComments, setLocalComments] = useState([
        { id: 1, user: "ClimateAdvocate", text: "Great insights! We need more transparency in Scope 3 reporting.", time: "2h ago" },
        { id: 2, user: "EcoStudent", text: "Is there a way to download the raw dataset for this?", time: "5h ago" }
    ]);

    if (!article) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
                    <Link to="/journalism" className="text-primary hover:underline flex items-center gap-2 justify-center">
                        <ArrowLeft className="w-4 h-4" /> Back to Journalism
                    </Link>
                </div>
            </div>
        );
    }

    const handleLike = () => {
        if (isLiked) {
            setLikes(prev => prev - 1);
        } else {
            setLikes(prev => prev + 1);
            toast({
                title: "Liked!",
                description: "You've liked this article.",
            });
        }
        setIsLiked(!isLiked);
    };

    const handleShare = async () => {
        const shareData = {
            title: article.title,
            text: article.content.replace(/<[^>]*>/g, '').substring(0, 100) + "...",
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
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast({
                title: "Link copied!",
                description: "Article link has been copied to your clipboard.",
            });
        }
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
        toast({
            title: isBookmarked ? "Removed from bookmarks" : "Bookmarked!",
            description: isBookmarked ? "Article removed from your saved list." : "Article saved to your bookmarks.",
        });
    };

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        const newComment = {
            id: localComments.length + 1,
            user: "Guest User",
            text: commentText,
            time: "Just now"
        };

        setLocalComments([newComment, ...localComments]);
        setCommentText("");
        toast({
            title: "Comment posted!",
            description: "Your comment has been added successfully.",
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-32 pb-20 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    <Link to="/journalism" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" /> Back to Journalism Hub
                    </Link>

                    {/* Header */}
                    <div className="mb-12">
                        <span className="text-xs font-bold tracking-widest text-primary uppercase mb-4 block">
                            {article.category}
                        </span>
                        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8">
                            {article.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground py-6 border-y border-border">
                            <div className="flex items-center gap-2 text-foreground font-medium">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-4 h-4 text-primary" />
                                </div>
                                {article.author}
                            </div>
                            <div className="flex items-center gap-2 underline decoration-primary/20">
                                <Calendar className="w-4 h-4" />
                                {article.date}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {article.readTime}
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
                                    className={`p-2 rounded-full transition-colors ${isBookmarked ? "bg-primary/20 text-primary" : "hover:bg-muted text-muted-foreground"}`}
                                    title="Bookmark"
                                >
                                    <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-primary" : ""}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="aspect-[21/9] overflow-hidden rounded-lg mb-12 shadow-2xl">
                        <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Article Content */}
                    <div
                        className="prose prose-lg prose-neutral dark:prose-invert max-w-none mb-16"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />

                    {/* Engagement Footer */}
                    <div className="flex items-center justify-between py-8 border-t border-border">
                        <div className="flex items-center gap-8">
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-2 transition-colors group ${isLiked ? "text-primary font-bold" : "hover:text-primary text-muted-foreground"}`}
                            >
                                <ThumbsUp className={`w-5 h-5 ${isLiked ? "fill-primary" : "group-hover:fill-primary/10"}`} />
                                <span>{likes} Likes</span>
                            </button>
                            <button
                                onClick={() => setShowComments(!showComments)}
                                className={`flex items-center gap-2 transition-colors group ${showComments ? "text-primary font-bold" : "hover:text-primary text-muted-foreground"}`}
                            >
                                <MessageSquare className={`w-5 h-5 ${showComments ? "fill-primary/10" : "group-hover:fill-primary/10"}`} />
                                <span>{localComments.length} Comments</span>
                            </button>
                        </div>
                        <button
                            onClick={handleShare}
                            className="btn-squared-outline text-sm"
                        >
                            Share Article
                        </button>
                    </div>

                    {/* Collapsible Comment Section */}
                    {showComments && (
                        <div className="mt-8 p-8 bg-muted/30 border border-border animate-in fade-in slide-in-from-top-4 duration-300">
                            <h3 className="font-display text-xl font-bold mb-6">Discussion</h3>

                            <form onSubmit={handleAddComment} className="mb-8">
                                <div className="relative">
                                    <textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Add to the discussion..."
                                        className="w-full p-4 bg-background border border-border min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-4 bottom-4 p-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>

                            <div className="space-y-6">
                                {localComments.map((comment) => (
                                    <div key={comment.id} className="group">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary uppercase">
                                                {comment.user.charAt(0)}
                                            </div>
                                            <span className="text-sm font-bold">{comment.user}</span>
                                            <span className="text-[10px] text-muted-foreground">{comment.time}</span>
                                        </div>
                                        <p className="text-sm text-foreground ml-9 leading-relaxed">
                                            {comment.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ArticleDetail;

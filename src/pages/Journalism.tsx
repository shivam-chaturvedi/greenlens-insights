import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowUpRight, Calendar, User, Clock, MessageSquare, ThumbsUp, Bookmark, Share2, Filter, Search, TrendingUp, Users, FileText, PenLine } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const articles = [
  {
    id: 1,
    title: "The Hidden Gap: Why 40% of Green Claims Don't Add Up",
    excerpt: "A deep dive into the OECD's findings on misleading sustainability claims and what it means for corporate accountability.",
    author: "Anna Panjwani",
    date: "January 2026",
    readTime: "8 min read",
    category: "Investigation",
    comments: 24,
    likes: 156,
    image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    title: "Schools Leading the Charge: Green School Index 2026",
    excerpt: "How educational institutions are measuring and reducing their carbon footprint, and which ones are setting the standard.",
    author: "Research Team",
    date: "January 2026",
    readTime: "12 min read",
    category: "Report",
    comments: 18,
    likes: 203,
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    title: "Understanding the 42% Challenge",
    excerpt: "Breaking down the UNEP Emissions Gap Report and why we need to cut emissions nearly in half by 2030.",
    author: "Anna Panjwani",
    date: "December 2025",
    readTime: "6 min read",
    category: "Analysis",
    comments: 42,
    likes: 289,
    image: "https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=600&h=400&fit=crop",
  },
  {
    id: 4,
    title: "From Data to Action: Carbon Literacy for Students",
    excerpt: "How young people are using emission data to drive change in their communities and hold institutions accountable.",
    author: "Education Team",
    date: "December 2025",
    readTime: "10 min read",
    category: "Education",
    comments: 31,
    likes: 178,
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&h=400&fit=crop",
  },
  {
    id: 5,
    title: "Net-Zero Promises: A Verification Guide",
    excerpt: "A practical framework for journalists and researchers to verify corporate net-zero commitments.",
    author: "Anna Panjwani",
    date: "November 2025",
    readTime: "15 min read",
    category: "Guide",
    comments: 56,
    likes: 412,
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
  },
  {
    id: 6,
    title: "Appliance-Level Tracking: The Future of Carbon Accounting",
    excerpt: "Why granular emissions data is essential for effective reduction strategies and transparent reporting.",
    author: "Research Team",
    date: "November 2025",
    readTime: "7 min read",
    category: "Technology",
    comments: 15,
    likes: 134,
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=400&fit=crop",
  },
];

const communityPosts = [
  {
    id: 1,
    author: "Dr. Sarah Chen",
    role: "Climate Researcher",
    avatar: "SC",
    content: "Just used GreenLens to audit our university's sustainability claims. The gap score was eye-opening! We're now using this data to push for real policy changes on campus.",
    likes: 89,
    comments: 12,
    time: "2 hours ago",
  },
  {
    id: 2,
    author: "Mark Thompson",
    role: "Sustainability Journalist",
    avatar: "MT",
    content: "The Carbon Calculator helped me fact-check a major corporation's net-zero claims for my latest article. Found a 34% discrepancy between their reported and actual emissions.",
    likes: 156,
    comments: 28,
    time: "5 hours ago",
  },
  {
    id: 3,
    author: "Emma Rodriguez",
    role: "Student Activist",
    avatar: "ER",
    content: "Our high school environmental club is using GreenLens to create monthly sustainability reports. It's amazing to see students become data-driven advocates!",
    likes: 234,
    comments: 45,
    time: "1 day ago",
  },
  {
    id: 4,
    author: "James Liu",
    role: "NGO Director",
    avatar: "JL",
    content: "We've integrated GreenLens into our community workshops. The visual gap analysis makes it so easy to explain greenwashing to everyday citizens.",
    likes: 67,
    comments: 8,
    time: "2 days ago",
  },
];

const categories = ["All", "Investigation", "Report", "Analysis", "Education", "Guide", "Technology"];

const Journalism = () => {
  const [activeTab, setActiveTab] = useState<"articles" | "community">("articles");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = articles.filter(article => {
    const matchesCategory = activeCategory === "All" || article.category === activeCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-medium tracking-widest text-muted-foreground mb-4">
            GREEN JOURNALISM HUB
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            Data-backed{" "}
            <span className="highlight-box">stories</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mb-8">
            Transforming complex emission data into compelling narratives that drive transparency and accountability.
          </p>

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-8 pt-8 border-t border-border">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="font-display text-2xl font-bold">42</p>
                <p className="text-xs text-muted-foreground">Published Articles</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="font-display text-2xl font-bold">1,200+</p>
                <p className="text-xs text-muted-foreground">Community Members</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <div>
                <p className="font-display text-2xl font-bold">50K</p>
                <p className="text-xs text-muted-foreground">Monthly Readers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="px-6 md:px-12 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-primary p-8 md:p-16 text-primary-foreground">
            <span className="text-xs font-medium tracking-widest opacity-70 mb-4 block">FEATURED INVESTIGATION</span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              The Global Accountability Gap: Why Emissions Keep Rising Despite Pledges
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-3xl mb-8">
              An in-depth investigation into why global greenhouse gas emissions continue to rise despite unprecedented commitments, and what it will take to close the gap.
            </p>
            <div className="flex flex-wrap items-center gap-6 mb-8 text-sm opacity-70">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Anna Panjwani
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                January 2026
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                20 min read
              </span>
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                89 comments
              </span>
            </div>
            <button className="px-6 py-3 bg-primary-foreground text-primary font-semibold inline-flex items-center gap-2 hover:bg-primary-foreground/90 transition-colors">
              Read Full Report
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="px-6 md:px-12 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-0 border-b border-border">
            <button
              onClick={() => setActiveTab("articles")}
              className={`px-6 py-4 font-medium text-sm tracking-wide transition-colors relative ${
                activeTab === "articles"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                ARTICLES
              </span>
              {activeTab === "articles" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("community")}
              className={`px-6 py-4 font-medium text-sm tracking-wide transition-colors relative ${
                activeTab === "community"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                COMMUNITY
              </span>
              {activeTab === "community" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>
        </div>
      </section>

      {activeTab === "articles" ? (
        <>
          {/* Search and Filter */}
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

          {/* Articles Grid */}
          <section className="section-padding bg-muted">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-12">
                <h2 className="font-display text-3xl font-bold">Latest Articles</h2>
                <p className="text-sm text-muted-foreground">{filteredArticles.length} articles found</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                {filteredArticles.map((article) => (
                  <article
                    key={article.id}
                    className="bg-background group cursor-pointer"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <span className="text-xs font-medium tracking-widest text-muted-foreground mb-3 block">
                        {article.category.toUpperCase()}
                      </span>
                      <h3 className="font-display text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {article.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {article.comments}
                          </span>
                        </div>
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-12">
                <button className="btn-squared-outline inline-flex items-center gap-2">
                  Load More Articles
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Community Section */}
          <section className="section-padding bg-muted">
            <div className="max-w-7xl mx-auto">
              {/* Community Header */}
              <div className="bg-background p-8 mb-8">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-bold mb-2">Join the Conversation</h2>
                    <p className="text-muted-foreground">Share your sustainability insights, research, and discoveries with our community.</p>
                  </div>
                  <button className="btn-squared flex items-center gap-2">
                    <PenLine className="w-4 h-4" />
                    Create Post
                  </button>
                </div>
              </div>

              {/* Community Posts */}
              <div className="space-y-1">
                {communityPosts.map((post) => (
                  <div key={post.id} className="bg-background p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm flex-shrink-0">
                        {post.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold">{post.author}</span>
                          <span className="text-xs text-muted-foreground px-2 py-1 bg-muted">{post.role}</span>
                          <span className="text-xs text-muted-foreground">{post.time}</span>
                        </div>
                        <p className="text-foreground leading-relaxed mb-4">{post.content}</p>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <button className="flex items-center gap-2 hover:text-primary transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                            {post.likes}
                          </button>
                          <button className="flex items-center gap-2 hover:text-primary transition-colors">
                            <MessageSquare className="w-4 h-4" />
                            {post.comments}
                          </button>
                          <button className="flex items-center gap-2 hover:text-primary transition-colors">
                            <Bookmark className="w-4 h-4" />
                            Save
                          </button>
                          <button className="flex items-center gap-2 hover:text-primary transition-colors">
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-8">
                <button className="btn-squared-outline inline-flex items-center gap-2">
                  Load More Posts
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Community Guidelines */}
          <section className="px-6 md:px-12 py-16 bg-background">
            <div className="max-w-3xl mx-auto">
              <h3 className="font-display text-xl font-bold mb-4">Community Guidelines</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-primary mt-2 flex-shrink-0"></div>
                  <p>Share data-backed insights and cite your sources</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-primary mt-2 flex-shrink-0"></div>
                  <p>Be respectful and constructive in discussions</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-primary mt-2 flex-shrink-0"></div>
                  <p>Focus on accountability, not blame</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-primary mt-2 flex-shrink-0"></div>
                  <p>Collaborate to find solutions together</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Resources Section */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl font-bold mb-12 text-center">Resources for Writers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            <div className="bg-muted p-8">
              <FileText className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">Style Guide</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Our editorial standards for data-driven environmental journalism.
              </p>
              <button className="text-sm font-medium flex items-center gap-2 hover:text-primary transition-colors">
                Download PDF <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="bg-muted p-8">
              <TrendingUp className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">Data Access</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Request access to our emission datasets for your research and articles.
              </p>
              <button className="text-sm font-medium flex items-center gap-2 hover:text-primary transition-colors">
                Request Access <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="bg-muted p-8">
              <PenLine className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">Submit a Story</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Pitch your sustainability story idea to our editorial team.
              </p>
              <button className="text-sm font-medium flex items-center gap-2 hover:text-primary transition-colors">
                Submit Pitch <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Submit Story CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Have a story to tell?
          </h2>
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
            <button className="px-6 py-3 border border-primary-foreground text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary-foreground/10 transition-colors">
              Join Newsletter
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Journalism;

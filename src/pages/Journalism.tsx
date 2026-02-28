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

const categories = ["All", "Investigation", "Report", "Analysis", "Education", "Guide", "Technology"];

const Journalism = () => {
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
          </div>
        </div>
      </section>



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
                  className={`px-4 py-2 text-xs font-medium tracking-wide transition-colors ${activeCategory === category
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
              <Link
                key={article.id}
                to={`/journalism/${article.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-background group cursor-pointer block"
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
              </Link>
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

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Journalism;

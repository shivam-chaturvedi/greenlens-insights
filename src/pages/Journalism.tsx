import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowUpRight, Calendar, User, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const articles = [
  {
    id: 1,
    title: "The Hidden Gap: Why 40% of Green Claims Don't Add Up",
    excerpt: "A deep dive into the OECD's findings on misleading sustainability claims and what it means for corporate accountability.",
    author: "Anna Panjwani",
    date: "January 2024",
    readTime: "8 min read",
    category: "Investigation",
  },
  {
    id: 2,
    title: "Schools Leading the Charge: Green School Index 2024",
    excerpt: "How educational institutions are measuring and reducing their carbon footprint, and which ones are setting the standard.",
    author: "Research Team",
    date: "January 2024",
    readTime: "12 min read",
    category: "Report",
  },
  {
    id: 3,
    title: "Understanding the 42% Challenge",
    excerpt: "Breaking down the UNEP Emissions Gap Report and why we need to cut emissions nearly in half by 2030.",
    author: "Anna Panjwani",
    date: "December 2023",
    readTime: "6 min read",
    category: "Analysis",
  },
  {
    id: 4,
    title: "From Data to Action: Carbon Literacy for Students",
    excerpt: "How young people are using emission data to drive change in their communities and hold institutions accountable.",
    author: "Education Team",
    date: "December 2023",
    readTime: "10 min read",
    category: "Education",
  },
  {
    id: 5,
    title: "Net-Zero Promises: A Verification Guide",
    excerpt: "A practical framework for journalists and researchers to verify corporate net-zero commitments.",
    author: "Anna Panjwani",
    date: "November 2023",
    readTime: "15 min read",
    category: "Guide",
  },
  {
    id: 6,
    title: "Appliance-Level Tracking: The Future of Carbon Accounting",
    excerpt: "Why granular emissions data is essential for effective reduction strategies and transparent reporting.",
    author: "Research Team",
    date: "November 2023",
    readTime: "7 min read",
    category: "Technology",
  },
];

const Journalism = () => {
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
          <p className="text-muted-foreground text-xl max-w-2xl">
            Transforming complex emission data into compelling narratives that drive transparency and accountability.
          </p>
        </div>
      </section>

      {/* Featured Article */}
      <section className="px-6 md:px-12 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-primary p-8 md:p-16 text-primary-foreground">
            <span className="text-xs font-medium tracking-widest opacity-70 mb-4 block">FEATURED</span>
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
                January 2024
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                20 min read
              </span>
            </div>
            <button className="px-6 py-3 bg-primary-foreground text-primary font-semibold inline-flex items-center gap-2 hover:bg-primary-foreground/90 transition-colors">
              Read Full Report
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="section-padding bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="font-display text-3xl font-bold">Latest Articles</h2>
            <select className="px-4 py-2 bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option>All Categories</option>
              <option>Investigation</option>
              <option>Report</option>
              <option>Analysis</option>
              <option>Education</option>
              <option>Guide</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-background p-8 hover:bg-secondary transition-colors group cursor-pointer"
              >
                <span className="text-xs font-medium tracking-widest text-muted-foreground mb-4 block">
                  {article.category.toUpperCase()}
                </span>
                <h3 className="font-display text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{article.author}</span>
                  <span>{article.readTime}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Submit Story CTA */}
      <section className="section-padding">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Have a story to tell?
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            We're always looking for data-driven stories about sustainability, greenwashing, and climate accountability. Submit your pitch.
          </p>
          <Link
            to="/about"
            className="btn-squared-outline inline-flex items-center gap-2"
          >
            Contact Us
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Journalism;

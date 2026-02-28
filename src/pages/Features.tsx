import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BarChart3, Shield, Users, BookOpen, Target, Globe, Zap, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Multi-Level Carbon Tracking",
    description: "Measure emissions at appliance, machine, department, organizational, and individual levels. Get complete visibility into your carbon footprint with granular data that matters.",
    highlights: ["Appliance-level tracking", "Department aggregation", "Organizational totals"],
  },

  {
    icon: Shield,
    title: "AI-Guided Reduction Insights",
    description: "Receive rule-based recommendations to reduce emissions through optimization, efficiency improvements, and cleaner alternatives.",
    highlights: ["Optimization tips", "Efficiency analysis", "Alternative suggestions"],
  },
  {
    icon: BookOpen,
    title: "Green Journalism Tools",
    description: "Transform complex emission data into compelling public-facing narratives. Perfect for journalists, researchers, and communicators.",
    highlights: ["Data storytelling", "Visual exports", "Public reports"],
  },
  {
    icon: Users,
    title: "Education-First Design",
    description: "Carbon literacy modules built for students, educators, and NGOs. Learn while you track with guided educational content.",
    highlights: ["Interactive learning", "Student modules", "Educator resources"],
  },
  {
    icon: Globe,
    title: "Global Accountability",
    description: "Track and compare sustainability efforts across institutions. Transparent leaderboards drive healthy competition for improvement.",
    highlights: ["Green School Index", "Org rankings", "Benchmarking"],
  },

];

const Features = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-medium tracking-widest text-muted-foreground mb-4">
            PLATFORM CAPABILITIES
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            Features built for{" "}
            <span className="highlight-box">transparency</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl">
            Everything you need to measure, verify, and communicate real climate action. No greenwashing allowed.
          </p>
        </div>
      </section>

      {/* Features List */}
      <section className="section-padding bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-1">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-background p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start hover:bg-secondary transition-colors"
              >
                <div className="flex items-start gap-4">
                  <feature.icon className="w-8 h-8 text-primary flex-shrink-0" />
                  <h3 className="font-display text-2xl font-semibold">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {feature.highlights.map((highlight, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium px-3 py-1 bg-muted text-foreground"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Start calculating your emissions today and take the first step toward verified climate action.
          </p>
          <Link
            to="/calculator"
            className="btn-squared-primary inline-flex items-center gap-2"
          >
            Launch Calculator
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;

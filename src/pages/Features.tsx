import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BarChart3, Shield, Users, BookOpen, Target, Globe, Zap, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Sustainability Consulting",
    description: (
      <>
        <strong>Breaking down the barriers that prevent organizations from taking action.</strong>
        <br />
        We provide free on-site sustainability assessments for businesses, clinics, and community organizations, identifying practical opportunities to reduce costs, improve efficiency, and lower emissions.
      </>
    ),
    highlights: ["Appliance-level tracking", "Department aggregation", "Organizational totals"],
  },

  {
    icon: Shield,
    title: "Community Action Network",
    description: (
      <>
        <strong>Connecting people with opportunities to make a difference.</strong>
        <br />
        Our community forum highlights volunteer opportunities, local initiatives, environmental events, and collaborative projects that empower residents to create change where they live.
      </>
    ),
    highlights: ["Optimization tips", "Efficiency analysis", "Alternative suggestions"],
  },
  {
    icon: BookOpen,
    title: "Sustainability Research & Analytics",
    description: (
      <>
        <strong>Using data to uncover what works.</strong>
        <br />
        Through quantitative research, including our Fairfax County school sustainability index, we identify sustainability leaders, investigate best practices, and generate insights that can guide future action.
      </>
    ),
    highlights: ["Data storytelling", "Visual exports", "Public reports"],
  },
  {
    icon: Users,
    title: "Household Sustainability Resources",
    description: (
      <>
        <strong>Helping families save money while reducing their environmental impact.</strong>
        <br />
        We connect homeowners with practical strategies, rebates, incentives, and efficiency improvements that lower utility costs and emissions at the same time.
      </>
    ),
    highlights: ["Interactive learning", "Student modules", "Educator resources"],
  },
  {
    icon: Globe,
    title: "Climate Education & Awareness",
    description: (
      <>
        <strong>Transforming information into action.</strong>
        <br />
        Through blogs, guides, tools, and educational content, we make climate, sustainability, and environmental topics accessible, empowering individuals to make informed decisions in their daily lives.
      </>
    ),
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

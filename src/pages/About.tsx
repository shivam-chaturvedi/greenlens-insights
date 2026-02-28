import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowUpRight, Target, Users, Lightbulb, Award } from "lucide-react";
import { Link } from "react-router-dom";

const timeline = [
  { month: "Month 1", phase: "Research", description: "Study emission standards and define sustainability gap framework.", progress: 25 },
  { month: "Month 2", phase: "Build", description: "Develop tracking modules, analytics, and gap scoring logic.", progress: 40 },
  { month: "Month 3", phase: "Testing", description: "Pilot with sample users and validate accuracy.", progress: 25 },
  { month: "Month 4", phase: "Documentation", description: "Impact analysis and admissions-ready portfolio.", progress: 10 },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-medium tracking-widest text-muted-foreground mb-4">
            ABOUT GREENLENS
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            Turning claims into{" "}
            <span className="highlight-box">action</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-3xl">
            GreenLens is a web-based sustainability analytics and accountability platform that transforms sustainability from claims-based marketing into measurable, auditable action.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                The Problem
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Despite growing awareness of climate change, most individuals and organizations lack clear, trustworthy tools to measure real carbon emissions and verify sustainability claims.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                According to the UNEP Emissions Gap Report 2023, global greenhouse gas emissions must fall by 42% by 2030 to meet the 1.5°C target, yet emissions continue to rise due to weak monitoring and accountability.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                The OECD Greenwashing Report 2022 highlights that over 40% of sustainability claims made by organizations are misleading, exaggerated, or unverifiable, eroding public trust.
              </p>
            </div>
            <div className="space-y-6">
              {[
                { icon: Target, title: "Fragmented calculators", desc: "Limited scope, individual-only focus" },
                { icon: Users, title: "No claim verification", desc: "Marketing claims go unchecked" },
                { icon: Lightbulb, title: "Poor accessibility", desc: "Tools not built for schools or students" },
                { icon: Award, title: "Weak literacy", desc: "Environmental education gaps persist" },
              ].map((item, index) => (
                <div key={index} className="flex gap-4 p-6 bg-background">
                  <item.icon className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Creator */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-sm font-medium tracking-widest text-muted-foreground mb-4">
                PROJECT CREATOR
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Anna Panjwani
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                A systems thinker tackling climate accountability through technology, data analytics, and transparent governance. This project demonstrates strong analytical skills, understanding of climate policy, and leadership in environmental literacy.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                The project aligns with future pathways in Environmental Science, Climate Policy, Data Science, Computer Science, Economics, or Public Policy—presenting a globally relevant and intellectually mature profile.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Climate Policy", "Data Analytics", "Environmental Science", "Governance"].map((tag) => (
                  <span key={tag} className="text-xs font-medium px-3 py-1 bg-muted text-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2 bg-muted p-12 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-primary/10 mx-auto mb-6 flex items-center justify-center">
                  <span className="font-display text-4xl font-bold text-primary">AP</span>
                </div>
                <p className="text-sm text-muted-foreground">Scholar & Developer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-12 text-center">
            Project Timeline
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
            {timeline.map((item, index) => (
              <div key={index} className="p-8 bg-primary-foreground/5 border border-primary-foreground/10">
                <div className="text-sm font-medium opacity-60 mb-2">{item.month}</div>
                <h3 className="font-display text-xl font-semibold mb-3">{item.phase}</h3>
                <p className="text-sm opacity-70 mb-4">{item.description}</p>
                <div className="flex items-center gap-2">
                  <div className="h-1 flex-1 bg-primary-foreground/20">
                    <div className="h-full bg-primary-foreground" style={{ width: `${item.progress}%` }} />
                  </div>
                  <span className="text-xs font-medium">{item.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deliverables */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-12">
            Project Deliverables
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "Live GreenLens web platform",
              "Individual and organizational carbon calculators",
              "Report generation system (PDF)",
              "Green journalism content hub",
              "Pilot impact and transparency report",
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-6 border border-border hover:bg-muted transition-colors">
                <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-display font-bold">
                  {index + 1}
                </div>
                <p className="font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-muted">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Get Involved
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Whether you're an educator, researcher, journalist, or organization looking to verify your sustainability claims—we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/calculator"
              className="btn-squared-primary inline-flex items-center justify-center gap-2"
            >
              Try the Platform
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <a
              href="mailto:contact@greenlens.org"
              className="btn-squared-outline inline-flex items-center justify-center gap-2"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;

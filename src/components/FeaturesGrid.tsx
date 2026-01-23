import { BarChart3, Shield, Users, BookOpen, Target, Globe } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Multi-Level Carbon Tracking",
    description: "Measure emissions at appliance, machine, department, organizational, and individual levels for complete visibility.",
  },
  {
    icon: Target,
    title: "Sustainability Gap Analyzer",
    description: "Compare declared net-zero claims against real emission data to produce a clear Sustainability Gap Score.",
  },
  {
    icon: Shield,
    title: "AI-Guided Reduction Insights",
    description: "Get rule-based recommendations to reduce emissions through optimization, efficiency, and alternatives.",
  },
  {
    icon: BookOpen,
    title: "Green Journalism Tools",
    description: "Convert complex emission data into compelling public-facing narratives and transparent reports.",
  },
  {
    icon: Users,
    title: "Education-First Design",
    description: "Carbon literacy modules built for students, educators, NGOs, and anyone committed to learning.",
  },
  {
    icon: Globe,
    title: "Global Accountability",
    description: "Track and compare sustainability efforts across institutions with transparent leaderboards.",
  },
];

const FeaturesGrid = () => {
  return (
    <section className="section-padding bg-muted">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-16">
          <p className="text-sm font-medium tracking-widest text-muted-foreground mb-4">
            KEY CAPABILITIES
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold max-w-3xl">
            Everything you need for transparent climate accountability
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-squared bg-background hover:bg-secondary transition-colors duration-300 group"
            >
              <feature.icon className="w-8 h-8 text-primary mb-6 group-hover:text-accent transition-colors" />
              <h3 className="font-display text-xl font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;

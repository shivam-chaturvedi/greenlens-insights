import { BarChart3, Shield, Users, BookOpen, Target, Globe } from "lucide-react";

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
  },
  {
    icon: Target,
    title: "Action Plans & Impact Reports",
    description: (
      <>
        <strong>Turning sustainability goals into measurable results.</strong>
        <br />
        Every consultation is supported by data-driven recommendations, implementation strategies, financial analyses, and emissions reduction estimates that make sustainability both achievable and financially beneficial.
      </>
    ),
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
            Our Initiatives to Save Money and Reduce Emissions
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

import { Calculator, Building, User, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const calculatorTypes = [
  {
    icon: User,
    title: "Individual",
    description: "Track your personal carbon footprint from daily activities, travel, and consumption.",
  },
  {
    icon: Building,
    title: "Organizational",
    description: "Comprehensive consulting for businesses, schools, and institutions at every level.",
  },
  {
    icon: Zap,
    title: "Community Forum",
    description: "Utilize the community forum to find opportunities for volunteering  and being more sustainable",
  },
];

const CalculatorPreview = () => {
  return (
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5" />
            <p className="text-sm font-medium tracking-widest opacity-70">
              CARBON CALCULATOR
            </p>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Calculate Emissions and Find Opportunities at Every Scale
          </h2>
          <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
            From individual actions to community initiatives operations, get accurate carbon accounting and find opportunities that matter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mb-12">
          {calculatorTypes.map((type, index) => (
            <div
              key={index}
              className="p-8 bg-primary-foreground/5 border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-colors"
            >
              <type.icon className="w-8 h-8 mb-6 opacity-90" />
              <h3 className="font-display text-xl font-semibold mb-3">
                {type.title}
              </h3>
              <p className="text-primary-foreground/70 leading-relaxed">
                {type.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/calculator"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-foreground text-primary font-semibold hover:bg-primary-foreground/90 transition-colors"
          >
            Start Calculating
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CalculatorPreview;

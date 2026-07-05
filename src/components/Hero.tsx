import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center pt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
        <div className="text-center max-w-5xl mx-auto">
          {/* Main Headline */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-8 animate-fade-in">
            Solutions-orientated.
            <br />
            <span className="highlight-box">Community-focused.</span>
            <br />
            Action-driven.
          </h1>

          {/* Subheadline */}
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Project Green Lens aims to transform sustainability consulting and research into quantifiable data, empowering businesses, homeowners, schools, and students to drive real climate action.
          </p>

          {/* CTA Button */}
          <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Link
              to="/calculator"
              className="btn-squared-outline inline-flex items-center gap-3 text-base md:text-lg px-8 py-4"
            >
              Start Calculating
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

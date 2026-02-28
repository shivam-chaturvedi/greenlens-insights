import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="bg-muted p-12 md:p-20 text-center">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Ready to{" "}
            <span className="highlight-box">verify</span>
            {" "}your impact?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
            Join schools, organizations, and journalists using GreenLens to drive transparent climate accountability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/calculator"
              className="btn-squared-primary inline-flex items-center justify-center gap-2 text-base"
            >
              Start Calculating
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              to="/about"
              className="btn-squared-outline inline-flex items-center justify-center gap-2 text-base"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

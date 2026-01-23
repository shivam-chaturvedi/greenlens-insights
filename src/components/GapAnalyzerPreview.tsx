import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const GapAnalyzerPreview = () => {
  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div>
            <p className="text-sm font-medium tracking-widest text-muted-foreground mb-4">
              SUSTAINABILITY GAP ANALYZER
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Claims vs. Reality.
              <br />
              <span className="text-gradient">See the gap.</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Over 40% of organizational sustainability claims are misleading or unverifiable. GreenLens bridges the gap between what's promised and what's delivered, creating accountability at every level.
            </p>

            <div className="space-y-4 mb-10">
              {[
                "Compare declared targets against actual emissions",
                "Generate color-coded risk assessments",
                "Track progress over time with visual trends",
                "Export verified reports for stakeholders",
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>

            <Link
              to="/gap-analyzer"
              className="btn-squared-primary inline-flex items-center gap-2"
            >
              Try Gap Analyzer
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Visual Preview */}
          <div className="bg-muted p-8 lg:p-12">
            <div className="space-y-6">
              {/* Mock Gap Score */}
              <div className="bg-background p-6 border border-border">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-muted-foreground">SUSTAINABILITY GAP SCORE</span>
                  <span className="text-xs px-3 py-1 bg-accent text-accent-foreground font-medium">MODERATE</span>
                </div>
                <div className="text-5xl font-display font-bold text-foreground mb-2">32%</div>
                <p className="text-sm text-muted-foreground">Gap between claimed and verified emissions</p>
              </div>

              {/* Mock Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Claimed Reduction</span>
                    <span className="font-medium">50%</span>
                  </div>
                  <div className="h-3 bg-background">
                    <div className="h-full bg-primary" style={{ width: "50%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Verified Reduction</span>
                    <span className="font-medium">18%</span>
                  </div>
                  <div className="h-3 bg-background">
                    <div className="h-full bg-gradient-accent" style={{ width: "18%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GapAnalyzerPreview;

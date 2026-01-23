import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowUpRight, AlertTriangle, CheckCircle, Info } from "lucide-react";

const GapAnalyzer = () => {
  const [orgName, setOrgName] = useState("");
  const [claimedReduction, setClaimedReduction] = useState("");
  const [actualEmissions, setActualEmissions] = useState("");
  const [baselineEmissions, setBaselineEmissions] = useState("");
  const [showResults, setShowResults] = useState(false);

  const calculateGap = () => {
    if (orgName && claimedReduction && actualEmissions && baselineEmissions) {
      setShowResults(true);
    }
  };

  const claimed = parseFloat(claimedReduction) || 0;
  const actual = parseFloat(actualEmissions) || 0;
  const baseline = parseFloat(baselineEmissions) || 100;
  const actualReduction = baseline > 0 ? ((baseline - actual) / baseline) * 100 : 0;
  const gap = Math.max(0, claimed - actualReduction);

  const getGapLevel = () => {
    if (gap < 10) return { label: "LOW", color: "bg-primary", icon: CheckCircle };
    if (gap < 30) return { label: "MODERATE", color: "bg-accent", icon: Info };
    return { label: "HIGH", color: "bg-destructive", icon: AlertTriangle };
  };

  const gapLevel = getGapLevel();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-medium tracking-widest text-muted-foreground mb-4">
            SUSTAINABILITY GAP ANALYZER
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            Claims vs.{" "}
            <span className="highlight-box">Reality</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl">
            Compare what organizations claim about their sustainability efforts against verified emission data. Expose the gap.
          </p>
        </div>
      </section>

      {/* Analyzer Tool */}
      <section className="section-padding bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Input Form */}
            <div className="bg-background p-8 md:p-12 border border-border">
              <h2 className="font-display text-2xl font-bold mb-8">Enter Data</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Organization Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Enter organization name"
                    className="w-full px-4 py-3 bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Claimed Emission Reduction (%)</label>
                  <input
                    type="number"
                    value={claimedReduction}
                    onChange={(e) => setClaimedReduction(e.target.value)}
                    placeholder="e.g., 50"
                    className="w-full px-4 py-3 bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Baseline Emissions (tons CO₂e)</label>
                  <input
                    type="number"
                    value={baselineEmissions}
                    onChange={(e) => setBaselineEmissions(e.target.value)}
                    placeholder="e.g., 1000"
                    className="w-full px-4 py-3 bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Current Actual Emissions (tons CO₂e)</label>
                  <input
                    type="number"
                    value={actualEmissions}
                    onChange={(e) => setActualEmissions(e.target.value)}
                    placeholder="e.g., 800"
                    className="w-full px-4 py-3 bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <button
                  onClick={calculateGap}
                  className="w-full btn-squared-primary flex items-center justify-center gap-2"
                >
                  Analyze Gap
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="bg-background p-8 md:p-12 border border-border">
              <h2 className="font-display text-2xl font-bold mb-8">Analysis Results</h2>
              
              {!showResults ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>Enter data and click "Analyze Gap" to see results</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Gap Score */}
                  <div className="p-6 bg-muted">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-medium text-muted-foreground">SUSTAINABILITY GAP SCORE</span>
                      <span className={`text-xs px-3 py-1 ${gapLevel.color} text-primary-foreground font-medium flex items-center gap-1`}>
                        <gapLevel.icon className="w-3 h-3" />
                        {gapLevel.label}
                      </span>
                    </div>
                    <div className="text-6xl font-display font-bold text-foreground mb-2">
                      {gap.toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Gap between claimed and verified reduction for {orgName}
                    </p>
                  </div>

                  {/* Comparison Bars */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Claimed Reduction</span>
                        <span className="font-medium">{claimed.toFixed(1)}%</span>
                      </div>
                      <div className="h-4 bg-muted">
                        <div className="h-full bg-foreground" style={{ width: `${Math.min(100, claimed)}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Verified Reduction</span>
                        <span className="font-medium">{actualReduction.toFixed(1)}%</span>
                      </div>
                      <div className="h-4 bg-muted">
                        <div className="h-full bg-gradient-accent" style={{ width: `${Math.min(100, actualReduction)}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-4 border border-border">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">{orgName}</strong> claims a {claimed}% emission reduction, 
                      but verified data shows only {actualReduction.toFixed(1)}% reduction from their baseline of {baseline} tons CO₂e.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-12 text-center">
            How the Gap Analyzer Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Input Claims", description: "Enter the organization's stated sustainability targets and reduction claims." },
              { step: "02", title: "Verify Data", description: "Add verified emission data from reliable sources and measurements." },
              { step: "03", title: "See the Gap", description: "Get a clear Gap Score showing the difference between claims and reality." },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-6xl font-display font-bold text-muted-foreground/30 mb-4">
                  {item.step}
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GapAnalyzer;

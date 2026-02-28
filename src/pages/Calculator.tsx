import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowUpRight, Car, Zap, Plane, Home, Utensils, ShoppingBag, Info } from "lucide-react";

const categories = [
  { id: "transport", label: "Transportation", icon: Car },
  { id: "energy", label: "Home Energy", icon: Zap },
  { id: "travel", label: "Air Travel", icon: Plane },
  { id: "home", label: "Housing", icon: Home },
  { id: "food", label: "Food", icon: Utensils },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
];

const Calculator = () => {
  const [activeTab, setActiveTab] = useState("transport");
  const [values, setValues] = useState({
    carMiles: "",
    publicTransit: "",
    electricityKwh: "",
    gasUsage: "",
    flightHours: "",
    homeSize: "",
    meatMeals: "",
    shoppingSpend: "",
  });
  const [showResults, setShowResults] = useState(false);

  const handleChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const calculateEmissions = () => {
    setShowResults(true);
  };

  // Simplified calculation factors (kg CO2e)
  const carEmissions = (parseFloat(values.carMiles) || 0) * 0.4 * 52; // per week -> year
  const transitEmissions = (parseFloat(values.publicTransit) || 0) * 0.1 * 52;
  const electricityEmissions = (parseFloat(values.electricityKwh) || 0) * 0.42 * 12;
  const gasEmissions = (parseFloat(values.gasUsage) || 0) * 5.3 * 12;
  const flightEmissions = (parseFloat(values.flightHours) || 0) * 250;
  const homeEmissions = (parseFloat(values.homeSize) || 0) * 0.5;
  const foodEmissions = (parseFloat(values.meatMeals) || 0) * 3 * 52;
  const shoppingEmissions = (parseFloat(values.shoppingSpend) || 0) * 0.02 * 12;

  const totalEmissions = (
    carEmissions +
    transitEmissions +
    electricityEmissions +
    gasEmissions +
    flightEmissions +
    homeEmissions +
    foodEmissions +
    shoppingEmissions
  ) / 1000; // Convert to tons

  const breakdown = [
    { name: "Transportation", value: (carEmissions + transitEmissions) / 1000 },
    { name: "Home Energy", value: (electricityEmissions + gasEmissions) / 1000 },
    { name: "Air Travel", value: flightEmissions / 1000 },
    { name: "Food", value: foodEmissions / 1000 },
    { name: "Shopping", value: shoppingEmissions / 1000 },
  ].filter((item) => item.value > 0);

  const maxValue = Math.max(...breakdown.map((b) => b.value), 1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-medium tracking-widest text-muted-foreground mb-4">
            CARBON CALCULATOR
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            Know your{" "}
            <span className="highlight-box">footprint</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl">
            Calculate your personal or organizational carbon emissions across all major categories. Start measuring what matters.
          </p>
        </div>
      </section>

      {/* Info Section */}
      <section className="px-6 md:px-12 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 lg:p-8 flex gap-4 items-start">
            <Info className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-display text-lg font-bold mb-3 text-foreground">How this Calculator Works</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                This tool breaks down carbon emissions into identifiable, everyday actions to help you understand personal or organizational impact. Select a category from the left menu (e.g., Transportation) and enter your weekly/monthly data. Click "Calculate Emissions" to see your annual carbon footprint generated in tons of CO₂ equivalent (CO₂e).
              </p>

              <div className="bg-background rounded-md p-4 border border-border">
                <h4 className="text-xs font-bold text-foreground mb-4 uppercase tracking-wide border-b border-border pb-2">Data Sources & Methodology</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {/* Transportation Card */}
                  <div className="bg-background/50 backdrop-blur-sm p-6 border border-border group hover:border-primary/30 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary/10 text-primary">
                        <Car className="w-4 h-4" />
                      </div>
                      <h5 className="font-display font-bold text-foreground">Transportation</h5>
                    </div>
                    <ul className="space-y-4">
                      <li>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Car Travel</p>
                        <p className="text-sm text-foreground font-medium mb-1">Miles/wk × 0.4 kg CO₂e × 52w</p>
                        <p className="text-[10px] leading-relaxed text-muted-foreground italic bg-muted/30 p-2 border-l-2 border-primary/20">
                          Based on the <a href="https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle" target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline decoration-primary/30 underline-offset-2">EPA passenger vehicle average</a> (400g/mile).
                        </p>
                      </li>
                      <li>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Public Transit</p>
                        <p className="text-sm text-foreground font-medium mb-1">Trips/wk × 0.1 kg CO₂e × 52w</p>
                        <p className="text-[10px] leading-relaxed text-muted-foreground italic bg-muted/30 p-2 border-l-2 border-primary/20">
                          Aggregated from <a href="https://www.apta.com/research-technical-resources/research-reports/public-transportations-role-in-responding-to-climate-change/" target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline decoration-primary/30 underline-offset-2">APTA public transit data</a>.
                        </p>
                      </li>
                      <li>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Flights</p>
                        <p className="text-sm text-foreground font-medium mb-1">Hours/yr × 250 kg CO₂e</p>
                        <p className="text-[10px] leading-relaxed text-muted-foreground italic bg-muted/30 p-2 border-l-2 border-primary/20">
                          Factoring radiative forcing per <a href="https://theicct.org/aviation-emissions-data-and-analysis/" target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline decoration-primary/30 underline-offset-2">ICCT aviation research</a>.
                        </p>
                      </li>
                    </ul>
                  </div>

                  {/* Energy Card */}
                  <div className="bg-background/50 backdrop-blur-sm p-6 border border-border group hover:border-primary/30 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary/10 text-primary">
                        <Zap className="w-4 h-4" />
                      </div>
                      <h5 className="font-display font-bold text-foreground">Energy & Housing</h5>
                    </div>
                    <ul className="space-y-4">
                      <li>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Electricity</p>
                        <p className="text-sm text-foreground font-medium mb-1">kWh/mo × 0.42 kg CO₂e × 12m</p>
                        <p className="text-[10px] leading-relaxed text-muted-foreground italic bg-muted/30 p-2 border-l-2 border-primary/20">
                          Standard national grid average via <a href="https://www.epa.gov/egrid" target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline decoration-primary/30 underline-offset-2">EPA eGRID</a>.
                        </p>
                      </li>
                      <li>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Natural Gas</p>
                        <p className="text-sm text-foreground font-medium mb-1">Therms/mo × 5.3 kg CO₂e × 12m</p>
                        <p className="text-[10px] leading-relaxed text-muted-foreground italic bg-muted/30 p-2 border-l-2 border-primary/20">
                          Direct physical conversion factor (<a href="https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references" target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline decoration-primary/30 underline-offset-2">EPA standard</a>).
                        </p>
                      </li>
                      <li>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Housing Size</p>
                        <p className="text-sm text-foreground font-medium mb-1">Sq ft × 0.5 kg CO₂e</p>
                        <p className="text-[10px] leading-relaxed text-muted-foreground italic bg-muted/30 p-2 border-l-2 border-primary/20">
                          Rough proxy for embodied carbon & baseline load.
                        </p>
                      </li>
                    </ul>
                  </div>

                  {/* Lifestyle Card */}
                  <div className="bg-background/50 backdrop-blur-sm p-6 border border-border group hover:border-primary/30 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary/10 text-primary">
                        <Utensils className="w-4 h-4" />
                      </div>
                      <h5 className="font-display font-bold text-foreground">Lifestyle & Goods</h5>
                    </div>
                    <ul className="space-y-4">
                      <li>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Dietary Impact</p>
                        <p className="text-sm text-foreground font-medium mb-1">Meat meals/wk × 3 kg CO₂e × 52w</p>
                        <p className="text-[10px] leading-relaxed text-muted-foreground italic bg-muted/30 p-2 border-l-2 border-primary/20">
                          High-meat vs plant-based impact per <a href="https://ourworldindata.org/environmental-impacts-of-food" target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline decoration-primary/30 underline-offset-2">Our World in Data</a>.
                        </p>
                      </li>
                      <li>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Retail Supply Chain</p>
                        <p className="text-sm text-foreground font-medium mb-1">Spend $/mo × 0.02 kg CO₂e × 12m</p>
                        <p className="text-[10px] leading-relaxed text-muted-foreground italic bg-muted/30 p-2 border-l-2 border-primary/20">
                          Economic input-output proxy (0.02kg per $1 spend).
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="section-padding bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Category Tabs */}
            <div className="lg:col-span-1">
              <h2 className="font-display text-xl font-bold mb-6">Categories</h2>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-4 text-left transition-colors ${activeTab === cat.id
                      ? "bg-foreground text-background"
                      : "bg-background text-foreground hover:bg-secondary"
                      }`}
                  >
                    <cat.icon className="w-5 h-5" />
                    <span className="font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Fields */}
            <div className="lg:col-span-1 bg-background p-8 border border-border">
              <h2 className="font-display text-xl font-bold mb-6">Enter Data</h2>

              {activeTab === "transport" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Miles driven per week</label>
                    <input
                      type="number"
                      value={values.carMiles}
                      onChange={(e) => handleChange("carMiles", e.target.value)}
                      placeholder="e.g., 200"
                      className="w-full px-4 py-3 bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Public transit trips per week</label>
                    <input
                      type="number"
                      value={values.publicTransit}
                      onChange={(e) => handleChange("publicTransit", e.target.value)}
                      placeholder="e.g., 10"
                      className="w-full px-4 py-3 bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {activeTab === "energy" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Electricity (kWh/month)</label>
                    <input
                      type="number"
                      value={values.electricityKwh}
                      onChange={(e) => handleChange("electricityKwh", e.target.value)}
                      placeholder="e.g., 900"
                      className="w-full px-4 py-3 bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Natural Gas (therms/month)</label>
                    <input
                      type="number"
                      value={values.gasUsage}
                      onChange={(e) => handleChange("gasUsage", e.target.value)}
                      placeholder="e.g., 50"
                      className="w-full px-4 py-3 bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {activeTab === "travel" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Flight hours per year</label>
                    <input
                      type="number"
                      value={values.flightHours}
                      onChange={(e) => handleChange("flightHours", e.target.value)}
                      placeholder="e.g., 20"
                      className="w-full px-4 py-3 bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {activeTab === "home" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Home size (sq ft)</label>
                    <input
                      type="number"
                      value={values.homeSize}
                      onChange={(e) => handleChange("homeSize", e.target.value)}
                      placeholder="e.g., 1500"
                      className="w-full px-4 py-3 bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {activeTab === "food" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Meat-based meals per week</label>
                    <input
                      type="number"
                      value={values.meatMeals}
                      onChange={(e) => handleChange("meatMeals", e.target.value)}
                      placeholder="e.g., 7"
                      className="w-full px-4 py-3 bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {activeTab === "shopping" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Monthly shopping spend ($)</label>
                    <input
                      type="number"
                      value={values.shoppingSpend}
                      onChange={(e) => handleChange("shoppingSpend", e.target.value)}
                      placeholder="e.g., 300"
                      className="w-full px-4 py-3 bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={calculateEmissions}
                className="w-full btn-squared-primary flex items-center justify-center gap-2 mt-8"
              >
                Calculate Emissions
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Results */}
            <div className="lg:col-span-1 bg-background p-8 border border-border">
              <h2 className="font-display text-xl font-bold mb-6">Your Footprint</h2>

              {!showResults ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground text-center">
                  <p>Fill in your data across categories and click "Calculate Emissions"</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="p-6 bg-muted text-center">
                    <div className="text-5xl font-display font-bold text-foreground mb-2">
                      {totalEmissions.toFixed(1)}
                    </div>
                    <p className="text-sm text-muted-foreground">tons CO₂e per year</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">BREAKDOWN</h3>
                    {breakdown.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.name}</span>
                          <span className="font-medium">{item.value.toFixed(2)}t</span>
                        </div>
                        <div className="h-2 bg-muted">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${(item.value / maxValue) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border border-border">
                    <p className="text-sm text-muted-foreground">
                      The average person emits about <strong className="text-foreground">4-8 tons</strong> of CO₂e annually.
                      To meet the 1.5°C target, this needs to drop to <strong className="text-foreground">2 tons</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Calculator;

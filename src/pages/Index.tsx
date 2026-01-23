import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsSection from "@/components/StatsSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import GapAnalyzerPreview from "@/components/GapAnalyzerPreview";
import CalculatorPreview from "@/components/CalculatorPreview";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <StatsSection />
      <FeaturesGrid />
      <GapAnalyzerPreview />
      <CalculatorPreview />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;

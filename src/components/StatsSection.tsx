const stats = [
  { value: "42%", label: "Emissions reduction needed by 2030" },
  { value: "40%+", label: "Sustainability claims are misleading" },
  { value: "1.5°C", label: "Global temperature target at risk" },
  { value: "100+", label: "Countries with weak monitoring" },
];

const StatsSection = () => {
  return (
    <section className="py-16 border-y border-border">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">
                {stat.value}
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;

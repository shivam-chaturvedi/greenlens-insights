import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "The Green Lens Project provided a comprehensive review tailored to my business and included actionable remedies that I could implement relatively easily. The inclusion of websites for further information was extremely helpful, as well.",
    name: "Jennifer Morrow",
    role: "Owner - Bards Alley Bookshop",
  },
  {
    quote: "Very thorough and informative. Good information and insights.",
    name: "Tim Fricker",
    role: "Owner - Bikes@Vienna",
  },
  {
    quote: "Very professional and courteous. Put together a great report and followed up smoothly.",
    name: "David McCartney",
    role: "Owner - Sundown & Rise Up Salon",
  },
  {
    quote: "Loved looking through this well-documented report! Amazing work that can be acted on!",
    name: "Stephanie Davari",
    role: "Owner - Wise Butterfly Shop",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 md:py-24 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
          What Business Owners Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <figure key={index} className="border border-border p-8 flex flex-col">
              <Quote className="w-8 h-8 text-muted-foreground mb-4" />
              <blockquote className="text-foreground text-lg leading-relaxed flex-1 mb-6">
                “{testimonial.quote}”
              </blockquote>
              <figcaption>
                <div className="font-display font-bold text-foreground">{testimonial.name}</div>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

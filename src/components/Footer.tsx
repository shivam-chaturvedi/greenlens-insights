import { Link } from "react-router-dom";
import { ArrowUpRight, Leaf, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Leaf className="w-6 h-6 text-accent" />
              <span className="font-display text-xl font-bold">GreenLens</span>
            </div>
            <p className="text-background/70 text-sm leading-relaxed mb-6">
              Transforming sustainability from claims-based marketing into measurable, auditable action.
            </p>
            <p className="text-background/50 text-xs">
              A project by Anna Panjwani
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-sm font-semibold tracking-wide mb-6">PLATFORM</h4>
            <ul className="space-y-3">
              {[
                { name: "Features", path: "/features" },
                { name: "Gap Analyzer", path: "/gap-analyzer" },
                { name: "Carbon Calculator", path: "/calculator" },
                { name: "Journalism Hub", path: "/journalism" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-background/70 hover:text-background text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display text-sm font-semibold tracking-wide mb-6">RESOURCES</h4>
            <ul className="space-y-3">
              {[
                { name: "About", path: "/about" },
                { name: "Documentation", path: "#" },
                { name: "Case Studies", path: "#" },
                { name: "API Access", path: "#" },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-background/70 hover:text-background text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-sm font-semibold tracking-wide mb-6">CONNECT</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-background/70 text-sm">
                <Mail className="w-4 h-4" />
                <span>contact@greenlens.org</span>
              </li>
              <li className="flex items-center gap-3 text-background/70 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Global Initiative</span>
              </li>
            </ul>
            <Link
              to="/gap-analyzer"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-background text-foreground text-sm font-semibold hover:bg-background/90 transition-colors"
            >
              Start Analyzing
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-background/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/50 text-sm">
              © 2024 GreenLens. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="#" className="text-background/50 hover:text-background text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="#" className="text-background/50 hover:text-background text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

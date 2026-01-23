import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";

const navLinks = [
  { name: "FEATURES", path: "/features" },
  { name: "GAP ANALYZER", path: "/gap-analyzer" },
  { name: "CALCULATOR", path: "/calculator" },
  { name: "JOURNALISM HUB", path: "/journalism" },
  { name: "ABOUT", path: "/about" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Home Button */}
          <div className="flex items-center gap-6">
            <Link to="/" className="font-display text-xl font-bold tracking-tight text-foreground">
              GreenLens
            </Link>
            <Link
              to="/"
              className={`hidden md:flex btn-squared text-sm tracking-wide ${
                isActive("/")
                  ? "bg-foreground text-background"
                  : "bg-transparent text-foreground hover:bg-muted"
              }`}
            >
              HOME
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 text-sm font-medium tracking-wide transition-colors ${
                  isActive(link.path)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center">
            <Link
              to="/gap-analyzer"
              className="btn-squared-outline flex items-center gap-2 text-sm"
            >
              GET STARTED
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="px-6 py-4 space-y-2">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`block py-3 text-sm font-medium tracking-wide ${
                isActive("/") ? "text-primary" : "text-foreground"
              }`}
            >
              HOME
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-3 text-sm font-medium tracking-wide ${
                  isActive(link.path) ? "text-primary" : "text-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/gap-analyzer"
              onClick={() => setIsOpen(false)}
              className="btn-squared-outline inline-flex items-center gap-2 text-sm mt-4"
            >
              GET STARTED
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

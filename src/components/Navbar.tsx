import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Menu, X, UserCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";

const navLinks = [
  { name: "FEATURES", path: "/features" },
  { name: "COMMUNITY OPPORTUNITIES", path: "/community" },
  { name: "PHOTOS", path: "/photos" },
  { name: "CONSULTING", path: "/consulting" },
  { name: "CALCULATOR", path: "/calculator" },
  { name: "JOURNALISM HUB", path: "/journalism" },
  { name: "ABOUT", path: "/about" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const toast = useToast();
  const { session, profileRole } = useSupabaseSession();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out", description: "You can log back in via the navigation links.", variant: "default" });
    setMenuOpen(false);
  };

  const currentDisplay =
    session?.user.user_metadata?.full_name?.trim() ||
    session?.user.user_metadata?.preferred_username ||
    session?.user.email ||
    "GreenLens user";
  const profileSlug = encodeURIComponent(currentDisplay);
  const profilePath = `/community/profile/${profileSlug}`;
  const resolvedRole = profileRole;
  const isAdmin = resolvedRole === "admin";
  const navLinksToRender = isAdmin ? [...navLinks, { name: "ADMIN", path: "/admin" }] : navLinks;
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
              className={`hidden lg:flex btn-squared text-sm tracking-wide ${isActive("/")
                ? "bg-foreground text-background"
                : "bg-transparent text-foreground hover:bg-muted"
                }`}
            >
              HOME
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center xl:gap-1">
            {navLinksToRender.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-2 xl:px-3 py-2 text-[13px] xl:text-sm font-medium tracking-wide whitespace-nowrap transition-colors ${isActive(link.path)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-2 relative" ref={containerRef}>
            {!session ? (
              <>
                <Link
                  to="/auth?mode=login"
                  className="btn-squared-outline px-5 py-3 text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="btn-squared-outline px-5 py-3 text-sm"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-border text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <UserCircle2 className="w-5 h-5" />
                  <span className="sr-only">Open profile menu</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl border border-border bg-background shadow-lg overflow-hidden z-20">
                    <Link
                      to={profilePath}
                      className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        Admin panel
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-destructive hover:bg-muted/50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-background border-t border-border">
          <div className="px-6 py-4 space-y-2">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`block py-3 text-sm font-medium tracking-wide ${isActive("/") ? "text-primary" : "text-foreground"
                }`}
            >
              HOME
            </Link>
            {navLinksToRender.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-3 text-sm font-medium tracking-wide ${isActive(link.path) ? "text-primary" : "text-foreground"
                  }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-4">
              {!session ? (
                <>
                  <Link
                    to="/auth?mode=login"
                    onClick={() => setIsOpen(false)}
                    className="btn-squared-outline inline-flex justify-center text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    onClick={() => setIsOpen(false)}
                    className="btn-squared-outline inline-flex justify-center text-sm"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={profilePath}
                    onClick={() => setIsOpen(false)}
                    className="btn-squared-outline inline-flex justify-center text-sm"
                  >
                    Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="btn-squared-outline inline-flex justify-center text-sm"
                    >
                      Admin panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="btn-squared-outline inline-flex justify-center text-sm"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

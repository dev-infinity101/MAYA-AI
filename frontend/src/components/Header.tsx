import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { clsx } from 'clsx';
import { Brand } from './Brand';

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header 
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-black/50 backdrop-blur-lg border-b border-white/5 py-4" : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group">
          <Brand />
        </Link>

        {/* Desktop Nav shifted to right */}
        <nav className="hidden md:flex items-center gap-8 ml-auto mr-4">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={clsx(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive(link.path) ? "text-primary" : "text-text-secondary"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Empty CTA div (placeholder for future use) */}
        <div className="hidden md:flex items-center gap-4">
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 p-6 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className="text-lg text-text-secondary hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

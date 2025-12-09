import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, Menu, X } from 'lucide-react';
import { Button } from './Button';
import { clsx } from 'clsx';

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
    { name: 'Agents', path: '/agents' },
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
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Bot className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
          </div>
          <span className="text-xl font-bold tracking-wider text-white">MAYA<span className="text-primary">.AI</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
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

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
            <Link to="/chat">
                <Button variant="primary" size="sm" glow>
                    Launch App
                </Button>
            </Link>
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
          <Link to="/chat" onClick={() => setIsMobileMenuOpen(false)}>
            <Button className="w-full">Launch App</Button>
          </Link>
        </div>
      )}
    </header>
  );
}

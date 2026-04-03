import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { clsx } from 'clsx';
import { Brand } from './Brand';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

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

        {/* Desktop Nav */}
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

        {/* Auth CTA */}
        <div className="hidden md:flex items-center gap-3">
          <SignedOut>
            <Link
              to="/sign-in"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/sign-up"
              className="px-4 py-2 bg-emerald-500 text-black text-sm font-semibold rounded-lg hover:bg-emerald-400 transition-colors"
            >
              Get Started
            </Link>
          </SignedOut>

          <SignedIn>
            <Link
              to="/chat"
              className="text-sm text-gray-300 hover:text-white transition-colors mr-1"
            >
              Open Chat
            </Link>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                variables: { colorPrimary: '#10b981' }
              }}
            />
          </SignedIn>
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
          <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
            <SignedOut>
              <Link to="/sign-in" className="text-base text-gray-300" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
              <Link to="/sign-up" className="px-4 py-2 bg-emerald-500 text-black text-sm font-semibold rounded-lg text-center" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
            </SignedOut>
            <SignedIn>
              <Link to="/chat" className="text-base text-gray-300" onClick={() => setIsMobileMenuOpen(false)}>Open Chat</Link>
              <UserButton afterSignOutUrl="/" appearance={{ variables: { colorPrimary: '#10b981' } }} />
            </SignedIn>
          </div>
        </div>
      )}
    </header>
  );
}

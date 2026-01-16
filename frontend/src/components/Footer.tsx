import { Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Brand } from './Brand';

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 pt-32 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-4">
            <Link to="/">
              <Brand />
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed">
              Empowering Indian MSMEs with AI-driven guidance on government schemes and business strategy.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-text-secondary hover:text-white transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-text-secondary hover:text-white transition-colors"><Github size={20} /></a>
              <a href="#" className="text-text-secondary hover:text-white transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Product</h4>
            <ul className="space-y-3 text-text-secondary text-sm">
              <li><Link to="/chat" className="hover:text-primary transition-colors">Chat Interface</Link></li>
              <li><Link to="/#features" className="hover:text-primary transition-colors">Scheme Finder</Link></li>
              <li><Link to="/#agents" className="hover:text-primary transition-colors">AI Agents</Link></li>
              <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Resources</h4>
            <ul className="space-y-3 text-text-secondary text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-3 text-text-secondary text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-secondary">
          <p>&copy; {new Date().getFullYear()} MAYA AI. All rights reserved.</p>
          <p>Made with ❤️ for Indian MSMEs</p>
        </div>
      </div>
    </footer>
  );
}

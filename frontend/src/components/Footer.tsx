import footerImg from '../Assets/footer-m.png';

export function Footer() {
  return (
    <footer className="w-full bg-black relative overflow-hidden">
      {/* Glowing Section Divider */}
      <div className="relative h-24 w-full overflow-visible flex items-center justify-center">
        <div className="absolute w-full max-w-[1400px] h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        <div className="absolute w-full max-w-[1000px] h-[40px] bg-emerald-500/10 blur-[50px] rounded-full" />
      </div>

      {/* Main Footer */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Footer Image with M Logo Overlay */}
        <div className="relative rounded-2xl overflow-hidden group">
          {/* Image */}
          <img
            src={footerImg}
            alt="Footer"
            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 pointer-events-none" />

          {/* Minimal Footer Text - Bottom */}
          <div className="absolute bottom-6 left-6 right-6 z-20">
            <p className="text-white text-sm font-medium">MAYA © 2026 • AI for Indian MSMEs</p>
          </div>
        </div>

        {/* Minimal Links Section */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-8 text-sm">
          <div className="flex gap-6">
            <a href="#" className="text-emerald-100/60 hover:text-emerald-400 transition-colors duration-300">Privacy</a>
            <a href="#" className="text-emerald-100/60 hover:text-emerald-400 transition-colors duration-300">Terms</a>
            <a href="#" className="text-emerald-100/60 hover:text-emerald-400 transition-colors duration-300">Contact</a>
          </div>
          <p className="text-emerald-100/40 text-xs">Made with ❤️ for Indian businesses</p>
        </div>
      </div>

      {/* Subtle Bottom Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-40 bg-emerald-500/5 blur-[100px] pointer-events-none" />
    </footer>
  );
}

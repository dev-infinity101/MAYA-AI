import footerImg from '../Assets/footer-m.png';

export function Footer() {
  return (
    <footer className="w-full bg-black">
      {/* Glowing Section Divider */}
        <div className="relative h-24 w-full overflow-visible flex items-center justify-center">
          <div className="absolute w-full max-w-[1400px] h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
          <div className="absolute w-full max-w-[1000px] h-[40px] bg-emerald-500/10 blur-[50px] rounded-full" />
        </div>
      <img src={footerImg} alt="Footer" className="w-full h-auto object-cover mx-auto px-16" />
    </footer>
  );
}

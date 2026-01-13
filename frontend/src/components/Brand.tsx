import { Logo } from '@/components/Logo';

export function Brand({ showText = true }: { showText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {/* The animated icon component - responsive size */}
      <div className="w-[30px] h-[30px] md:w-[35px] md:h-[35px] flex items-center justify-center">
        <Logo size={30} showGlow={true} />
      </div>
      
      {/* The brand text styling */}
      {showText && (
        <span className="text-xl md:text-2xl font-display font-bold tracking-wider text-white">
          MAYA<span className="text-[#00FFB2]">.AI</span>
        </span>
      )}
    </div>
  );
}

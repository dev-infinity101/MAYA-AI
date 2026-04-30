import mayaLogo from '../Assets/maya -new logo.png';

export function Brand({ showText: _showText = true }: { showText?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={mayaLogo}
        alt="MAYA"
        className="h-12 md:h-14 w-auto object-contain"
      />
    </div>
  );
}

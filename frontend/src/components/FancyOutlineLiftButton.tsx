import React from "react";

type FancyButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

const FancyOutlineLiftButton: React.FC<FancyButtonProps> = ({
  children,
  ...rest
}) => {
  return (
    <button
      {...rest}
      className="
        group relative overflow-hidden
         border border-white/20
        bg-black px-6 py-3 font-semibold uppercase text-white
        transition-all duration-300
        hover:-translate-x-1 hover:-translate-y-1
        hover:shadow-[4px_4px_0px_emerald]
        active:translate-x-0 active:translate-y-0
        active:shadow-none
      "
    >
      {/* Text */}
      <span className="relative z-10 transition-colors duration-300 group-hover:text-[#00FFB2]">
        {children}
      </span>

      {/* TOP */}
      <span className="pointer-events-none absolute left-0 top-0 h-[2px] w-0 bg-[#00FFB2] transition-all duration-100 group-hover:w-full" />

      {/* RIGHT */}
      <span className="pointer-events-none absolute right-0 top-0 h-0 w-[2px] bg-[#00FFB2] transition-all delay-100 duration-100 group-hover:h-full" />

      {/* BOTTOM */}
      <span className="pointer-events-none absolute bottom-0 right-0 h-[2px] w-0 bg-[#00FFB2] transition-all delay-200 duration-100 group-hover:w-full" />

      {/* LEFT */}
      <span className="pointer-events-none absolute bottom-0 left-0 h-0 w-[2px] bg-[#00FFB2] transition-all delay-300 duration-100 group-hover:h-full" />
    </button>
  );
};

export default FancyOutlineLiftButton;

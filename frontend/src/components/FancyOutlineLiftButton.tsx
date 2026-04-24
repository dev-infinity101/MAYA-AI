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
        border border-[rgba(196,97,10,0.30)]
        bg-white px-6 py-3 font-semibold uppercase text-text-primary
        transition-all duration-300
        hover:-translate-x-1 hover:-translate-y-1
        hover:shadow-[4px_4px_0px_#C4610A]
        active:translate-x-0 active:translate-y-0
        active:shadow-none
      "
    >
      <span className="relative z-10 transition-colors duration-300 group-hover:text-primary">
        {children}
      </span>
      <span className="pointer-events-none absolute left-0 top-0 h-[2px] w-0 bg-primary transition-all duration-100 group-hover:w-full" />
      <span className="pointer-events-none absolute right-0 top-0 h-0 w-[2px] bg-primary transition-all delay-100 duration-100 group-hover:h-full" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-[2px] w-0 bg-primary transition-all delay-200 duration-100 group-hover:w-full" />
      <span className="pointer-events-none absolute bottom-0 left-0 h-0 w-[2px] bg-primary transition-all delay-300 duration-100 group-hover:h-full" />
    </button>
  );
};

export default FancyOutlineLiftButton;

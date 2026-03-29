import React, { forwardRef, useEffect } from "react";
import { Slot } from "@radix-ui/react-slot";
import { ArrowDown } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// ─── Conversation ─────────────────────────────────────────────────────────────
export interface ConversationProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export const Conversation = forwardRef<HTMLDivElement, ConversationProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref}
        className={cn("relative flex w-full flex-col h-full", className)}
        {...props}
      />
    );
  }
);
Conversation.displayName = "Conversation";

// ─── ConversationContent ──────────────────────────────────────────────────────
export interface ConversationContentProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export const ConversationContent = forwardRef<HTMLDivElement, ConversationContentProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref}
        className={cn(
          "flex-1 overflow-y-auto scroll-smooth p-4 md:p-6 pb-32 w-full max-w-4xl mx-auto custom-scrollbar",
          className
        )}
        {...props}
      />
    );
  }
);
ConversationContent.displayName = "ConversationContent";

// ─── ConversationScrollButton ─────────────────────────────────────────────────
export interface ConversationScrollButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  containerRef?: React.RefObject<HTMLDivElement>;
}

export const ConversationScrollButton = forwardRef<HTMLButtonElement, ConversationScrollButtonProps>(
  ({ className, containerRef, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false);

    useEffect(() => {
      const container = containerRef?.current;
      if (!container) return;

      const handleScroll = () => {
        const isAtBottom =
          container.scrollHeight - container.scrollTop <=
          container.clientHeight + 150;
        setIsVisible(!isAtBottom);
      };

      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }, [containerRef]);

    if (!isVisible) return null;

    return (
      <button
        ref={ref}
        onClick={() => {
          containerRef?.current?.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }}
        className={cn(
          "absolute bottom-28 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/20 text-white shadow-lg transition-all hover:bg-white/20 z-10",
          className
        )}
        {...props}
      >
        <ArrowDown size={16} />
      </button>
    );
  }
);
ConversationScrollButton.displayName = "ConversationScrollButton";

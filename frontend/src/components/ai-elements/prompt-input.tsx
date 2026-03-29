import React, { forwardRef, KeyboardEvent, useRef } from "react";
import { Square, ArrowUp } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── PromptInput ──────────────────────────────────────────────────────────────
export interface PromptInputProps extends Omit<React.HTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
}

export const PromptInput = forwardRef<HTMLFormElement, PromptInputProps>(
  ({ className, onSubmit, isLoading, children, ...props }, ref) => {
    return (
      <form
        ref={ref}
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className={cn("relative flex w-full", className)}
        {...props}
      >
        {children}
      </form>
    );
  }
);
PromptInput.displayName = "PromptInput";

// ─── PromptInputTextarea ──────────────────────────────────────────────────────
export interface PromptInputTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onSubmit'> {
  onSubmit: (text: string) => void;
  isLoading?: boolean;
}

export const PromptInputTextarea = forwardRef<HTMLTextAreaElement, PromptInputTextareaProps>(
  ({ className, onSubmit, isLoading, value, onChange, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textAreaRef = (ref as any) || internalRef;

    // Auto-resize textarea
    React.useEffect(() => {
      if (textAreaRef.current) {
        textAreaRef.current.style.height = "auto";
        textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 200)}px`;
      }
    }, [value, textAreaRef]);

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!isLoading && value && String(value).trim()) {
          onSubmit(String(value));
        }
      }
    };

    return (
      <textarea
        ref={textAreaRef}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        rows={1}
        className={cn(
          "w-full resize-none rounded-2xl border border-white/10 bg-[#0f0f0f] px-5 py-4",
          "text-[15px] text-white placeholder:text-white/35 focus:border-white/15 focus:outline-none focus:ring-0",
          "transition-all custom-scrollbar overflow-y-auto",
          className
        )}
        {...props}
      />
    );
  }
);
PromptInputTextarea.displayName = "PromptInputTextarea";

// ─── PromptInputSubmit ────────────────────────────────────────────────────────
export interface PromptInputSubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  status: "idle" | "streaming";
  onStop?: () => void;
}

export const PromptInputSubmit = forwardRef<HTMLButtonElement, PromptInputSubmitProps>(
  ({ className, status, disabled, onStop, ...props }, ref) => {
    const isReady = status === "idle" && !disabled;

    return (
      <button
        ref={ref}
        type={status === "idle" ? "submit" : "button"}
        disabled={disabled && status === "idle"}
        onClick={(e) => {
          if (status === "streaming" && onStop) {
            e.preventDefault();
            onStop();
          }
        }}
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-300",
          status === "streaming"
            ? "border border-white/10 bg-white/10 text-white hover:bg-white/15"
            : isReady
            ? "bg-white text-black hover:bg-white/90"
            : "bg-white/6 text-text-secondary cursor-not-allowed",
          className
        )}
        {...props}
      >
        {status === "streaming" ? (
          <Square size={14} fill="currentColor" />
        ) : (
          <ArrowUp size={21} strokeWidth={3} />
        )}
      </button>
    );
  }
);
PromptInputSubmit.displayName = "PromptInputSubmit";

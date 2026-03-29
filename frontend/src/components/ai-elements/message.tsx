import React, { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { User, Sparkles } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Message ──────────────────────────────────────────────────────────────────
export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  from?: "user" | "assistant" | "system";
  asChild?: boolean;
}

export const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ className, from = "user", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref}
        data-role={from}
        className={cn(
          "flex w-full gap-4 mb-6 relative group",
          from === "user" ? "justify-end" : "justify-start",
          className
        )}
        {...props}
      />
    );
  }
);
Message.displayName = "Message";

// ─── MessageAvatar ────────────────────────────────────────────────────────────
export interface MessageAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  from?: "user" | "assistant" | "system";
}

export const MessageAvatar = forwardRef<HTMLDivElement, MessageAvatarProps>(
  ({ className, from = "user", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex shrink-0 h-8 w-8 items-center justify-center rounded-xl",
          from === "user"
            ? "bg-white/10 text-white"
            : "bg-primary/20 text-primary border border-primary/30",
          className
        )}
        {...props}
      >
        {from === "user" ? <User size={16} /> : <Sparkles size={16} />}
      </div>
    );
  }
);
MessageAvatar.displayName = "MessageAvatar";

// ─── MessageContent ───────────────────────────────────────────────────────────
export interface MessageContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const MessageContent = forwardRef<HTMLDivElement, MessageContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-2 max-w-[85%] md:max-w-[75%]", className)}
        {...props}
      />
    );
  }
);
MessageContent.displayName = "MessageContent";

// ─── MessageResponse ──────────────────────────────────────────────────────────
export interface MessageResponseProps extends React.HTMLAttributes<HTMLDivElement> {}

export const MessageResponse = forwardRef<HTMLDivElement, MessageResponseProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "prose prose-sm md:prose-base prose-invert prose-p:leading-relaxed prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 max-w-none",
          "text-white/90 break-words",
          className
        )}
        {...props}
      />
    );
  }
);
MessageResponse.displayName = "MessageResponse";

import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import ReactMarkdown from "react-markdown";
import { BrainIcon, ChevronDownIcon } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Shimmer } from "./shimmer";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// ─── Constants ────────────────────────────────────────────────────────────────
const AUTO_CLOSE_DELAY = 1000;
const MS_IN_S = 1000;

// ─── Context ──────────────────────────────────────────────────────────────────
interface ReasoningContextValue {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  duration: number | undefined;
}

const ReasoningContext = createContext<ReasoningContextValue | null>(null);

export const useReasoning = () => {
  const context = useContext(ReasoningContext);
  if (!context) {
    throw new Error("Reasoning components must be used within <Reasoning>");
  }
  return context;
};

// ─── Reasoning (Root) ─────────────────────────────────────────────────────────
export type ReasoningProps = {
  className?: string;
  children: ReactNode;
  isStreaming?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
};

export const Reasoning = memo(({
  className,
  children,
  isStreaming = false,
  open,
  defaultOpen,
  onOpenChange,
  duration: durationProp,
}: ReasoningProps) => {
  const resolvedDefaultOpen = defaultOpen ?? isStreaming;
  const isExplicitlyClosed = defaultOpen === false;

  const [isOpen, setIsOpen] = useControllableState<boolean>({
    defaultProp: resolvedDefaultOpen,
    onChange: onOpenChange,
    prop: open,
  });

  const [duration, setDuration] = useControllableState<number | undefined>({
    defaultProp: undefined,
    prop: durationProp,
  });

  const hasEverStreamedRef = useRef(isStreaming);
  const [hasAutoClosed, setHasAutoClosed] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  // Track streaming start/end to compute duration
  useEffect(() => {
    if (isStreaming) {
      hasEverStreamedRef.current = true;
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      }
    } else if (startTimeRef.current !== null) {
      setDuration(Math.ceil((Date.now() - startTimeRef.current) / MS_IN_S));
      startTimeRef.current = null;
    }
  }, [isStreaming, setDuration]);

  // Auto-open when streaming starts
  useEffect(() => {
    if (isStreaming && !isOpen && !isExplicitlyClosed) {
      setIsOpen(true);
    }
  }, [isStreaming, isOpen, setIsOpen, isExplicitlyClosed]);

  // Auto-close once streaming ends (one time only)
  useEffect(() => {
    if (hasEverStreamedRef.current && !isStreaming && isOpen && !hasAutoClosed) {
      const timer = setTimeout(() => {
        setIsOpen(false);
        setHasAutoClosed(true);
      }, AUTO_CLOSE_DELAY);
      return () => clearTimeout(timer);
    }
  }, [isStreaming, isOpen, setIsOpen, hasAutoClosed]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => setIsOpen(newOpen),
    [setIsOpen]
  );

  const contextValue = useMemo(
    () => ({ duration, isOpen: isOpen ?? false, isStreaming, setIsOpen }),
    [duration, isOpen, isStreaming, setIsOpen]
  );

  return (
    <ReasoningContext.Provider value={contextValue}>
      <Collapsible.Root
        open={isOpen}
        onOpenChange={handleOpenChange}
        className={cn("mb-4", className)}
      >
        {children}
      </Collapsible.Root>
    </ReasoningContext.Provider>
  );
});

Reasoning.displayName = "Reasoning";

// ─── ReasoningTrigger ─────────────────────────────────────────────────────────
export type ReasoningTriggerProps = ComponentProps<
  typeof Collapsible.Trigger
> & {
  getThinkingMessage?: (isStreaming: boolean, duration?: number) => ReactNode;
};

const defaultGetThinkingMessage = (
  isStreaming: boolean,
  duration?: number
): ReactNode => {
  if (isStreaming || duration === 0) {
    return <Shimmer duration={1.2}>Thinking...</Shimmer>;
  }
  if (duration === undefined) {
    return <p>Thought for a few seconds</p>;
  }
  return <p>Thought for {duration} {duration === 1 ? "second" : "seconds"}</p>;
};

export const ReasoningTrigger = memo(({
  className,
  children,
  getThinkingMessage = defaultGetThinkingMessage,
  ...props
}: ReasoningTriggerProps) => {
  const { isStreaming, isOpen, duration } = useReasoning();

  return (
    <Collapsible.Trigger
      className={cn(
        "flex w-full items-center gap-2 text-sm transition-colors",
        "text-text-secondary hover:text-white outline-none",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          <BrainIcon
            className={cn(
              "size-4 shrink-0 transition-colors",
              isStreaming && "text-primary animate-pulse"
            )}
          />
          {getThinkingMessage(isStreaming, duration)}
          <ChevronDownIcon
            className={cn(
              "size-4 shrink-0 transition-transform duration-300 ml-auto",
              isOpen ? "rotate-180" : "rotate-0"
            )}
          />
        </>
      )}
    </Collapsible.Trigger>
  );
});

ReasoningTrigger.displayName = "ReasoningTrigger";

// ─── ReasoningContent ─────────────────────────────────────────────────────────
export type ReasoningContentProps = ComponentProps<
  typeof Collapsible.Content
> & {
  children: string;
};

export const ReasoningContent = memo(({
  className,
  children,
  ...props
}: ReasoningContentProps) => (
  <Collapsible.Content
    className={cn(
      "overflow-hidden",
      "data-[state=open]:animate-[collapsible-slide-down_300ms_ease]",
      "data-[state=closed]:animate-[collapsible-slide-up_300ms_ease]",
      className
    )}
    {...props}
  >
    <div
      className={cn(
        "mt-3 pl-6 border-l border-white/10",
        "text-sm text-text-secondary leading-relaxed",
        "max-h-[320px] overflow-y-auto pr-2 custom-scrollbar",
        "prose prose-invert prose-sm max-w-none"
      )}
    >
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  </Collapsible.Content>
));

ReasoningContent.displayName = "ReasoningContent";

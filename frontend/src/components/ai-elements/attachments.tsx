import React, { createContext, useContext, useMemo } from "react";
import { X, File, FileText, Image as ImageIcon, FileVideo, FileAudio } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface AttachmentData {
  id: string;
  filename: string;
  mediaType?: string;
  type?: "file" | "image" | "document" | "video" | "audio" | string;
  url?: string;
}

interface AttachmentContextValue {
  attachment: AttachmentData;
  onRemove?: () => void;
}

const AttachmentContext = createContext<AttachmentContextValue | null>(null);

export function useAttachment() {
  const context = useContext(AttachmentContext);
  if (!context) {
    throw new Error("Attachment components must be used within <Attachment>");
  }
  return context;
}

// ─── Attachments (Container) ──────────────────────────────────────────────────
export interface AttachmentsProps {
  children: React.ReactNode;
  variant?: "grid" | "list" | "flex";
  className?: string;
}

export function Attachments({
  children,
  variant = "flex",
  className,
}: AttachmentsProps) {
  return (
    <div
      className={cn(
        "gap-3",
        variant === "grid" && "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
        variant === "list" && "flex flex-col",
        variant === "flex" && "flex flex-wrap",
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── Attachment (Item Wrapper) ────────────────────────────────────────────────
export interface AttachmentProps {
  data: AttachmentData;
  onRemove?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function Attachment({
  data,
  onRemove,
  className,
  children,
}: AttachmentProps) {
  const contextValue = useMemo(() => ({ attachment: data, onRemove }), [data, onRemove]);

  return (
    <AttachmentContext.Provider value={contextValue}>
      <div
        className={cn(
          "relative group flex items-center overflow-hidden",
          "rounded-xl border border-white/10 bg-white/5",
          "transition-all duration-300 hover:border-white/20 hover:bg-white/10",
          className
        )}
      >
        {children}
      </div>
    </AttachmentContext.Provider>
  );
}

// ─── AttachmentPreview ────────────────────────────────────────────────────────
export interface AttachmentPreviewProps {
  className?: string;
  showFilename?: boolean;
}

function getIconForMediaType(mediaType?: string) {
  if (!mediaType) return <File size={20} className="text-text-secondary" />;
  if (mediaType.startsWith("image/")) return <ImageIcon size={20} className="text-blue-400" />;
  if (mediaType.startsWith("video/")) return <FileVideo size={20} className="text-purple-400" />;
  if (mediaType.startsWith("audio/")) return <FileAudio size={20} className="text-yellow-400" />;
  if (mediaType.includes("pdf")) return <FileText size={20} className="text-red-400" />;
  return <File size={20} className="text-text-secondary" />;
}

export function AttachmentPreview({ className, showFilename = true }: AttachmentPreviewProps) {
  const { attachment } = useAttachment();
  const isImage = attachment.mediaType?.startsWith("image/") && attachment.url;

  return (
    <div className={cn("flex items-center w-full h-full", className)}>
      {isImage ? (
        <div className="w-16 h-16 shrink-0 relative overflow-hidden bg-black/50">
          <img
            src={attachment.url}
            alt={attachment.filename}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-14 h-14 shrink-0 flex justify-center items-center bg-white/5">
          {getIconForMediaType(attachment.mediaType)}
        </div>
      )}

      {showFilename && (
        <div className="flex-1 min-w-0 px-3 py-2">
          <p className="text-sm font-medium text-white truncate" title={attachment.filename}>
            {attachment.filename}
          </p>
          <p className="text-[10px] text-text-secondary uppercase tracking-wider mt-0.5">
            {attachment.mediaType ? attachment.mediaType.split('/')[1] || 'FILE' : 'FILE'}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── AttachmentRemove ─────────────────────────────────────────────────────────
export interface AttachmentRemoveProps {
  className?: string;
}

export function AttachmentRemove({ className }: AttachmentRemoveProps) {
  const { onRemove } = useAttachment();

  if (!onRemove) return null;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove();
      }}
      className={cn(
        "absolute right-2 top-1/2 -translate-y-1/2",
        "w-6 h-6 rounded-full bg-black/50 flex justify-center items-center",
        "text-white/70 hover:text-white hover:bg-black/80 hover:scale-110",
        "opacity-0 group-hover:opacity-100 transition-all duration-200",
        className
      )}
      aria-label="Remove attachment"
    >
      <X size={14} />
    </button>
  );
}

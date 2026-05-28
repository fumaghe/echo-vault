import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ZoomIn, X, ImageOff } from "lucide-react";
import { flags } from "@/lib/flags";

export function EvidenceArtifact({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);

  // ?noImages=1 — skip image loading entirely (isolates image-decode freeze)
  if (flags.noImages) {
    return (
      <div className="glass glass-cyan rounded-md overflow-hidden relative scanlines">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[color:var(--color-border)]">
          <span className="text-xs uppercase tracking-widest text-[color:var(--color-cyan)]">
            Evidence Artifact
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <ImageOff className="size-3" /> ?noImages=1
          </span>
        </div>
        <div className="flex items-center justify-center h-40 text-slate-500 text-sm font-mono">
          image loading disabled
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass glass-cyan rounded-md overflow-hidden relative scanlines">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[color:var(--color-border)]">
          <span className="text-xs uppercase tracking-widest text-[color:var(--color-cyan)]">
            Evidence Artifact
          </span>
          <button
            onClick={() => setOpen(true)}
            className="text-xs text-[color:var(--color-cyan)] inline-flex items-center gap-1 hover:text-white"
          >
            <ZoomIn className="size-3" /> Zoom
          </button>
        </div>
        <button onClick={() => setOpen(true)} className="block w-full">
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="w-full h-auto block"
          />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white"
              onClick={() => setOpen(false)}
            >
              <X className="size-6" />
            </button>
            <motion.img
              src={src}
              alt={alt}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1.05, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
              className="max-w-[95vw] max-h-[90vh] rounded-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

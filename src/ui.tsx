import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import {
  X,
  Sparkles,
  MessageCircle,
  Waves,
  Globe,
  Ticket,
  BriefcaseBusiness,
  Smile,
} from "lucide-react";
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="logo">
      <span className="logo-mark">
        <svg viewBox="0 0 32 32" fill="none">
          <path
            fill="currentColor"
            d="M7 7h16v4H11v11h12v4H7zM14 14h11v4H14zM23 11h3v3h-3zM23 18h3v4h-3z"
          />
        </svg>
      </span>
      {!compact && <>openform</>}
    </span>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const prev = document.activeElement as HTMLElement;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!ref.current?.contains(document.activeElement)) ref.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab") {
        const items = ref.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input, textarea, select, a[href], [tabindex="0"]',
        );
        if (!items?.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", key);
      prev?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`modal ${wide ? "modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
      >
        <div className="modal-heading">
          <h2>{title}</h2>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
export function Cover({
  theme,
  small = false,
}: {
  theme: string;
  small?: boolean;
}) {
  const icons = {
    sage: MessageCircle,
    peach: Waves,
    lilac: Globe,
    blue: Ticket,
    sand: BriefcaseBusiness,
    rose: Smile,
  };
  const Icon = icons[theme as keyof typeof icons] || Sparkles;
  return (
    <div
      className={`form-cover theme-${theme} ${small ? "cover-small" : ""}`}
      aria-hidden="true"
    >
      <span className="cover-grid" />
      <span className="cover-shape" />
      <span className="cover-center">
        <Icon size={28} strokeWidth={1.6} />
      </span>
    </div>
  );
}
export const themes = [
  { id: "sage", name: "Sage", color: "#e9f0c7" },
  { id: "peach", name: "Peach", color: "#f6ddd0" },
  { id: "lilac", name: "Lilac", color: "#e8defa" },
  { id: "blue", name: "Sky", color: "#dce8fb" },
  { id: "sand", name: "Sand", color: "#f0e5cc" },
  { id: "rose", name: "Rose", color: "#f6dce6" },
];
export function Empty({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon || <MessageCircle />}</span>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}

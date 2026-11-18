import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import {
  X,
  ArrowUpRight,
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
            d="M9 9h9a7 7 0 0 1 0 14H9V9Z"
            stroke="currentColor"
            strokeWidth="3.8"
          />
          <path d="M10 16h9" stroke="currentColor" strokeWidth="3.8" />
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
      {theme === "sage" ? (
        <>
          <span className="cover-copy">
            A little feedback.
            <br />A big difference.
          </span>
          <svg className="cover-star" viewBox="0 0 120 120">
            <path
              d="m60 0 9 35L96 8 85 44l35-1-30 20 28 22-35-4 8 35-26-27-12 31-5-36-32 19 18-32L0 63l35-12L9 26l35 10z"
              fill="currentColor"
            />
          </svg>
          <span className="cover-orbit" />
        </>
      ) : theme === "peach" ? (
        <>
          <span className="cover-hello">
            hello<span>✳</span>
          </span>
          <span className="cover-tag">NICE TO MEET YOU</span>
          <span className="cover-squiggle">〰</span>
        </>
      ) : theme === "lilac" ? (
        <>
          <div className="mini-browser">
            <div>
              <i />
              <i />
              <i />
            </div>
            <span>
              your opinion
              <br />
              <em>looks good here.</em>
            </span>
            <div className="mini-browser-button">Let's talk ↗</div>
          </div>
          <span className="cover-daisy">✳</span>
        </>
      ) : theme === "blue" ? (
        <>
          <div className="cover-ticket">
            <span>YOU’RE INVITED</span>
            <strong>
              Good people.
              <br />
              Great times.
            </strong>
            <div>
              ADMIT ONE <ArrowUpRight size={18} />
            </div>
          </div>
          <span className="cover-circle" />
        </>
      ) : theme === "sand" ? (
        <>
          <span className="cover-work">
            Great work.
            <br />
            <em>Better together.</em>
          </span>
          <div className="cover-arches">
            <i />
            <i />
            <i />
          </div>
        </>
      ) : (
        <>
          <span className="cover-check">
            How’s it
            <br />
            <em>going?</em>
          </span>
          <div className="cover-smile">
            <i />
            <i />
            <span />
          </div>
        </>
      )}
      <span className="cover-corner">
        <Icon size={15} />
      </span>
    </div>
  );
}
export const themes = [
  { id: "sage", name: "Sage", color: "#dce9d7" },
  { id: "peach", name: "Peach", color: "#f8d8c4" },
  { id: "lilac", name: "Lilac", color: "#dedcf5" },
  { id: "blue", name: "Sky", color: "#d6e6f2" },
  { id: "sand", name: "Sand", color: "#ece1cd" },
  { id: "rose", name: "Rose", color: "#f0d9df" },
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

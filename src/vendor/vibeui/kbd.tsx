// Adapted from VibeUI (https://tryjasmine.dev/). See THIRD_PARTY_NOTICES.md.
import type { ReactNode } from "react";

/** Keyboard key cap for shortcuts. */
export function Kbd({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <kbd className={className}>{children}</kbd>;
}

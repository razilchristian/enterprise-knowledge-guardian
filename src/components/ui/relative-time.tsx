"use client";

import { useCallback, useSyncExternalStore } from "react";
import { formatRelativeTime } from "@/lib/utils";

interface Props {
  date: Date;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/** Re-render every minute so a long demo does not keep saying "just now". */
function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

/**
 * Renders "3 minutes ago" without a hydration mismatch.
 *
 * The server renders at one instant and the browser hydrates at another, so a
 * relative time computed in both places disagrees. useSyncExternalStore lets us
 * return an empty server snapshot and the real value on the client, which is
 * the sanctioned way to do this — an effect that setStates on mount produces
 * the same result but triggers a cascading render React now warns about.
 */
export default function RelativeTime({ date, prefix = "", suffix = "", className = "" }: Props) {
  const time = date.getTime();

  const getSnapshot = useCallback(() => formatRelativeTime(new Date(time)), [time]);
  const getServerSnapshot = useCallback(() => "", []);

  const formatted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <span suppressHydrationWarning className={className}>
      {formatted ? `${prefix}${formatted}${suffix}` : ""}
    </span>
  );
}

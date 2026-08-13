"use client";

import { useEffect, useState } from "react";
import { formatRelativeTime } from "@/lib/utils";

interface Props {
  date: Date;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function RelativeTime({ date, prefix = "", suffix = "", className = "" }: Props) {
  const [formatted, setFormatted] = useState<string>(() => formatRelativeTime(date));

  useEffect(() => {
    setFormatted(formatRelativeTime(date));
  }, [date]);

  return (
    <span suppressHydrationWarning className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

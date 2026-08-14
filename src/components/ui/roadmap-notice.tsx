import Link from "next/link";
import { Compass } from "lucide-react";

/**
 * Marks a screen as designed rather than shipped.
 *
 * Some of this product is real and some is the roadmap. Saying which is which,
 * on the screen itself, is better than letting someone discover it by poking at
 * a button that does nothing — a demo survives an honest gap far better than a
 * caught overstatement.
 */
export default function RoadmapNotice({ what }: { what: string }) {
  return (
    <div className="flex flex-wrap items-start gap-3 rounded-xl border border-nx-accent/25 bg-nx-accent-muted/40 px-5 py-3.5">
      <Compass size={16} className="mt-0.5 shrink-0 text-nx-accent" />
      <p className="min-w-0 flex-1 text-xs leading-relaxed text-nx-text-secondary">
        <span className="font-semibold text-nx-accent">Roadmap preview.</span>{" "}
        {what} What runs today is the retrieval and conflict engine —{" "}
        <Link href="/workspace" className="text-nx-accent underline underline-offset-2">
          ask a question
        </Link>{" "}
        or{" "}
        <Link href="/conflicts" className="text-nx-accent underline underline-offset-2">
          review a live conflict
        </Link>
        .
      </p>
    </div>
  );
}

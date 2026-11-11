import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { environmentLabels, type Environment } from "@/lib/data";

type Tone = "neutral" | "brand" | "success" | "danger";

const tones: Record<Tone, string> = {
  neutral: "border-line bg-surface text-muted",
  brand: "border-brand/25 bg-brand/10 text-brand-light",
  success: "border-success/25 bg-success/10 text-success",
  danger: "border-danger/25 bg-danger/10 text-danger",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded border px-1.5 text-[11px] font-medium leading-none",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const envDot: Record<Environment, string> = {
  production: "bg-danger",
  staging: "bg-brand",
  development: "bg-success",
};

export function EnvironmentBadge({ environment }: { environment: Environment }) {
  return (
    <span className="inline-flex h-5 items-center gap-1.5 rounded border border-line bg-surface px-1.5 text-[11px] font-medium leading-none text-ink">
      <span className={cn("size-1.5 rounded-full", envDot[environment])} aria-hidden />
      {environmentLabels[environment]}
    </span>
  );
}

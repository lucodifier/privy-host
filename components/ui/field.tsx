import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const fieldBase =
  "h-8 w-full rounded-md border border-line bg-panel text-[13px] text-ink placeholder:text-muted/70 transition-colors focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20";

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, "px-2.5", className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          fieldBase,
          "cursor-pointer appearance-none pr-7 pl-2.5 hover:border-[#404654]",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={13}
        aria-hidden
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  );
}

export function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string;
  children: string;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-3">
      <span className="text-[12px] font-medium text-ink">{children}</span>
      {hint ? <span className="text-[11px] text-muted">{hint}</span> : null}
    </label>
  );
}

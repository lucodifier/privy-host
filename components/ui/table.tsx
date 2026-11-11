import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">{children}</table>
    </div>
  );
}

export function Th({ className, children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "h-9 border-b border-line bg-panel/60 px-4 text-[11px] font-medium uppercase tracking-[0.06em] text-muted",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({ className, children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("h-11 border-b border-line/70 px-4 align-middle", className)} {...props}>
      {children}
    </td>
  );
}

export function Tr({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <tr className={cn("transition-colors hover:bg-panel/60", className)}>{children}</tr>
  );
}

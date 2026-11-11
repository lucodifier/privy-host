import { ArrowUpRight } from "lucide-react";
import {
  actionLabels,
  type AccessEvent,
  type AccessAction,
} from "@/lib/data";
import { EnvironmentBadge } from "@/components/ui/badge";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const actionTone: Record<AccessAction, string> = {
  viewed: "text-muted",
  copied: "text-muted",
  updated: "text-ink",
  created: "text-success",
  rotated: "text-brand-light",
};

export function ActivityTable({
  events,
  showProject = true,
}: {
  events: AccessEvent[];
  showProject?: boolean;
}) {
  return (
    <Table>
      <thead>
        <tr>
          <Th className="w-[38%]">Evento</Th>
          {showProject ? <Th>Projeto</Th> : null}
          <Th>Ambiente</Th>
          <Th>Ator</Th>
          <Th className="hidden lg:table-cell">Origem</Th>
          <Th className="text-right">Quando</Th>
        </tr>
      </thead>
      <tbody>
        {events.map((event) => (
          <Tr key={event.id}>
            <Td>
              <span className="flex items-center gap-2">
                <span className={cn("text-[12px] font-medium", actionTone[event.action])}>
                  {actionLabels[event.action]}
                </span>
                <span className="truncate font-mono text-[12px] text-muted">{event.key}</span>
              </span>
            </Td>
            {showProject ? <Td className="text-muted">{event.project}</Td> : null}
            <Td>
              <EnvironmentBadge environment={event.environment} />
            </Td>
            <Td className="text-muted">{event.actor}</Td>
            <Td className="hidden lg:table-cell text-muted">{event.source}</Td>
            <Td className="text-right text-muted">
              <span className="whitespace-nowrap">{event.at}</span>
            </Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}

export function ActivityPanelFooter({ href = "/recent-access" }: { href?: string }) {
  return (
    <div className="flex h-9 items-center justify-end border-t border-line px-4">
      <a
        href={href}
        className="inline-flex items-center gap-1 text-[11.5px] font-medium text-brand hover:text-brand-light"
      >
        Ver registro completo
        <ArrowUpRight size={12} aria-hidden />
      </a>
    </div>
  );
}

import { Download } from "lucide-react";
import { ActivityTable } from "@/components/activity-table";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel } from "@/components/ui/page";
import { accessEvents } from "@/lib/data";

export const metadata = { title: "Recent Access" };

export default function RecentAccessPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Recent Access"
        description="Registro de leitura, cópia e rotação de credenciais nos últimos 7 dias."
      >
        <Button variant="secondary">
          <Download size={14} aria-hidden />
          Exportar log
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-lg border border-line bg-panel/40 px-3.5 py-2.5 text-[11.5px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-brand" aria-hidden />
          Auditoria imutável
        </span>
        <span>Retenção de 90 dias</span>
        <span className="hidden sm:inline">Origem identificada por sessão e chave de CLI</span>
      </div>

      <Panel>
        <ActivityTable events={accessEvents} />
        <div className="flex h-9 items-center justify-between border-t border-line px-4 text-[11.5px] text-muted">
          <span>{accessEvents.length} eventos</span>
          <span className="hidden sm:inline">Fuso horário: America/Sao_Paulo</span>
        </div>
      </Panel>
    </div>
  );
}

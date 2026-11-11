import Link from "next/link";
import { ChevronRight, KeyRound, Layers, Plus, ShieldAlert } from "lucide-react";
import { ActivityTable, ActivityPanelFooter } from "@/components/activity-table";
import { Button, buttonStyles } from "@/components/ui/button";
import { PageHeader, Panel } from "@/components/ui/page";
import { cn } from "@/lib/utils";
import {
  accessEvents,
  credentials,
  environmentLabels,
  projects,
  type Environment,
} from "@/lib/data";

const metrics = [
  { label: "Projetos", value: "5", hint: "+1 neste trimestre" },
  { label: "Credenciais", value: String(credentials.length + 130), hint: "148 em 5 projetos" },
  { label: "Ambientes", value: "3", hint: "production · staging · development" },
  { label: "Rotação pendente", value: "6", hint: "Vencem em até 7 dias", tone: "danger" as const },
];

const envDot: Record<Environment, string> = {
  production: "bg-danger",
  staging: "bg-brand",
  development: "bg-success",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral de credenciais, projetos e atividade do workspace."
      >
        <Link href="/credentials" className={buttonStyles({ variant: "secondary" })}>
          <KeyRound size={14} aria-hidden />
          Ver credenciais
        </Link>
        <Button variant="primary">
          <Plus size={14} strokeWidth={2.2} aria-hidden />
          Novo segredo
        </Button>
      </PageHeader>

      <section
        aria-label="Indicadores"
        className="grid grid-cols-2 divide-line overflow-hidden rounded-lg border border-line bg-panel/40 md:grid-cols-4 md:divide-x"
      >
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={cn(
              "p-4 md:border-b-0",
              index < 2 && "border-b border-line md:border-b-0",
            )}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
              {metric.label}
            </p>
            <p
              className={cn(
                "mt-1.5 text-[22px] font-semibold leading-none tabular-nums",
                metric.tone === "danger" ? "text-danger" : "text-ink",
              )}
            >
              {metric.value}
            </p>
            <p className="mt-1.5 truncate text-[11.5px] text-muted">{metric.hint}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Panel
          title="Atividade recente"
          action={
            <Link
              href="/recent-access"
              className="text-[11.5px] font-medium text-muted hover:text-ink"
            >
              Ver tudo
            </Link>
          }
        >
          <ActivityTable events={accessEvents.slice(0, 7)} />
          <ActivityPanelFooter />
        </Panel>

        <div className="space-y-4">
          <Panel
            title="Projetos"
            action={
              <Link href="/projects" className="text-[11.5px] font-medium text-muted hover:text-ink">
                Gerenciar
              </Link>
            }
          >
            <ul className="divide-y divide-line/70">
              {projects.map((project) => (
                <li key={project.slug}>
                  <Link
                    href={`/credentials?q=${project.slug}`}
                    className="group flex h-[52px] items-center gap-3 px-4 transition-colors hover:bg-panel"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded border border-line bg-surface text-muted">
                      <Layers size={13} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] text-ink">{project.name}</span>
                      <span className="mt-0.5 flex items-center gap-2">
                        {project.environments.map((environment) => (
                          <span
                            key={environment}
                            title={environmentLabels[environment]}
                            className="flex items-center gap-1 text-[10.5px] text-muted"
                          >
                            <span
                              className={cn("size-1.5 rounded-full", envDot[environment])}
                              aria-hidden
                            />
                            {environmentLabels[environment].slice(0, 4)}
                          </span>
                        ))}
                      </span>
                    </span>
                    <span className="shrink-0 text-[11.5px] tabular-nums text-muted">
                      {project.credentials}
                    </span>
                    <ChevronRight
                      size={13}
                      aria-hidden
                      className="shrink-0 text-line group-hover:text-muted"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Atenção necessária">
            <div className="flex items-start gap-2.5 px-4 py-3">
              <ShieldAlert size={15} aria-hidden className="mt-0.5 shrink-0 text-brand-light" />
              <div className="space-y-1">
                <p className="text-[12.5px] text-ink">6 credenciais aguardam rotação</p>
                <p className="text-[11.5px] leading-relaxed text-muted">
                  Chaves de produção em <span className="font-mono text-[11px]">infra-core</span> e{" "}
                  <span className="font-mono text-[11px]">data-pipeline</span> passaram de 90 dias.
                </p>
                <Link
                  href="/credentials"
                  className="inline-flex items-center gap-1 pt-0.5 text-[11.5px] font-medium text-brand hover:text-brand-light"
                >
                  Revisar credenciais
                  <ChevronRight size={12} aria-hidden />
                </Link>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

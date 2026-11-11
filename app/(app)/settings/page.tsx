import type { ReactNode } from "react";
import { Check, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldLabel, Select, TextInput } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page";
import { currentUser } from "@/lib/data";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-panel/40">
      <header className="border-b border-line px-4 py-3">
        <h2 className="text-[13px] font-semibold text-ink">{title}</h2>
        <p className="mt-0.5 text-[11.5px] text-muted">{description}</p>
      </header>
      <div className="space-y-4 p-4">{children}</div>
    </section>
  );
}

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configurações do workspace, aparência e políticas de acesso."
      >
        <Button variant="primary">Salvar alterações</Button>
      </PageHeader>

      <div className="max-w-3xl space-y-4">
        <Section
          title="Workspace"
          description="Identificação usada em convites, integrações e no CLI."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <FieldLabel htmlFor="workspace-name">Nome do workspace</FieldLabel>
              <TextInput id="workspace-name" defaultValue={currentUser.workspace} />
            </div>
            <div className="space-y-1.5">
              <FieldLabel htmlFor="workspace-slug" hint="usado no CLI">
                Slug
              </FieldLabel>
              <TextInput id="workspace-slug" defaultValue="agroplay" className="font-mono text-[12.5px]" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <FieldLabel htmlFor="workspace-region">Região de armazenamento</FieldLabel>
              <Select id="workspace-region" defaultValue="sa-east-1">
                <option value="sa-east-1">South America (São Paulo) — sa-east-1</option>
                <option value="us-east-1">US East (Virginia) — us-east-1</option>
                <option value="eu-central-1">Europe (Frankfurt) — eu-central-1</option>
              </Select>
            </div>
          </div>
        </Section>

        <Section title="Aparência" description="Tema padrão da interface. O tema escuro é o padrão do PRIVault.">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-md border border-brand/40 bg-brand/5 px-3 py-2.5">
              <span className="flex size-8 items-center justify-center rounded border border-line bg-canvas text-brand">
                <Moon size={15} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-medium text-ink">Escuro</p>
                <p className="text-[11px] text-muted">Tema ativo</p>
              </div>
              <Check size={14} aria-hidden className="text-brand" />
            </div>

            <div
              role="radio"
              aria-checked="false"
              aria-disabled="true"
              title="Tema claro disponível em breve"
              className="flex items-center gap-3 rounded-md border border-line bg-panel/60 px-3 py-2.5 opacity-60"
            >
              <span className="flex size-8 items-center justify-center rounded border border-line bg-surface text-muted">
                <span className="size-3.5 rounded-full border border-muted" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-medium text-ink">Claro</p>
                <p className="text-[11px] text-muted">Disponível em breve</p>
              </div>
            </div>
          </div>
          <p className="text-[11.5px] text-muted">
            Densidade compacta e tipografia em Inter são aplicadas em todos os temas.
          </p>
        </Section>

        <Section
          title="Segurança"
          description="Regras aplicadas a todos os membros do workspace."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <FieldLabel htmlFor="session-timeout">Bloqueio por inatividade</FieldLabel>
              <Select id="session-timeout" defaultValue="30">
                <option value="15">15 minutos</option>
                <option value="30">30 minutos</option>
                <option value="60">1 hora</option>
                <option value="never">Nunca</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <FieldLabel htmlFor="production-access">Acesso a production</FieldLabel>
              <Select id="production-access" defaultValue="approval">
                <option value="approval">Exige aprovação</option>
                <option value="admin">Somente administradores</option>
                <option value="all">Todos os membros</option>
              </Select>
            </div>
          </div>
          <p className="text-[11.5px] text-muted">
            Toda leitura de credenciais em produção é registrada no log de auditoria.
          </p>
        </Section>
      </div>
    </div>
  );
}

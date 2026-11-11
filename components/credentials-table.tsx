"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  KeyRound,
  Lock,
  MoreHorizontal,
  Search,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  environmentLabels,
  type Credential,
  type CredentialType,
  type Environment,
} from "@/lib/data";
import { EnvironmentBadge } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { Select, TextInput } from "@/components/ui/field";
import { Table, Td, Th, Tr } from "@/components/ui/table";

const typeLabels: Record<CredentialType, string> = {
  Secret: "Secret",
  "API Key": "API Key",
  Database: "Database",
  Config: "Config",
  Certificate: "Certificate",
};

const projectOptions = ["payments-api", "data-pipeline", "web-console", "infra-core", "mobile-app"];
const environmentOptions: Environment[] = ["production", "staging", "development"];
const typeOptions: CredentialType[] = ["Secret", "API Key", "Database", "Config", "Certificate"];

function CopyValueButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <IconButton
      label={copied ? "Copiado" : `Copiar ${value}`}
      onClick={copy}
      className={cn("opacity-0 group-hover:opacity-100 focus-visible:opacity-100", copied && "opacity-100 text-success hover:text-success")}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </IconButton>
  );
}

export function CredentialsTable({
  items,
  initialQuery = "",
  showFilters = true,
  emptyTitle = "Nenhuma credencial encontrada",
  emptyHint = "Ajuste os filtros ou crie uma nova credencial neste projeto.",
}: {
  items: Credential[];
  initialQuery?: string;
  showFilters?: boolean;
  emptyTitle?: string;
  emptyHint?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [project, setProject] = useState("all");
  const [environment, setEnvironment] = useState("all");
  const [type, setType] = useState("all");
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.favorite])),
  );

  const hasFilters =
    query.trim() !== "" || project !== "all" || environment !== "all" || type !== "all";

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesTerm =
        !term ||
        item.key.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.project.toLowerCase().includes(term);
      const matchesProject = project === "all" || item.project === project;
      const matchesEnv = environment === "all" || item.environment === environment;
      const matchesType = type === "all" || item.type === type;
      return matchesTerm && matchesProject && matchesEnv && matchesType;
    });
  }, [items, query, project, environment, type]);

  function clearFilters() {
    setQuery("");
    setProject("all");
    setEnvironment("all");
    setType("all");
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-panel/40">
      {showFilters ? (
        <div className="flex flex-col gap-2 border-b border-line p-3 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-xs">
            <Search
              size={14}
              aria-hidden
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <TextInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filtrar por nome ou descrição…"
              aria-label="Filtrar credenciais"
              className="pl-8"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 lg:w-auto">
            <Select
              value={project}
              onChange={(event) => setProject(event.target.value)}
              aria-label="Filtrar por projeto"
              className="min-w-0 lg:w-36"
            >
              <option value="all">Projeto: todos</option>
              {projectOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <Select
              value={environment}
              onChange={(event) => setEnvironment(event.target.value)}
              aria-label="Filtrar por ambiente"
              className="min-w-0 lg:w-36"
            >
              <option value="all">Ambiente: todos</option>
              {environmentOptions.map((option) => (
                <option key={option} value={option}>
                  {environmentLabels[option]}
                </option>
              ))}
            </Select>
            <Select
              value={type}
              onChange={(event) => setType(event.target.value)}
              aria-label="Filtrar por tipo"
              className="min-w-0 lg:w-32"
            >
              <option value="all">Tipo: todos</option>
              {typeOptions.map((option) => (
                <option key={option} value={option}>
                  {typeLabels[option]}
                </option>
              ))}
            </Select>
          </div>

          {hasFilters ? (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="self-start lg:ml-auto">
              <X size={13} aria-hidden />
              Limpar
            </Button>
          ) : null}
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <Table>
          <thead>
            <tr>
              <Th className="w-[38%]">Credencial</Th>
              <Th>Projeto</Th>
              <Th>Ambiente</Th>
              <Th>Tipo</Th>
              <Th className="hidden lg:table-cell">Atualizada</Th>
              <Th className="w-20 text-right">
                <span className="sr-only">Ações</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const isFavorite = favorites[item.id];
              return (
                <Tr key={item.id} className="group">
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                        aria-pressed={isFavorite}
                        onClick={() => setFavorites((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                        className={cn(
                          "inline-flex size-6 shrink-0 items-center justify-center rounded transition-colors",
                          isFavorite
                            ? "text-brand"
                            : "text-line hover:text-muted focus-visible:text-muted",
                        )}
                      >
                        <Star size={13} fill={isFavorite ? "currentColor" : "none"} />
                      </button>
                      <div className="flex min-w-0 items-center gap-2">
                        <Lock size={12} aria-hidden className="shrink-0 text-muted" />
                        <span className="truncate font-mono text-[12.5px] text-ink">
                          {item.key}
                        </span>
                      </div>
                    </div>
                    <p className="mt-0.5 truncate pl-[38px] text-[11.5px] text-muted">
                      {item.description}
                    </p>
                  </Td>
                  <Td className="text-muted">{item.project}</Td>
                  <Td>
                    <EnvironmentBadge environment={item.environment} />
                  </Td>
                  <Td className="text-muted">{typeLabels[item.type]}</Td>
                  <Td className="hidden lg:table-cell">
                    <span className="block text-[12px] text-ink">{item.updatedAt}</span>
                    <span className="block text-[11px] text-muted">por {item.updatedBy}</span>
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <CopyValueButton value={item.key} />
                      <IconButton label={`Mais ações para ${item.key}`} className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100">
                        <MoreHorizontal size={15} />
                      </IconButton>
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      ) : (
        <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-16 text-center">
          <span className="mb-1 flex size-9 items-center justify-center rounded-md border border-line bg-surface text-muted">
            <KeyRound size={16} />
          </span>
          <p className="text-[13px] font-medium text-ink">{emptyTitle}</p>
          <p className="max-w-sm text-[12px] text-muted">{emptyHint}</p>
          {hasFilters ? (
            <Button variant="secondary" size="sm" onClick={clearFilters} className="mt-2">
              Limpar filtros
            </Button>
          ) : null}
        </div>
      )}

      <div className="flex h-9 items-center justify-between border-t border-line px-4 text-[11.5px] text-muted">
        <span>
          {filtered.length} de {items.length} credenciais
        </span>
        <span className="hidden sm:inline">Valores protegidos por criptografia ponta a ponta</span>
      </div>
    </div>
  );
}

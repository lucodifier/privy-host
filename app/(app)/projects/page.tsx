import Link from "next/link";
import { ChevronRight, FolderClosed, Plus } from "lucide-react";
import { EnvironmentBadge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { PageHeader, Panel } from "@/components/ui/page";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import { projects } from "@/lib/data";

export const metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Organize credenciais por aplicação e mantenha os ambientes separados."
      >
        <Button variant="secondary">
          <FolderClosed size={14} aria-hidden />
          Importar projeto
        </Button>
        <Button variant="primary">
          <Plus size={14} strokeWidth={2.2} aria-hidden />
          Novo projeto
        </Button>
      </PageHeader>

      <Panel>
        <Table>
          <thead>
            <tr>
              <Th className="w-[34%]">Projeto</Th>
              <Th>Ambientes</Th>
              <Th>Credenciais</Th>
              <Th>Responsável</Th>
              <Th className="hidden lg:table-cell">Atualizado</Th>
              <Th className="w-10">
                <span className="sr-only">Abrir</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <Tr key={project.slug} className="group">
                <Td>
                  <Link
                    href={`/credentials?q=${project.slug}`}
                    className="block truncate font-mono text-[12.5px] text-ink hover:text-brand-light"
                  >
                    {project.name}
                  </Link>
                  <p className="mt-0.5 truncate text-[11.5px] text-muted">{project.description}</p>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {project.environments.map((environment) => (
                      <EnvironmentBadge key={environment} environment={environment} />
                    ))}
                  </div>
                </Td>
                <Td className="tabular-nums text-muted">{project.credentials}</Td>
                <Td className="text-muted">{project.owner}</Td>
                <Td className="hidden lg:table-cell text-muted">{project.updatedAt}</Td>
                <Td className="text-right">
                  <Link
                    href={`/credentials?q=${project.slug}`}
                    aria-label={`Abrir ${project.name}`}
                    className={buttonStyles({
                      variant: "ghost",
                      size: "sm",
                      className: "size-7 px-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
                    })}
                  >
                    <ChevronRight size={14} aria-hidden />
                  </Link>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
        <div className="flex h-9 items-center justify-between border-t border-line px-4 text-[11.5px] text-muted">
          <span>{projects.length} projetos · 148 credenciais</span>
          <span className="hidden sm:inline">3 ambientes padrão</span>
        </div>
      </Panel>
    </div>
  );
}

import { Download, Plus } from "lucide-react";
import { CredentialsTable } from "@/components/credentials-table";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page";
import { credentials } from "@/lib/data";

export const metadata = { title: "All Credentials" };

export default async function CredentialsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <div className="space-y-5">
      <PageHeader
        title="All Credentials"
        description="148 credenciais distribuídas em 5 projetos e 3 ambientes."
      >
        <Button variant="secondary">
          <Download size={14} aria-hidden />
          Exportar
        </Button>
        <Button variant="primary">
          <Plus size={14} strokeWidth={2.2} aria-hidden />
          Nova credencial
        </Button>
      </PageHeader>

      <CredentialsTable items={credentials} initialQuery={q ?? ""} />
    </div>
  );
}

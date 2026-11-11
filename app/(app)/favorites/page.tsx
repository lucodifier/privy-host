import { Star } from "lucide-react";
import { CredentialsTable } from "@/components/credentials-table";
import { PageHeader } from "@/components/ui/page";
import { credentials } from "@/lib/data";

export const metadata = { title: "Favorites" };

export default function FavoritesPage() {
  const favorites = credentials.filter((credential) => credential.favorite);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Favorites"
        description="Credenciais marcadas para acesso rápido durante o dia a dia."
      />

      <div className="flex items-center gap-2 rounded-lg border border-line bg-panel/40 px-3.5 py-2.5">
        <Star size={14} aria-hidden className="text-brand" />
        <p className="text-[12px] text-muted">
          Apenas você vê esta lista. Favoritos são pessoais e não alteram permissões do workspace.
        </p>
      </div>

      <CredentialsTable
        items={favorites}
        showFilters={false}
        emptyTitle="Nenhum favorito ainda"
        emptyHint="Marque credenciais com a estrela para encontrá-las rapidamente aqui."
      />
    </div>
  );
}

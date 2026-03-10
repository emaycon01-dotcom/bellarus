import { useEffect, useState } from "react";
import { FileText, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DocRecord {
  id: string;
  document_type: string;
  document_name: string;
  created_at: string;
}

const DocumentHistory = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchDocs = async () => {
      setLoading(true);
      const { data, error } = await (supabase.from("document_history" as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false }) as any);
      if (!error && data) setDocuments(data);
      setLoading(false);
    };
    fetchDocs();
  }, [user]);

  const filtered = documents.filter(
    (d) =>
      d.document_type.toLowerCase().includes(search.toLowerCase()) ||
      d.document_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Histórico de Documentos</h1>
        <p className="text-sm text-muted-foreground mt-1">Todos os documentos criados na sua conta</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar documentos..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center">
          <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
          <p className="text-sm text-muted-foreground mt-3">Carregando documentos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground/30" />
          <div>
            <p className="font-display font-semibold text-foreground">Nenhum documento encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Seus documentos aparecerão aqui após serem criados.
            </p>
          </div>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">{doc.document_type}</td>
                  <td className="py-3 px-4 text-muted-foreground">{doc.document_name}</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {new Date(doc.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success/10 text-success">
                      Concluído
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">{filtered.length} documento(s) encontrado(s)</p>
    </div>
  );
};

export default DocumentHistory;

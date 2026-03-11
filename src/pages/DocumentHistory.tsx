import { useEffect, useState } from "react";
import { FileText, Search, Loader2, Eye, Edit, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DocRecord {
  id: string;
  document_type: string;
  document_name: string;
  created_at: string;
}

interface VerificationRecord {
  id: string;
  document_type: string;
  document_name: string;
  document_data: Record<string, string>;
  photo_url: string | null;
  status: string;
  created_at: string;
}

const DOC_ROUTES: Record<string, string> = {
  
  "CIN (RG Digital)": "/dashboard/documents/cin",
  "CRLV-e Digital": "/dashboard/documents/crlve",
  "Atestado Médico": "/dashboard/documents/atestado",
  "Receita Médica": "/dashboard/documents/receita",
  "RG PDF": "/dashboard/documents/rg-pdf",
  "Comp. Santander": "/dashboard/documents/santander",
  "Arrais Náutica": "/dashboard/documents/nautica",
  "Cart. Estudante PDF": "/dashboard/documents/estudante",
  "Comp. de Renda": "/dashboard/documents/renda",
  "Comprovante de Residência": "/dashboard/documents/residencia",
  "Certidão de Nascimento": "/dashboard/documents/certidao-nascimento",
  "Certidão de Casamento": "/dashboard/documents/certidao-casamento",
  "E-SIM Chip Virtual": "/dashboard/documents/esim",
  "Diploma": "/dashboard/documents/diploma",
  "Certificado Escolar": "/dashboard/documents/certificado-escolar",
  "Declaração Escolar": "/dashboard/documents/declaracao-escolar",
  "Histórico Escolar": "/dashboard/documents/historico-escolar",
  "Náutica PDF": "/dashboard/documents/nautica",
};

const DocumentHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewDoc, setViewDoc] = useState<VerificationRecord | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchDocs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("document_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
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

  const handleView = async (doc: DocRecord) => {
    if (!user) return;
    setViewLoading(true);
    const { data } = await supabase
      .from("document_verifications")
      .select("*")
      .eq("user_id", user.id)
      .eq("document_type", doc.document_type)
      .eq("document_name", doc.document_name)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (data) {
      setViewDoc(data as unknown as VerificationRecord);
    }
    setViewLoading(false);
  };

  const handleEdit = (doc: DocRecord) => {
    const route = DOC_ROUTES[doc.document_type];
    if (route) {
      navigate(route);
    } else {
      navigate("/dashboard/documents");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Meus Documentos</h1>
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
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações</th>
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
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs gap-1"
                        onClick={() => handleView(doc)}
                        disabled={viewLoading}
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs gap-1"
                        onClick={() => handleEdit(doc)}
                      >
                        <Edit className="w-3.5 h-3.5" /> Editar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">{filtered.length} documento(s) encontrado(s)</p>

      {/* View Document Dialog */}
      <Dialog open={!!viewDoc} onOpenChange={(open) => !open && setViewDoc(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {viewDoc?.document_type}
            </DialogTitle>
          </DialogHeader>
          {viewDoc && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Nome</p>
                  <p className="font-medium text-foreground">{viewDoc.document_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Status</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success/10 text-success">
                    {viewDoc.status === "valid" ? "Válido" : viewDoc.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Data de criação</p>
                  <p className="font-medium text-foreground">
                    {new Date(viewDoc.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              {viewDoc.document_data && Object.keys(viewDoc.document_data).length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dados do Documento</p>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    {Object.entries(viewDoc.document_data).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}</span>
                        <span className="font-medium text-foreground text-right max-w-[60%] truncate">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewDoc.id && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 w-full"
                    onClick={() => window.open(`${window.location.origin}/verificar/${viewDoc.id}`, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" /> Verificar Autenticidade
                  </Button>
                </div>
              )}

              <Button
                className="w-full gap-2"
                onClick={() => {
                  setViewDoc(null);
                  const route = DOC_ROUTES[viewDoc.document_type];
                  if (route) navigate(route);
                }}
              >
                <Edit className="w-4 h-4" /> Criar Novo / Editar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentHistory;

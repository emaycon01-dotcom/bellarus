import { FileText, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const DocumentHistory = () => {
  // Mock data
  const documents: { name: string; type: string; date: string; status: string }[] = [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Histórico de Documentos</h1>
        <p className="text-sm text-muted-foreground mt-1">Todos os documentos criados na sua conta</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar documentos..." className="pl-10" />
      </div>

      {documents.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground/30" />
          <div>
            <p className="font-display font-semibold text-foreground">Nenhum documento criado</p>
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
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Documento</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-3 px-4 font-medium text-foreground">{doc.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{doc.type}</td>
                  <td className="py-3 px-4 text-muted-foreground">{doc.date}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success/10 text-success">
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Download className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DocumentHistory;

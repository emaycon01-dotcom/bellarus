import { FileText, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const modules = [
  { name: "CNH Digital", desc: "Carteira Nacional de Habilitação", available: true },
  { name: "RG Digital", desc: "Registro Geral", available: true },
  { name: "Atestado Médico", desc: "Atestados com QR Code", available: true },
  { name: "Receita Médica", desc: "Receitas médicas digitais", available: true },
  { name: "Certidão de Nascimento", desc: "Certidões de nascimento", available: true },
  { name: "Certidão de Casamento", desc: "Certidões de casamento", available: true },
  { name: "Comprovante de Residência", desc: "Comprovantes de endereço", available: false },
  { name: "Declaração", desc: "Declarações diversas", available: false },
];

const Documents = () => {
  const navigate = useNavigate();

  const handleModuleClick = (modName: string) => {
    if (modName === "CNH Digital") {
      navigate("/dashboard/documents/cnh");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Módulos de Documentos</h1>
          <p className="text-sm text-muted-foreground mt-1">Selecione o tipo de documento para criar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => (
          <div
            key={mod.name}
            onClick={() => mod.available && handleModuleClick(mod.name)}
            className={`glass-card p-6 space-y-4 transition-all ${mod.available ? "hover:shadow-xl cursor-pointer hover:border-accent/50" : "opacity-50"}`}
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl navy-gradient flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              {mod.available ? (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-success/10 text-success">
                  Disponível
                </span>
              ) : (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  Em breve
                </span>
              )}
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">{mod.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{mod.desc}</p>
            </div>
            {mod.available && (
              <Button size="sm" className="w-full navy-gradient text-primary-foreground">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Criar Documento
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="glass-card p-6 border-dashed border-2 border-border">
        <div className="text-center space-y-3">
          <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground text-sm">Área do Administrador</p>
            <p className="text-xs text-muted-foreground">
              O administrador pode adicionar ou remover PDFs editáveis em cada módulo diretamente pelo painel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;

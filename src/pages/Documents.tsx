import { FileText, CreditCard, Anchor, Car, Home, ScrollText, Smartphone, Award, BookOpen, Stethoscope, Activity, Heart, Eye, Clock, FileCheck, Landmark, Ship, GraduationCap, DollarSign, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DocModule {
  name: string;
  desc: string;
  available: boolean;
  example?: boolean;
  isNew?: boolean;
  icon: React.ReactNode;
  iconColor: string;
  category: string;
}

const modules: DocModule[] = [
  // DOCUMENTOS DIGITAIS
  { name: "CNH Digital (2024)", desc: "CNH Digital com login, APK e QR Code", available: true, example: true, icon: <FileText className="w-5 h-5" />, iconColor: "from-primary to-accent", category: "DOCUMENTOS DIGITAIS" },
  { name: "CIN (RG Digital)", desc: "Carteira de Identidade Nacional", available: true, example: true, icon: <CreditCard className="w-5 h-5" />, iconColor: "from-accent to-primary", category: "DOCUMENTOS DIGITAIS" },
  { name: "Arrais Náutica", desc: "Habilitação Náutica Digital", available: true, icon: <Anchor className="w-5 h-5" />, iconColor: "from-success to-accent", category: "DOCUMENTOS DIGITAIS" },

  // PDF
  { name: "RG PDF", desc: "RG em PDF com dados completos", available: true, isNew: true, icon: <FileCheck className="w-5 h-5" />, iconColor: "from-success to-primary", category: "PDF" },
  { name: "CRLV-e Digital", desc: "Certificado de Registro e Licenciamento de Veículo", available: true, icon: <Car className="w-5 h-5" />, iconColor: "from-primary to-ring", category: "PDF" },
  { name: "Náutica PDF", desc: "CHA em PDF com dados completos", available: true, isNew: true, icon: <Ship className="w-5 h-5" />, iconColor: "from-accent to-success", category: "PDF" },
  { name: "Comp. Santander", desc: "Comprovante bancário Santander", available: true, isNew: true, icon: <Landmark className="w-5 h-5" />, iconColor: "from-destructive to-warning", category: "PDF" },
  { name: "Comprovante de Residência", desc: "Comprovante de endereço", available: true, icon: <Home className="w-5 h-5" />, iconColor: "from-muted-foreground to-secondary", category: "PDF" },
  { name: "Comp. de Renda", desc: "Recibo de pagamento de salário", available: true, isNew: true, icon: <TrendingUp className="w-5 h-5" />, iconColor: "from-success to-accent", category: "PDF" },
  { name: "Cart. Estudante PDF", desc: "Carteirinha de estudante universitária", available: true, isNew: true, icon: <GraduationCap className="w-5 h-5" />, iconColor: "from-warning to-destructive", category: "PDF" },

  // ATESTADOS
  { name: "Atestado Médico", desc: "Atestados com QR Code e IA", available: true, icon: <Stethoscope className="w-5 h-5" />, iconColor: "from-destructive to-primary", category: "ATESTADOS" },
  { name: "Receita Médica", desc: "Receitas médicas com IA inteligente", available: true, icon: <Activity className="w-5 h-5" />, iconColor: "from-primary to-accent", category: "ATESTADOS" },

  // CERTIDÕES
  { name: "Certidão de Nascimento", desc: "Certidões de nascimento", available: true, icon: <Heart className="w-5 h-5" />, iconColor: "from-destructive to-warning", category: "CERTIDÕES" },
  { name: "Certidão de Casamento", desc: "Certidões de casamento", available: true, icon: <ScrollText className="w-5 h-5" />, iconColor: "from-warning to-gold", category: "CERTIDÕES" },

  // OUTROS
  { name: "E-SIM Chip Virtual", desc: "Chip virtual eSIM", available: true, icon: <Smartphone className="w-5 h-5" />, iconColor: "from-primary to-accent", category: "OUTROS" },
  { name: "Diploma", desc: "Diploma de graduação", available: true, icon: <Award className="w-5 h-5" />, iconColor: "from-warning to-gold", category: "OUTROS" },
  { name: "Certificado Escolar", desc: "Certificado de conclusão escolar", available: true, icon: <BookOpen className="w-5 h-5" />, iconColor: "from-success to-primary", category: "OUTROS" },
  { name: "Declaração Escolar", desc: "Declaração de matrícula escolar", available: true, icon: <ScrollText className="w-5 h-5" />, iconColor: "from-muted-foreground to-secondary", category: "OUTROS" },
  { name: "Histórico Escolar", desc: "Histórico escolar com notas e brasão", available: true, isNew: true, icon: <BookOpen className="w-5 h-5" />, iconColor: "from-primary to-warning", category: "OUTROS" },
];

const categoryOrder = ["DOCUMENTOS DIGITAIS", "PDF", "ATESTADOS", "CERTIDÕES", "OUTROS"];

const Documents = () => {
  const navigate = useNavigate();

  const routeMap: Record<string, string> = {
    "CNH Digital (2024)": "/dashboard/documents/cnh",
    "CIN (RG Digital)": "/dashboard/documents/cin",
    "Náutica PDF": "/dashboard/documents/nautica",
    "Arrais Náutica": "/dashboard/documents/nautica",
    "RG PDF": "/dashboard/documents/rg-pdf",
    "CRLV-e Digital": "/dashboard/documents/crlve",
    "Comp. Santander": "/dashboard/documents/santander",
    "Comprovante de Residência": "/dashboard/documents/residencia",
    "Comp. de Renda": "/dashboard/documents/renda",
    "Cart. Estudante PDF": "/dashboard/documents/estudante",
    "Atestado Médico": "/dashboard/documents/atestado",
    "Receita Médica": "/dashboard/documents/receita",
    "Certidão de Nascimento": "/dashboard/documents/certidao-nascimento",
    "Certidão de Casamento": "/dashboard/documents/certidao-casamento",
    "E-SIM Chip Virtual": "/dashboard/documents/esim",
    "Diploma": "/dashboard/documents/diploma",
    "Certificado Escolar": "/dashboard/documents/certificado-escolar",
    "Declaração Escolar": "/dashboard/documents/declaracao-escolar",
  };

  const handleModuleClick = (mod: DocModule) => {
    if (!mod.available) return;
    const route = routeMap[mod.name];
    if (route) navigate(route);
  };

  const grouped = categoryOrder
    .map((cat) => ({ category: cat, items: modules.filter((m) => m.category === cat) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold text-foreground">Módulos de Documentos</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Escolha um serviço para começar</p>
      </div>

      {grouped.map((group) => (
        <div key={group.category} className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{group.category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {group.items.map((mod) => (
              <div
                key={mod.name}
                onClick={() => handleModuleClick(mod)}
                className={`glass-card px-4 py-4 flex flex-col gap-3 transition-all relative overflow-hidden ${
                  mod.available
                    ? "hover:border-accent/60 cursor-pointer hover:shadow-lg hover:shadow-primary/5"
                    : "opacity-50"
                }`}
              >
                {mod.isNew && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-success/20 text-success flex items-center gap-1">
                    ✦ Novo
                  </span>
                )}
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${mod.iconColor} flex items-center justify-center shrink-0 text-white shadow-lg`}>
                  {mod.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-sm text-foreground">{mod.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{mod.desc}</p>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/30">
                  <span className="text-xs font-mono font-bold text-primary">1 Crédito</span>
                  <div className="flex items-center gap-2">
                    {mod.example && (
                      <span className="flex items-center gap-1 text-[10px] text-success">
                        <Eye className="w-3 h-3" />
                        Exemplo
                      </span>
                    )}
                    {mod.available ? (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-success/20 text-success">
                        ✓ Ativo
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Breve
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Documents;

import { FileText, CreditCard, Anchor, Globe, GraduationCap, Car, Home, ScrollText, Smartphone, Award, BookOpen, Stethoscope, Activity, Heart, Image, Eye, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DocModule {
  name: string;
  desc: string;
  credits: number;
  available: boolean;
  example?: boolean;
  icon: React.ReactNode;
  category: string;
}

const modules: DocModule[] = [
  // DOCUMENTOS DIGITAIS
  { name: "CNH Digital (2024)", desc: "Carteira Nacional de Habilitação", credits: 1, available: true, example: true, icon: <FileText className="w-5 h-5" />, category: "DOCUMENTOS DIGITAIS" },
  { name: "CIN (RG Digital)", desc: "Carteira de Identidade Nacional", credits: 1, available: true, example: true, icon: <CreditCard className="w-5 h-5" />, category: "DOCUMENTOS DIGITAIS" },
  { name: "Arrais Náutica", desc: "Habilitação Náutica", credits: 1, available: true, example: true, icon: <Anchor className="w-5 h-5" />, category: "DOCUMENTOS DIGITAIS" },
  { name: "Passaporte Digital", desc: "Passaporte Brasileiro", credits: 1, available: true, icon: <Globe className="w-5 h-5" />, category: "DOCUMENTOS DIGITAIS" },

  // CARTEIRA ESTUDANTIL
  { name: "ABAFE", desc: "Carteira de Estudante", credits: 1, available: true, example: true, icon: <GraduationCap className="w-5 h-5" />, category: "CARTEIRA ESTUDANTIL" },

  // PDF
  { name: "CRLV-e Digital", desc: "Certificado de Registro e Licenciamento de Veículo", credits: 1, available: true, icon: <Car className="w-5 h-5" />, category: "PDF" },
  { name: "Comprovante de Residência", desc: "Comprovante de endereço", credits: 1, available: true, icon: <Home className="w-5 h-5" />, category: "PDF" },

  // ATESTADOS
  { name: "Atestado Médico", desc: "Atestados com QR Code", credits: 1, available: true, icon: <Stethoscope className="w-5 h-5" />, category: "ATESTADOS" },
  { name: "Receita Médica", desc: "Receitas médicas digitais", credits: 1, available: true, icon: <Activity className="w-5 h-5" />, category: "ATESTADOS" },

  // CERTIDÕES
  { name: "Certidão de Nascimento", desc: "Certidões de nascimento", credits: 1, available: true, icon: <Heart className="w-5 h-5" />, category: "CERTIDÕES" },
  { name: "Certidão de Casamento", desc: "Certidões de casamento", credits: 1, available: true, icon: <ScrollText className="w-5 h-5" />, category: "CERTIDÕES" },

  // OUTROS
  { name: "E-SIM Chip Virtual", desc: "Chip virtual eSIM", credits: 1, available: true, icon: <Smartphone className="w-5 h-5" />, category: "OUTROS" },
  { name: "Diploma", desc: "Diploma de graduação", credits: 1, available: true, icon: <Award className="w-5 h-5" />, category: "OUTROS" },
  { name: "Certificado Escolar", desc: "Certificado de conclusão escolar", credits: 1, available: true, icon: <BookOpen className="w-5 h-5" />, category: "OUTROS" },
  { name: "Declaração Escolar", desc: "Declaração de matrícula escolar", credits: 1, available: true, icon: <ScrollText className="w-5 h-5" />, category: "OUTROS" },

  // IMAGENS MANIPULADAS
  { name: "CNH em cima da mesa", desc: "Mockup realista de CNH", credits: 1, available: true, icon: <Image className="w-5 h-5" />, category: "IMAGENS MANIPULADAS" },
  { name: "RG em cima da mesa", desc: "Mockup realista de RG", credits: 1, available: true, icon: <Image className="w-5 h-5" />, category: "IMAGENS MANIPULADAS" },
  { name: "Passaporte em cima da mesa", desc: "Mockup realista de Passaporte", credits: 1, available: true, icon: <Image className="w-5 h-5" />, category: "IMAGENS MANIPULADAS" },
];

const categoryOrder = ["DOCUMENTOS DIGITAIS", "CARTEIRA ESTUDANTIL", "PDF", "ATESTADOS", "CERTIDÕES", "OUTROS", "IMAGENS MANIPULADAS"];

const Documents = () => {
  const navigate = useNavigate();

  const handleModuleClick = (mod: DocModule) => {
    if (!mod.available) return;
    if (mod.name === "CNH Digital (2024)") {
      navigate("/dashboard/documents/cnh");
    }
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
                className={`glass-card px-4 py-3.5 flex items-center gap-3 transition-all ${
                  mod.available
                    ? "hover:border-accent/60 cursor-pointer"
                    : "opacity-60"
                }`}
              >
                <div className="w-10 h-10 rounded-lg navy-gradient flex items-center justify-center shrink-0 text-primary-foreground">
                  {mod.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground truncate">{mod.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{mod.desc}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {mod.example && (
                    <span className="flex items-center gap-1 text-[10px] text-green-400">
                      <Eye className="w-3 h-3" />
                      Exemplo
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{mod.credits} cred.</span>
                  {mod.available ? (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
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
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Documents;

import { FileText, CreditCard, Anchor, Car, Home, ScrollText, Smartphone, Award, BookOpen, Stethoscope, Activity, Heart, Eye, Clock, FileCheck, Landmark, Ship, GraduationCap, DollarSign, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DocModule {
  name: string;
  desc: string;
  credits: number;
  price: number;
  available: boolean;
  example?: boolean;
  isNew?: boolean;
  icon: React.ReactNode;
  iconColor: string;
  category: string;
}

const modules: DocModule[] = [
  // DOCUMENTOS DIGITAIS
  { name: "CNH Digital (2024)", desc: "CNH Digital com login, APK e QR Code", credits: 1, price: 20, available: true, example: true, icon: <FileText className="w-5 h-5" />, iconColor: "from-amber-500 to-yellow-600", category: "DOCUMENTOS DIGITAIS" },
  { name: "CIN (RG Digital)", desc: "Carteira de Identidade Nacional", credits: 1, price: 20, available: true, example: true, icon: <CreditCard className="w-5 h-5" />, iconColor: "from-blue-500 to-cyan-500", category: "DOCUMENTOS DIGITAIS" },
  { name: "Arrais Náutica", desc: "Habilitação Náutica Digital", credits: 1, price: 20, available: false, icon: <Anchor className="w-5 h-5" />, iconColor: "from-teal-500 to-emerald-500", category: "DOCUMENTOS DIGITAIS" },

  // PDF
  { name: "RG PDF", desc: "RG em PDF com dados completos", credits: 0.75, price: 15, available: true, isNew: true, icon: <FileCheck className="w-5 h-5" />, iconColor: "from-emerald-500 to-green-600", category: "PDF" },
  { name: "CRLV-e Digital", desc: "Certificado de Registro e Licenciamento de Veículo", credits: 1, price: 20, available: true, icon: <Car className="w-5 h-5" />, iconColor: "from-blue-600 to-indigo-600", category: "PDF" },
  { name: "Náutica PDF", desc: "CHA em PDF com dados completos", credits: 0.75, price: 15, available: true, isNew: true, icon: <Ship className="w-5 h-5" />, iconColor: "from-cyan-500 to-teal-500", category: "PDF" },
  { name: "Comp. Santander", desc: "Comprovante bancário Santander", credits: 0.5, price: 10, available: true, isNew: true, icon: <Landmark className="w-5 h-5" />, iconColor: "from-red-500 to-rose-600", category: "PDF" },
  { name: "Comprovante de Residência", desc: "Comprovante de endereço", credits: 1, price: 20, available: false, icon: <Home className="w-5 h-5" />, iconColor: "from-slate-500 to-gray-600", category: "PDF" },
  { name: "Comp. de Renda", desc: "Recibo de pagamento de salário", credits: 1, price: 20, available: true, isNew: true, icon: <TrendingUp className="w-5 h-5" />, iconColor: "from-green-500 to-emerald-600", category: "PDF" },
  { name: "Cart. Estudante PDF", desc: "Carteirinha de estudante universitária", credits: 1, price: 20, available: true, isNew: true, icon: <GraduationCap className="w-5 h-5" />, iconColor: "from-orange-500 to-red-500", category: "PDF" },

  // ATESTADOS
  { name: "Atestado Médico", desc: "Atestados com QR Code", credits: 1, price: 20, available: true, icon: <Stethoscope className="w-5 h-5" />, iconColor: "from-pink-500 to-rose-500", category: "ATESTADOS" },
  { name: "Receita Médica", desc: "Receitas médicas digitais", credits: 1, price: 20, available: true, icon: <Activity className="w-5 h-5" />, iconColor: "from-violet-500 to-purple-600", category: "ATESTADOS" },

  // CERTIDÕES
  { name: "Certidão de Nascimento", desc: "Certidões de nascimento", credits: 1, price: 20, available: false, icon: <Heart className="w-5 h-5" />, iconColor: "from-pink-400 to-rose-500", category: "CERTIDÕES" },
  { name: "Certidão de Casamento", desc: "Certidões de casamento", credits: 1, price: 20, available: false, icon: <ScrollText className="w-5 h-5" />, iconColor: "from-amber-400 to-orange-500", category: "CERTIDÕES" },

  // OUTROS
  { name: "E-SIM Chip Virtual", desc: "Chip virtual eSIM", credits: 1, price: 20, available: false, icon: <Smartphone className="w-5 h-5" />, iconColor: "from-indigo-500 to-blue-600", category: "OUTROS" },
  { name: "Diploma", desc: "Diploma de graduação", credits: 1, price: 20, available: false, icon: <Award className="w-5 h-5" />, iconColor: "from-yellow-500 to-amber-600", category: "OUTROS" },
  { name: "Certificado Escolar", desc: "Certificado de conclusão escolar", credits: 1, price: 20, available: false, icon: <BookOpen className="w-5 h-5" />, iconColor: "from-emerald-400 to-teal-500", category: "OUTROS" },
  { name: "Declaração Escolar", desc: "Declaração de matrícula escolar", credits: 1, price: 20, available: false, icon: <ScrollText className="w-5 h-5" />, iconColor: "from-slate-400 to-gray-500", category: "OUTROS" },
];

const categoryOrder = ["DOCUMENTOS DIGITAIS", "PDF", "ATESTADOS", "CERTIDÕES", "OUTROS"];

const formatPrice = (v: number) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

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
                className={`glass-card px-4 py-4 flex flex-col gap-3 transition-all relative overflow-hidden ${
                  mod.available
                    ? "hover:border-accent/60 cursor-pointer hover:shadow-lg hover:shadow-primary/5"
                    : "opacity-50"
                }`}
              >
                {/* New badge */}
                {mod.isNew && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                    ✦ Novo
                  </span>
                )}

                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${mod.iconColor} flex items-center justify-center shrink-0 text-white shadow-lg`}>
                  {mod.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-sm text-foreground">{mod.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{mod.desc}</p>
                </div>

                {/* Price & Credits row */}
                <div className="flex items-center justify-between pt-1 border-t border-border/30">
                  <span className="text-sm font-display font-bold text-foreground">R${formatPrice(mod.price)}</span>
                  <div className="flex items-center gap-2">
                    {mod.example && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <Eye className="w-3 h-3" />
                        Exemplo
                      </span>
                    )}
                    <span className="text-xs font-mono font-bold text-primary">{mod.credits} CR</span>
                    {mod.available ? (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
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

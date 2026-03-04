import { FileText, CreditCard, History, TrendingUp } from "lucide-react";

const stats = [
  { label: "Documentos Criados", value: "0", icon: FileText, color: "navy-gradient" },
  { label: "Créditos Disponíveis", value: "0", icon: CreditCard, color: "gold-gradient" },
  { label: "Documentos este mês", value: "0", icon: TrendingUp, color: "navy-gradient" },
  { label: "Total no Histórico", value: "0", icon: History, color: "navy-gradient" },
];

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Painel Principal</h1>
        <p className="text-muted-foreground text-sm mt-1">Bem-vindo ao BELLARUS SISTEMAS</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</span>
              <div className={`w-9 h-9 ${s.color} rounded-lg flex items-center justify-center`}>
                <s.icon className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-display font-semibold text-foreground">Módulos de Documentos</h2>
        <p className="text-sm text-muted-foreground">
          Acesse o menu "Documentos" para criar seus documentos digitais e físicos.
          Cada documento consome 1 crédito. Recarregue na aba "Recargas".
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {["CNH Digital", "RG Digital", "Atestado Médico", "Receita Médica", "Certidão de Nascimento", "Certidão de Casamento", "Comprovante de Residência", "Declaração"].map((doc) => (
            <div
              key={doc}
              className="p-4 rounded-xl border border-border hover:border-accent/50 hover:shadow-md transition-all cursor-pointer bg-card text-center"
            >
              <FileText className="w-8 h-8 mx-auto text-primary mb-2" />
              <span className="text-xs font-medium text-foreground">{doc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

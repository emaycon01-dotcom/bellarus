import { Users, DollarSign, FileText, TrendingUp, BarChart3 } from "lucide-react";

const stats = [
  { label: "Total de Usuários", value: "0", icon: Users, change: "+0%" },
  { label: "Depósitos Totais", value: "R$ 0", icon: DollarSign, change: "+0%" },
  { label: "Documentos Criados", value: "0", icon: FileText, change: "+0%" },
  { label: "Receita do Mês", value: "R$ 0", icon: TrendingUp, change: "+0%" },
];

const AdminPanel = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Painel Administrativo</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do sistema BELLARUS</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</span>
              <div className="w-9 h-9 navy-gradient rounded-lg flex items-center justify-center">
                <s.icon className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
            <span className="text-xs text-success font-medium">{s.change} este mês</span>
          </div>
        ))}
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-display font-semibold text-foreground">Resumo Financeiro</h2>
        </div>
        <div className="h-48 bg-muted/50 rounded-xl flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Gráficos financeiros serão exibidos aqui com dados reais</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

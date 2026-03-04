import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Users, FileText } from "lucide-react";

const financeStats = [
  { label: "Receita Total", value: "R$ 0,00", icon: DollarSign, trend: "+0%", up: true },
  { label: "Depósitos Hoje", value: "R$ 0,00", icon: ArrowUpRight, trend: "+0%", up: true },
  { label: "Clientes Ativos", value: "0", icon: Users, trend: "+0%", up: true },
  { label: "Docs Gerados", value: "0", icon: FileText, trend: "+0%", up: true },
];

const recentTransactions: { user: string; type: string; amount: string; date: string }[] = [];

const AdminFinance = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Financeiro</h1>
        <p className="text-sm text-muted-foreground mt-1">Controle financeiro completo do sistema</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {financeStats.map((s) => (
          <div key={s.label} className="glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</span>
              <div className="w-9 h-9 navy-gradient rounded-lg flex items-center justify-center">
                <s.icon className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
            <div className="flex items-center gap-1">
              {s.up ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-success" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />
              )}
              <span className={`text-xs font-medium ${s.up ? "text-success" : "text-destructive"}`}>
                {s.trend}
              </span>
              <span className="text-xs text-muted-foreground">este mês</span>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-display font-semibold text-foreground">Últimas Transações</h2>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <DollarSign className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma transação registrada ainda</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Usuário", "Tipo", "Valor", "Data"].map((h) => (
                  <th key={h} className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((t, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-2 text-foreground">{t.user}</td>
                  <td className="py-2 text-muted-foreground">{t.type}</td>
                  <td className="py-2 font-medium text-foreground">{t.amount}</td>
                  <td className="py-2 text-muted-foreground">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminFinance;

import { useState, useEffect } from "react";
import { Users, DollarSign, FileText, TrendingUp, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminPanel = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      setTotalUsers(count || 0);

      const { data: transactions } = await supabase.from("credit_transactions").select("amount, status, created_at");
      if (transactions) {
        const confirmed = transactions.filter(t => t.status === "confirmed");
        const total = confirmed.reduce((sum, t) => sum + (t.amount * 20), 0);
        setTotalDeposits(total);

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const monthTransactions = confirmed.filter(t => t.created_at >= monthStart);
        setMonthRevenue(monthTransactions.reduce((sum, t) => sum + (t.amount * 20), 0));
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: "Total de Usuários", value: String(totalUsers), icon: Users, change: "" },
    { label: "Depósitos Totais", value: `R$ ${totalDeposits.toFixed(2)}`, icon: DollarSign, change: "" },
    { label: "Documentos Criados", value: "0", icon: FileText, change: "" },
    { label: "Receita do Mês", value: `R$ ${monthRevenue.toFixed(2)}`, icon: TrendingUp, change: "" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Painel Administrativo</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do sistema BELLARUS — Dados reais</p>
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
          </div>
        ))}
      </div>
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-display font-semibold text-foreground">Resumo Financeiro</h2>
        </div>
        <div className="h-48 bg-muted/50 rounded-xl flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Dados financeiros atualizados em tempo real</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

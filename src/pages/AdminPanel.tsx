import { useState, useEffect } from "react";
import { Users, DollarSign, FileText, TrendingUp, BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const AdminPanel = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [totalDocs, setTotalDocs] = useState(0);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentTxns, setRecentTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    setTotalUsers(count || 0);

    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(5);
    setRecentUsers(profiles || []);

    const { data: transactions } = await supabase.from("credit_transactions").select("*").order("created_at", { ascending: false });
    if (transactions) {
      setRecentTxns(transactions.slice(0, 5));
      const confirmed = transactions.filter(t => t.status === "confirmed");
      const total = confirmed.reduce((sum, t) => sum + (t.amount * 20), 0);
      setTotalDeposits(total);

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const monthTransactions = confirmed.filter(t => t.created_at >= monthStart);
      setMonthRevenue(monthTransactions.reduce((sum, t) => sum + (t.amount * 20), 0));
    }
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, []);

  const stats = [
    { label: "Total de Usuários", value: String(totalUsers), icon: Users },
    { label: "Depósitos Totais", value: `R$ ${totalDeposits.toFixed(2)}`, icon: DollarSign },
    { label: "Receita do Mês", value: `R$ ${monthRevenue.toFixed(2)}`, icon: TrendingUp },
    { label: "Minha Comissão (50%)", value: `R$ ${(totalDeposits * 0.5).toFixed(2)}`, icon: BarChart3 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-sm text-muted-foreground mt-1">Visão geral do sistema — Dados em tempo real</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Atualizar
        </Button>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-display font-semibold text-foreground">Últimos Usuários</h2>
          </div>
          {recentUsers.length > 0 ? (
            <div className="space-y-3">
              {recentUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.name || "Sem nome"}</p>
                    <p className="text-xs text-muted-foreground">Plano: {u.plan} • {u.credits} CR</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum usuário cadastrado</p>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-display font-semibold text-foreground">Últimas Transações</h2>
          </div>
          {recentTxns.length > 0 ? (
            <div className="space-y-3">
              {recentTxns.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">R$ {(t.amount * 20).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{t.amount} CR • {t.type}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${t.status === "confirmed" ? "bg-success/20 text-success" : "bg-yellow-500/20 text-yellow-600"}`}>
                      {t.status === "confirmed" ? "Confirmado" : "Pendente"}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(t.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma transação registrada</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

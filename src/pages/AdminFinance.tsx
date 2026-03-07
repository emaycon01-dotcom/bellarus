import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Users, Wallet, Plus, Minus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

const tabs = ["Comissões", "Saldos", "Usuários", "Depósitos", "Recargas", "Revendedores", "Indicações", "Logs", "Vendas"];

const AdminFinance = () => {
  const [activeTab, setActiveTab] = useState("Comissões");
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "remove">("add");
  const [creditUser, setCreditUser] = useState("");
  const [creditAmount, setCreditAmount] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      const { data: txns } = await supabase.from("credit_transactions").select("*").order("created_at", { ascending: false });
      if (txns) {
        setTransactions(txns);
        const confirmed = txns.filter(t => t.status === "confirmed");
        setTotalDeposits(confirmed.reduce((sum, t) => sum + (t.amount * 20), 0));
      }
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      setTotalUsers(count || 0);
    };
    fetchData();
  }, []);

  const stats = [
    { label: "Minha Comissão (50%)", value: `R$ ${(totalDeposits * 0.5).toFixed(2)}`, icon: TrendingUp, color: "text-success" },
    { label: "Total Depósitos", value: `R$ ${totalDeposits.toFixed(2)}`, icon: DollarSign, color: "text-foreground" },
    { label: "Todos Usuários", value: String(totalUsers), icon: Users, color: "text-foreground" },
    { label: "Meu Saldo", value: "0 CR", icon: Wallet, color: "text-foreground" },
  ];

  const openCreditDialog = (mode: "add" | "remove") => {
    setDialogMode(mode);
    setCreditUser("");
    setCreditAmount(1);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle financeiro — Dados reais</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openCreditDialog("add")} className="bg-success text-success-foreground hover:bg-success/90 gap-2"><Plus className="w-4 h-4" />Adicionar Créditos</Button>
          <Button onClick={() => openCreditDialog("remove")} variant="destructive" className="gap-2"><Minus className="w-4 h-4" />Remover Créditos</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl navy-gradient flex items-center justify-center"><s.icon className="w-5 h-5 text-primary-foreground" /></div>
            </div>
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="flex overflow-x-auto border-b border-border">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}>{tab}</button>
          ))}
        </div>
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-base font-display font-semibold text-foreground">Extrato de {activeTab}</h2>
          </div>

          {activeTab === "Depósitos" || activeTab === "Comissões" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-wider">Data</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Valor</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Créditos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length > 0 ? transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-muted-foreground text-xs">{new Date(t.created_at).toLocaleString("pt-BR")}</TableCell>
                    <TableCell>R$ {(t.amount * 20).toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${t.status === "confirmed" ? "bg-success/20 text-success" : "bg-yellow-500/20 text-yellow-600"}`}>{t.status === "confirmed" ? "Confirmado" : "Pendente"}</span>
                    </TableCell>
                    <TableCell className="font-bold">{t.amount} CR</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground">Nenhuma transação registrada</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <div className="py-16 text-center">
              <DollarSign className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum registro de {activeTab.toLowerCase()} encontrado</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-display">{dialogMode === "add" ? "Adicionar Créditos" : "Remover Créditos"}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nome do usuário</label>
              <Input placeholder="Digite o nome do usuário" value={creditUser} onChange={(e) => setCreditUser(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Quantidade de créditos</label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => setCreditAmount(Math.max(1, creditAmount - 1))}><Minus className="w-4 h-4" /></Button>
                <Input type="number" min={1} max={999} value={creditAmount} onChange={(e) => setCreditAmount(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 text-center font-bold" />
                <Button variant="outline" size="icon" onClick={() => setCreditAmount(creditAmount + 1)}><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
            <Button className={`w-full font-semibold ${dialogMode === "add" ? "bg-success text-success-foreground hover:bg-success/90" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}`} onClick={() => setDialogOpen(false)}>
              {dialogMode === "add" ? "Confirmar Adição" : "Confirmar Remoção"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFinance;

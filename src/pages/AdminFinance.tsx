import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Users, Wallet, Plus, Minus, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const tabs = ["Depósitos", "Usuários", "Saldos", "Comissões"];

const AdminFinance = () => {
  const [activeTab, setActiveTab] = useState("Depósitos");
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [adminCredits, setAdminCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "remove">("add");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [creditAmount, setCreditAmount] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    const { data: txns } = await supabase.from("credit_transactions").select("*").order("created_at", { ascending: false });
    if (txns) {
      setTransactions(txns);
      const confirmed = txns.filter(t => t.status === "confirmed");
      setTotalDeposits(confirmed.reduce((sum, t) => sum + (t.amount * 20), 0));
    }
    const { data: profiles, count } = await supabase.from("profiles").select("*", { count: "exact" }).order("created_at", { ascending: false });
    setTotalUsers(count || 0);
    if (profiles) {
      setUsers(profiles);
      // Find admin credits
      const { data: { user } } = await supabase.auth.getUser();
      const adminProfile = profiles.find(p => p.id === user?.id);
      setAdminCredits(adminProfile?.credits || 0);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Realtime: auto-refresh when data changes
  useEffect(() => {
    const channel = supabase
      .channel('admin-finance-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'credit_transactions' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const openCreditDialog = (user: any, mode: "add" | "remove") => {
    setSelectedUser(user);
    setDialogMode(mode);
    setCreditAmount(1);
    setDialogOpen(true);
  };

  const handleCreditAction = async () => {
    if (!selectedUser) return;
    const newCredits = dialogMode === "add"
      ? selectedUser.credits + creditAmount
      : Math.max(0, selectedUser.credits - creditAmount);

    const { error } = await supabase.from("profiles").update({ credits: newCredits }).eq("id", selectedUser.id);
    if (error) { toast.error("Erro ao atualizar créditos."); return; }
    
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, credits: newCredits } : u));
    toast.success(`${creditAmount} CR ${dialogMode === "add" ? "adicionados a" : "removidos de"} ${selectedUser.name || "usuário"}`);
    setDialogOpen(false);
  };

  const filteredTxns = transactions.filter(t =>
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: "Minha Comissão (50%)", value: `R$ ${(totalDeposits * 0.5).toFixed(2)}`, icon: TrendingUp, color: "text-success" },
    { label: "Total Depósitos", value: `R$ ${totalDeposits.toFixed(2)}`, icon: DollarSign, color: "text-foreground" },
    { label: "Todos Usuários", value: String(totalUsers), icon: Users, color: "text-foreground" },
    { label: "Meu Saldo", value: `${adminCredits} CR`, icon: Wallet, color: "text-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle financeiro — Dados em tempo real</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Atualizar
        </Button>
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
            <button key={tab} onClick={() => { setActiveTab(tab); setSearchQuery(""); }} className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}>{tab}</button>
          ))}
        </div>
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
        </div>
        <div className="p-4">
          {activeTab === "Depósitos" || activeTab === "Comissões" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-wider">Data</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Valor</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Créditos</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTxns.length > 0 ? filteredTxns.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-muted-foreground text-xs">{new Date(t.created_at).toLocaleString("pt-BR")}</TableCell>
                    <TableCell className="font-medium">R$ {(t.amount * 20).toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${t.status === "confirmed" ? "bg-success/20 text-success" : "bg-yellow-500/20 text-yellow-600"}`}>{t.status === "confirmed" ? "Confirmado" : "Pendente"}</span>
                    </TableCell>
                    <TableCell className="font-bold">{t.amount} CR</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{t.type}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">Nenhuma transação registrada</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          ) : activeTab === "Usuários" || activeTab === "Saldos" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-wider">Nome</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Plano</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Créditos</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Cadastro</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name || "Sem nome"}</TableCell>
                    <TableCell><span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{u.plan}</span></TableCell>
                    <TableCell className="font-bold">{u.credits} CR</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-success hover:bg-success/10" onClick={() => openCreditDialog(u, "add")}><Plus className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => openCreditDialog(u, "remove")}><Minus className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">Nenhum usuário encontrado</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          ) : null}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-display">{dialogMode === "add" ? "Adicionar Créditos" : "Remover Créditos"}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm font-medium text-foreground">{selectedUser?.name || "Sem nome"}</p>
              <p className="text-xs text-muted-foreground mt-1">Saldo atual: <span className="font-bold text-foreground">{selectedUser?.credits} CR</span></p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Quantidade</label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => setCreditAmount(Math.max(1, creditAmount - 1))}><Minus className="w-4 h-4" /></Button>
                <Input type="number" min={1} value={creditAmount} onChange={(e) => setCreditAmount(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 text-center font-bold" />
                <Button variant="outline" size="icon" onClick={() => setCreditAmount(creditAmount + 1)}><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
            <Button className={`w-full font-semibold ${dialogMode === "add" ? "bg-success text-success-foreground hover:bg-success/90" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}`} onClick={handleCreditAction}>
              {dialogMode === "add" ? "Confirmar Adição" : "Confirmar Remoção"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFinance;

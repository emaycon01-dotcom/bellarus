import { useState, useEffect } from "react";
import { Search, Plus, Minus, Users, RefreshCw, Ban } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  name: string;
  credits: number;
  plan: string;
  created_at: string;
}

const roles = ["Cliente", "Dealer", "Master", "Diamont", "Admin"];

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "remove">("add");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [creditAmount, setCreditAmount] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (profiles) {
      setUsers(profiles.map(p => ({
        id: p.id,
        name: p.name || "Sem nome",
        credits: p.credits,
        plan: p.plan,
        created_at: p.created_at,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase.from("profiles").update({ plan: newRole }).eq("id", userId);
    if (error) { toast.error("Erro ao atualizar cargo."); return; }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: newRole } : u));
    toast.success(`Cargo alterado para ${newRole}`);
  };

  const openCreditDialog = (user: UserProfile, mode: "add" | "remove") => {
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
    toast.success(`${creditAmount} CR ${dialogMode === "add" ? "adicionados a" : "removidos de"} ${selectedUser.name}`);
    setDialogOpen(false);
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Gerenciar Usuários</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} usuários cadastrados — Dados reais</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">{users.length}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <RefreshCw className="w-4 h-4 mr-2" />Atualizar
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome ou ID..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cargo / Plano</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Créditos</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cadastro</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">{getInitials(user.name)}</div>
                      <div>
                        <span className="font-medium text-foreground truncate max-w-[200px] block">{user.name}</span>
                        <span className="text-[10px] text-muted-foreground">{user.id.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Select value={user.plan} onValueChange={(val) => handleRoleChange(user.id, val)}>
                      <SelectTrigger className="w-[140px] h-8 text-xs bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>{roles.map((r) => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`font-bold ${user.credits > 0 ? "text-foreground" : "text-muted-foreground"}`}>{user.credits}</span>
                    <span className="text-muted-foreground text-xs ml-1">CR</span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-xs text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-success hover:text-success hover:bg-success/10" onClick={() => openCreditDialog(user, "add")} title="Adicionar créditos"><Plus className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => openCreditDialog(user, "remove")} title="Remover créditos"><Minus className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Nenhum usuário encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{dialogMode === "add" ? "Adicionar Créditos" : "Remover Créditos"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm font-medium text-foreground">{selectedUser?.name}</p>
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

export default AdminUsers;

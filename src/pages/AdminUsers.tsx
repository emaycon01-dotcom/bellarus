import { useState } from "react";
import {
  Search,
  Shield,
  Ban,
  Crown,
  Star,
  UserCheck,
  ChevronDown,
  Plus,
  Minus,
  Copy,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface MockUser {
  id: number;
  name: string;
  email: string;
  role: string;
  credits: number;
  docs: number;
  avatar: string;
}

const mockUsers: MockUser[] = [
  { id: 1, name: "Marcelo Picada", email: "marcelopicadagomes@gmail.com", role: "Cliente", credits: 0, docs: 0, avatar: "MP" },
  { id: 2, name: "euofp", email: "filipealmeidaytt@gmail.com", role: "Cliente", credits: 0, docs: 0, avatar: "EU" },
  { id: 3, name: "jvitimdelas", email: "joaovitim64@gmail.com", role: "Cliente", credits: 0, docs: 0, avatar: "JV" },
  { id: 4, name: "Marcos leal", email: "fazfumaca@gmai.com", role: "Cliente", credits: 0, docs: 0, avatar: "ML" },
  { id: 5, name: "Fabiola Guimarães", email: "biolapyethropablo15@gmail.com", role: "Cliente", credits: 0, docs: 0, avatar: "FG" },
  { id: 6, name: "HL777 FORNECEDOR", email: "campsdouglas@gmail.com", role: "Cliente", credits: 0, docs: 0, avatar: "HL" },
  { id: 7, name: "Marco", email: "opaluis@gmail.com", role: "Cliente", credits: 0, docs: 0, avatar: "MA" },
  { id: 8, name: "João", email: "joaobrgmr123@gmail.com", role: "Cliente", credits: 0, docs: 0, avatar: "JO" },
  { id: 9, name: "Lorenzo", email: "777lglg77@gmail.com", role: "Cliente", credits: 0, docs: 0, avatar: "LO" },
  { id: 10, name: "Victor Gabriel Salachenski Milton", email: "victorgsmilton@gmail.com", role: "Cliente", credits: 1, docs: 0, avatar: "VG" },
  { id: 11, name: "Rafael cabral nascimento", email: "dmenor.nascimentoo@gmail.com", role: "Cliente", credits: 0, docs: 0, avatar: "RC" },
  { id: 12, name: "Gustavo junio da silva duarte", email: "usuario22danorte@gmail.com", role: "Cliente", credits: 0, docs: 0, avatar: "GJ" },
  { id: 13, name: "José Filipe da Silva", email: "filipedasilvajose@gmail.com", role: "Cliente", credits: 0, docs: 0, avatar: "JF" },
  { id: 14, name: "Abdias alves da silva", email: "fabricadeartefatoscouros@gmail.com", role: "Cliente", credits: 0, docs: 0, avatar: "AA" },
  { id: 15, name: "Theo", email: "theo@gmail.com", role: "Cliente", credits: 0, docs: 0, avatar: "TH" },
  { id: 16, name: "Igor Rangel de Oliveira", email: "rangeligor41@gmail.com", role: "Cliente", credits: 0, docs: 0, avatar: "IR" },
];

const roles = ["Cliente", "Revendedor", "Sub Gerente", "Gerente", "Admin"];

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(mockUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "remove">("add");
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [creditAmount, setCreditAmount] = useState(1);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = (userId: number, newRole: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    toast({ title: "Cargo atualizado", description: `Cargo alterado para ${newRole}` });
  };

  const openCreditDialog = (user: MockUser, mode: "add" | "remove") => {
    setSelectedUser(user);
    setDialogMode(mode);
    setCreditAmount(1);
    setDialogOpen(true);
  };

  const handleCreditAction = () => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? {
              ...u,
              credits:
                dialogMode === "add"
                  ? u.credits + creditAmount
                  : Math.max(0, u.credits - creditAmount),
            }
          : u
      )
    );
    toast({
      title: dialogMode === "add" ? "Créditos adicionados" : "Créditos removidos",
      description: `${creditAmount} CR ${dialogMode === "add" ? "adicionados a" : "removidos de"} ${selectedUser.name}`,
    });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Gerenciar Usuários</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {users.length} usuários cadastrados
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">{users.length}</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou e-mail..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Nome
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  E-mail
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Cargo
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Créditos
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Docs
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  {/* Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {user.avatar}
                      </div>
                      <span className="font-medium text-foreground truncate max-w-[200px]">
                        {user.name}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-4">
                    <span className="text-muted-foreground text-xs">{user.email}</span>
                  </td>

                  {/* Role Dropdown */}
                  <td className="py-3.5 px-4">
                    <Select
                      value={user.role}
                      onValueChange={(val) => handleRoleChange(user.id, val)}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs bg-secondary/50 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((r) => (
                          <SelectItem key={r} value={r} className="text-xs">
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>

                  {/* Credits */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`font-bold ${
                        user.credits > 0 ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {user.credits}
                    </span>
                    <span className="text-muted-foreground text-xs ml-1">CR</span>
                  </td>

                  {/* Docs */}
                  <td className="py-3.5 px-4 text-center text-muted-foreground">
                    {user.docs}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-success hover:text-success hover:bg-success/10"
                        onClick={() => openCreditDialog(user, "add")}
                        title="Adicionar créditos"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => openCreditDialog(user, "remove")}
                        title="Remover créditos"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setUsers((prev) => prev.filter((u) => u.id !== user.id));
                          toast({ title: "Usuário banido", variant: "destructive" });
                        }}
                        title="Banir usuário"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {dialogMode === "add" ? "Adicionar Créditos" : "Remover Créditos"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm font-medium text-foreground">{selectedUser?.name}</p>
              <p className="text-xs text-muted-foreground">{selectedUser?.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Saldo atual: <span className="font-bold text-foreground">{selectedUser?.credits} CR</span>
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Quantidade</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCreditAmount(Math.max(1, creditAmount - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  min={1}
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center font-bold"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCreditAmount(creditAmount + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button
              className={`w-full font-semibold ${
                dialogMode === "add"
                  ? "bg-success text-success-foreground hover:bg-success/90"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }`}
              onClick={handleCreditAction}
            >
              {dialogMode === "add" ? "Confirmar Adição" : "Confirmar Remoção"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;

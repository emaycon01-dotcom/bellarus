import { useState } from "react";
import { Search, Shield, Ban, Crown, Star, UserCheck, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface MockUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  credits: number;
  totalDeposits: number;
  docsCreated: number;
  status: string;
}

const mockUsers: MockUser[] = [
  { id: 1, name: "João Silva", email: "joao@email.com", phone: "(11) 99999-0001", role: "Usuário", credits: 5, totalDeposits: 100, docsCreated: 3, status: "Ativo" },
  { id: 2, name: "Maria Santos", email: "maria@email.com", phone: "(11) 99999-0002", role: "Revendedor", credits: 12, totalDeposits: 350, docsCreated: 15, status: "Ativo" },
  { id: 3, name: "Carlos Souza", email: "carlos@email.com", phone: "(11) 99999-0003", role: "Sub Gerente", credits: 8, totalDeposits: 600, docsCreated: 30, status: "Ativo" },
];

const roleIcon: Record<string, typeof Shield> = {
  "Usuário": UserCheck,
  "Revendedor": Star,
  "Sub Gerente": Shield,
  "Gerente": Crown,
};

const AdminUsers = () => {
  const [search, setSearch] = useState("");

  const filtered = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Gerenciar Usuários</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle de fichas, cargos e bloqueios</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou e-mail..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {["Usuário", "Cargo", "Créditos", "Depósitos", "Docs", "Status", "Ações"].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => {
              const Icon = roleIcon[user.role] || UserCheck;
              return (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.phone}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Icon className="w-3.5 h-3.5 text-accent" />
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-foreground">{user.credits}</td>
                  <td className="py-3 px-4 text-foreground">R$ {user.totalDeposits}</td>
                  <td className="py-3 px-4 text-foreground">{user.docsCreated}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      user.status === "Ativo" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-xs">
                          <Star className="w-3.5 h-3.5 mr-2" /> Promover a Revendedor
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs">
                          <Shield className="w-3.5 h-3.5 mr-2" /> Promover a Sub Gerente
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs">
                          <Crown className="w-3.5 h-3.5 mr-2" /> Promover a Gerente
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-xs">
                          <UserCheck className="w-3.5 h-3.5 mr-2" /> Rebaixar a Usuário
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-xs text-destructive">
                          <Ban className="w-3.5 h-3.5 mr-2" /> Banir Usuário
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;

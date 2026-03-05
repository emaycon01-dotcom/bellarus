import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  Plus,
  Minus,
  Search,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const tabs = [
  "Comissões",
  "Saldos",
  "Usuários",
  "Depósitos",
  "Recargas",
  "Revendedores",
  "Indicações",
  "Logs",
  "Vendas",
];

const stats = [
  { label: "Minha Comissão (50%)", value: "R$ 0,00", icon: TrendingUp, color: "text-success" },
  { label: "Total Depósitos", value: "R$ 0,00", icon: DollarSign, color: "text-foreground" },
  { label: "Todos Usuários", value: "0", icon: Users, color: "text-foreground" },
  { label: "Meu Saldo", value: "0 CR", icon: Wallet, color: "text-foreground" },
];

type Transaction = {
  date: string;
  user: string;
  value: string;
  indicator: string;
  commission: string;
  myPart: string;
  ownerPart: string;
  type: string;
};

const mockTransactions: Transaction[] = [
  { date: "05/03/2026 23:59", user: "Pedro", value: "R$ 20.00", indicator: "—", commission: "—", myPart: "R$ 10.00", ownerPart: "R$ 10.00", type: "Direto 50/50" },
  { date: "05/03/2026 21:52", user: "Marcelo", value: "R$ 20.00", indicator: "—", commission: "—", myPart: "R$ 10.00", ownerPart: "R$ 10.00", type: "Direto 50/50" },
  { date: "05/03/2026 20:22", user: "Richard Bryan", value: "R$ 20.00", indicator: "—", commission: "—", myPart: "R$ 10.00", ownerPart: "R$ 10.00", type: "Direto 50/50" },
  { date: "05/03/2026 20:10", user: "Vitor Francesco", value: "R$ 50.00", indicator: "—", commission: "—", myPart: "R$ 25.00", ownerPart: "R$ 25.00", type: "Direto 50/50" },
  { date: "05/03/2026 19:36", user: "Bruno Alves", value: "R$ 50.00", indicator: "—", commission: "—", myPart: "R$ 25.00", ownerPart: "R$ 25.00", type: "Direto 50/50" },
];

const AdminFinance = () => {
  const [activeTab, setActiveTab] = useState("Comissões");
  const [searchQuery, setSearchQuery] = useState("");
  const [creditUser, setCreditUser] = useState("");
  const [creditAmount, setCreditAmount] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "remove">("add");

  const openCreditDialog = (mode: "add" | "remove") => {
    setDialogMode(mode);
    setCreditUser("");
    setCreditAmount(1);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle financeiro completo do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => openCreditDialog("add")}
            className="bg-success text-success-foreground hover:bg-success/90 gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Créditos
          </Button>
          <Button
            onClick={() => openCreditDialog("remove")}
            variant="destructive"
            className="gap-2"
          >
            <Minus className="w-4 h-4" />
            Remover Créditos
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl navy-gradient flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="glass-card overflow-hidden">
        <div className="flex overflow-x-auto border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-base font-display font-semibold text-foreground">
              Extrato de {activeTab}
            </h2>
          </div>

          {activeTab === "Comissões" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-wider">Data</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Depositante</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Valor</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Indicador</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Comissão Ind.</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Minha Parte</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Parte Dono</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTransactions
                  .filter((t) =>
                    t.user.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((t, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground text-xs">{t.date}</TableCell>
                      <TableCell className="font-medium">{t.user}</TableCell>
                      <TableCell>{t.value}</TableCell>
                      <TableCell className="text-muted-foreground">{t.indicator}</TableCell>
                      <TableCell className="text-destructive">{t.commission}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-success/20 text-success text-xs font-bold">
                          {t.myPart}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{t.ownerPart}</span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded border border-border text-xs text-muted-foreground">
                          {t.type}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                {mockTransactions.filter((t) =>
                  t.user.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      Nenhum registro encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {activeTab !== "Comissões" && (
            <div className="py-16 text-center">
              <DollarSign className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhum registro de {activeTab.toLowerCase()} encontrado
              </p>
            </div>
          )}
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nome do usuário</label>
              <Input
                placeholder="Digite o nome do usuário"
                value={creditUser}
                onChange={(e) => setCreditUser(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Quantidade de créditos</label>
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
                  max={999}
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
              onClick={() => setDialogOpen(false)}
            >
              {dialogMode === "add" ? "Confirmar Adição" : "Confirmar Remoção"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFinance;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Smartphone, Sparkles, Eye, Download, Shuffle, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

const generateDigits = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");
const OPERADORAS = ["Claro", "Vivo", "TIM", "Oi"];

const EsimForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "preview">("form");

  const [operadora, setOperadora] = useState("");
  const [numero, setNumero] = useState("");
  const [iccid, setIccid] = useState("");
  const [imei, setImei] = useState("");
  const [plano, setPlano] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [cpf, setCpf] = useState("");

  const formatCPF = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  const fillTest = () => {
    setOperadora("Claro"); setNumero("(11) 99876-5432"); setIccid(generateDigits(20));
    setImei(generateDigits(15)); setPlano("Controle 15GB"); setNomeCliente("AMANDA COSTA RIBEIRO");
    setCpf("345.678.901-23");
    toast.success("Campos preenchidos com dados de teste!");
  };
  const clearAll = () => {
    setOperadora(""); setNumero(""); setIccid(""); setImei(""); setPlano(""); setNomeCliente(""); setCpf("");
    toast.success("Campos limpos!");
  };
  const handlePreview = () => {
    if (!nomeCliente || !operadora || !numero) { toast.error("Preencha os campos obrigatórios."); return; }
    setStep("preview");
  };

  const handleConcluir = () => { toast.success("E-SIM gerado com sucesso!"); };

  if (step === "preview") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto pb-12">
        <Button variant="outline" onClick={() => setStep("form")} className="gap-2"><ArrowLeft className="w-4 h-4" />Voltar</Button>
        <div className="glass-card p-8 space-y-6">
          <h2 className="text-xl font-display font-bold text-primary text-center">Prévia — E-SIM Chip Virtual</h2>
          <div className="border border-border rounded-xl p-6 space-y-3 bg-card/50">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground text-xs">Cliente</span><p className="font-semibold text-foreground">{nomeCliente}</p></div>
              <div><span className="text-muted-foreground text-xs">CPF</span><p className="font-semibold text-foreground">{cpf}</p></div>
              <div><span className="text-muted-foreground text-xs">Operadora</span><p className="font-semibold text-foreground">{operadora}</p></div>
              <div><span className="text-muted-foreground text-xs">Número</span><p className="font-semibold text-foreground">{numero}</p></div>
              <div><span className="text-muted-foreground text-xs">ICCID</span><p className="font-semibold text-foreground font-mono text-xs">{iccid}</p></div>
              <div><span className="text-muted-foreground text-xs">IMEI</span><p className="font-semibold text-foreground font-mono text-xs">{imei}</p></div>
              <div><span className="text-muted-foreground text-xs">Plano</span><p className="font-semibold text-foreground">{plano}</p></div>
            </div>
          </div>
          <Button onClick={handleConcluir} className="w-full navy-gradient text-primary-foreground font-semibold py-5 text-base"><Download className="w-5 h-5 mr-2" />Concluir e Gerar PDF — 1 Crédito</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/dashboard/documents")} className="gap-2"><ArrowLeft className="w-4 h-4" />Voltar</Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 border-accent/50 text-accent text-xs h-8 px-3" onClick={fillTest}><Zap className="w-3.5 h-3.5" /> Teste</Button>
          <Button variant="outline" size="sm" className="gap-1.5 border-destructive/50 text-destructive text-xs h-8 px-3" onClick={clearAll}><Trash2 className="w-3.5 h-3.5" /> Excluir</Button>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary/20 text-primary"><Sparkles className="w-3 h-3" />1 crédito</span>
        </div>
      </div>
      <div className="glass-card p-8 text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl navy-gradient flex items-center justify-center mx-auto"><Smartphone className="w-8 h-8 text-primary-foreground" /></div>
        <h2 className="text-xl font-display font-bold text-primary">E-SIM Chip Virtual</h2>
      </div>
      <div className="glass-card p-6 space-y-4">
        <div><Label className="text-sm font-semibold text-primary">Nome do Cliente *</Label><Input value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
        <div><Label className="text-sm font-semibold text-primary">CPF</Label><Input value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} placeholder="000.000.000-00" className="mt-1.5 bg-secondary/50" maxLength={14} /></div>
        <div><Label className="text-sm font-semibold text-primary">Operadora *</Label>
          <Select value={operadora} onValueChange={setOperadora}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{OPERADORAS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>
        </div>
        <div><Label className="text-sm font-semibold text-primary">Número do Telefone *</Label><Input value={numero} onChange={(e) => setNumero(formatPhone(e.target.value))} placeholder="(00) 00000-0000" className="mt-1.5 bg-secondary/50" /></div>
        <div className="flex gap-2">
          <div className="flex-1"><Label className="text-sm font-semibold text-primary">ICCID</Label><Input value={iccid} onChange={(e) => setIccid(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
          <Button variant="outline" className="mt-7 shrink-0 gap-1 border-primary/50 text-primary" onClick={() => setIccid(`8955${generateDigits(16)}`)}><Shuffle className="w-4 h-4" />Gerar</Button>
        </div>
        <div className="flex gap-2">
          <div className="flex-1"><Label className="text-sm font-semibold text-primary">IMEI</Label><Input value={imei} onChange={(e) => setImei(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
          <Button variant="outline" className="mt-7 shrink-0 gap-1 border-primary/50 text-primary" onClick={() => setImei(generateDigits(15))}><Shuffle className="w-4 h-4" />Gerar</Button>
        </div>
        <div><Label className="text-sm font-semibold text-primary">Plano</Label><Input value={plano} onChange={(e) => setPlano(e.target.value)} placeholder="Ex: Controle 15GB" className="mt-1.5 bg-secondary/50" /></div>
      </div>
      <Button onClick={handlePreview} className="w-full navy-gradient text-primary-foreground font-semibold py-5 text-base"><Eye className="w-5 h-5 mr-2" />Visualizar Prévia</Button>
    </div>
  );
};

export default EsimForm;

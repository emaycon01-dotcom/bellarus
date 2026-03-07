import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CreditCard, Sparkles, ImagePlus, CheckCircle2, Shuffle, Eye, Download, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

const UF_OPTIONS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const generateDigits = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");

const formatCPF = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

const CinForm = () => {
  const navigate = useNavigate();
  const fotoRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"form" | "preview">("form");

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [naturalidade, setNaturalidade] = useState("");
  const [uf, setUf] = useState("");
  const [nomePai, setNomePai] = useState("");
  const [nomeMae, setNomeMae] = useState("");
  const [registro, setRegistro] = useState("");
  const [dataExpedicao, setDataExpedicao] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDataExpedicaoChange = (val: string) => {
    setDataExpedicao(val);
    if (val.length === 10) {
      const parts = val.split("/");
      if (parts.length === 3) {
        const year = parseInt(parts[2]);
        if (!isNaN(year)) setDataValidade(`${parts[0]}/${parts[1]}/${year + 10}`);
      }
    }
  };

  const fillTest = () => {
    setNome("JULIANA FERREIRA MARTINS"); setCpf("012.345.678-90"); setDataNascimento("05/12/1993");
    setNaturalidade("CAMPINAS"); setUf("SP"); setNomePai("CARLOS FERREIRA MARTINS");
    setNomeMae("PATRICIA LIMA MARTINS"); setRegistro(generateDigits(10));
    setDataExpedicao("20/06/2023"); setDataValidade("20/06/2033");
    toast.success("Campos preenchidos com dados de teste!");
  };
  const clearAll = () => {
    setNome(""); setCpf(""); setDataNascimento(""); setNaturalidade(""); setUf("");
    setNomePai(""); setNomeMae(""); setRegistro(""); setDataExpedicao(""); setDataValidade("");
    setFotoPreview(null);
    toast.success("Campos limpos!");
  };
  const handlePreview = () => {
    if (!nome || !cpf) { toast.error("Preencha nome e CPF."); return; }
    setStep("preview");
  };

  const handleConcluir = () => {
    toast.success("CIN (RG Digital) gerado com sucesso!");
  };

  if (step === "preview") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto pb-12">
        <Button variant="outline" onClick={() => setStep("form")} className="gap-2"><ArrowLeft className="w-4 h-4" />Voltar ao Formulário</Button>
        <div className="glass-card p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-display font-bold text-primary">Prévia — CIN (RG Digital)</h2>
            <p className="text-xs text-muted-foreground">Confira os dados antes de concluir</p>
          </div>
          <div className="border border-border rounded-xl p-6 space-y-4 bg-card/50">
            {fotoPreview && <img src={fotoPreview} alt="Foto" className="w-24 h-30 object-cover rounded-lg mx-auto" />}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground text-xs">Nome</span><p className="font-semibold text-foreground">{nome}</p></div>
              <div><span className="text-muted-foreground text-xs">CPF</span><p className="font-semibold text-foreground">{cpf}</p></div>
              <div><span className="text-muted-foreground text-xs">Data Nascimento</span><p className="font-semibold text-foreground">{dataNascimento}</p></div>
              <div><span className="text-muted-foreground text-xs">Naturalidade</span><p className="font-semibold text-foreground">{naturalidade} - {uf}</p></div>
              <div><span className="text-muted-foreground text-xs">Filiação (Pai)</span><p className="font-semibold text-foreground">{nomePai}</p></div>
              <div><span className="text-muted-foreground text-xs">Filiação (Mãe)</span><p className="font-semibold text-foreground">{nomeMae}</p></div>
              <div><span className="text-muted-foreground text-xs">Registro</span><p className="font-semibold text-foreground">{registro}</p></div>
              <div><span className="text-muted-foreground text-xs">Expedição</span><p className="font-semibold text-foreground">{dataExpedicao}</p></div>
              <div><span className="text-muted-foreground text-xs">Validade</span><p className="font-semibold text-foreground">{dataValidade}</p></div>
            </div>
          </div>
          <Button onClick={handleConcluir} className="w-full navy-gradient text-primary-foreground font-semibold py-5 text-base">
            <Download className="w-5 h-5 mr-2" />
            Concluir e Gerar PDF — 1 Crédito
          </Button>
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
        <div className="w-16 h-16 rounded-2xl navy-gradient flex items-center justify-center mx-auto"><CreditCard className="w-8 h-8 text-primary-foreground" /></div>
        <h2 className="text-xl font-display font-bold text-primary">CIN — RG Digital</h2>
        <p className="text-sm text-muted-foreground">Carteira de Identidade Nacional Digital</p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div><Label className="text-sm font-semibold text-primary">Nome Completo *</Label><Input value={nome} onChange={(e) => setNome(e.target.value.toUpperCase())} placeholder="NOME COMPLETO" className="mt-1.5 bg-secondary/50" /></div>
        <div><Label className="text-sm font-semibold text-primary">CPF *</Label><Input value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} placeholder="000.000.000-00" className="mt-1.5 bg-secondary/50" maxLength={14} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Data Nascimento *</Label><Input value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} placeholder="DD/MM/AAAA" className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">Naturalidade *</Label><Input value={naturalidade} onChange={(e) => setNaturalidade(e.target.value.toUpperCase())} placeholder="CIDADE" className="mt-1.5 bg-secondary/50" /></div>
        </div>
        <div><Label className="text-sm font-semibold text-primary">UF *</Label>
          <Select value={uf} onValueChange={setUf}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{UF_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select>
        </div>
        <div><Label className="text-sm font-semibold text-primary">Nome do Pai</Label><Input value={nomePai} onChange={(e) => setNomePai(e.target.value.toUpperCase())} placeholder="NOME DO PAI" className="mt-1.5 bg-secondary/50" /></div>
        <div><Label className="text-sm font-semibold text-primary">Nome da Mãe *</Label><Input value={nomeMae} onChange={(e) => setNomeMae(e.target.value.toUpperCase())} placeholder="NOME DA MÃE" className="mt-1.5 bg-secondary/50" /></div>
        <div className="flex gap-2">
          <div className="flex-1"><Label className="text-sm font-semibold text-primary">Nº Registro *</Label><Input value={registro} onChange={(e) => setRegistro(e.target.value)} placeholder="0000000000" className="mt-1.5 bg-secondary/50" /></div>
          <Button variant="outline" className="mt-7 shrink-0 gap-1 border-primary/50 text-primary" onClick={() => setRegistro(generateDigits(10))}><Shuffle className="w-4 h-4" />Gerar</Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Data Expedição</Label><Input value={dataExpedicao} onChange={(e) => handleDataExpedicaoChange(e.target.value)} placeholder="DD/MM/AAAA" className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">Data Validade</Label><Input value={dataValidade} onChange={(e) => setDataValidade(e.target.value)} placeholder="DD/MM/AAAA" className="mt-1.5 bg-secondary/50" /></div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-foreground">Foto</Label>
          <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          <div onClick={() => fotoRef.current?.click()} className="mt-1.5 border-2 border-dashed border-border rounded-xl bg-card/50 p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
            {fotoPreview ? <img src={fotoPreview} alt="Foto" className="w-28 h-36 object-cover rounded-lg mx-auto" /> : <><ImagePlus className="w-8 h-8 mx-auto text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">Upload da foto</p></>}
          </div>
        </div>
      </div>

      <Button onClick={handlePreview} className="w-full navy-gradient text-primary-foreground font-semibold py-5 text-base"><Eye className="w-5 h-5 mr-2" />Visualizar Prévia</Button>
    </div>
  );
};

export default CinForm;

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Shield, Users, Clock, CreditCard, Shuffle, ImagePlus, CheckCircle2, Sparkles, Eye, UserCircle, FileCheck, Contact, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { saveDocumentHistory } from "@/lib/saveDocumentHistory";

const UF_OPTIONS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const GENERO_OPTIONS = ["Masculino", "Feminino"];
const NACIONALIDADE_OPTIONS = ["BRASILEIRA", "ESTRANGEIRA"];

const generateDigits = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");
const formatCPF = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

const RgPdfForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fotoRef = useRef<HTMLInputElement>(null);
  const assinaturaRef = useRef<HTMLInputElement>(null);

  const [cpf, setCpf] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [rg, setRg] = useState("");
  const [uf, setUf] = useState("");
  const [genero, setGenero] = useState("");
  const [nacionalidade, setNacionalidade] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [naturalidade, setNaturalidade] = useState("");
  const [dataEmissao, setDataEmissao] = useState("");
  const [orgaoEmissor, setOrgaoEmissor] = useState("");
  const [nomePai, setNomePai] = useState("");
  const [nomeMae, setNomeMae] = useState("");
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [assinaturaPreview, setAssinaturaPreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "foto" | "assinatura") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Arquivo muito grande. Máximo 10MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (type === "foto") setFotoPreview(result); else setAssinaturaPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const fillTest = () => {
    setCpf("456.789.012-34"); setNomeCompleto("ANA BEATRIZ FERREIRA LIMA"); setRg(generateDigits(9));
    setUf("SP"); setGenero("Feminino"); setNacionalidade("BRASILEIRA"); setDataNascimento("22/08/1995");
    setNaturalidade("SÃO PAULO"); setDataEmissao("15/03/2023"); setOrgaoEmissor("SSP/SP");
    setNomePai("JOSÉ FERREIRA LIMA"); setNomeMae("MARIA APARECIDA FERREIRA");
    toast.success("Campos preenchidos com dados de teste!");
  };
  const clearAll = () => {
    setCpf(""); setNomeCompleto(""); setRg(""); setUf(""); setGenero(""); setNacionalidade("");
    setDataNascimento(""); setNaturalidade(""); setDataEmissao(""); setOrgaoEmissor("");
    setNomePai(""); setNomeMae(""); setFotoPreview(null); setAssinaturaPreview(null);
    toast.success("Campos limpos!");
  };
  const handlePreview = () => { setShowPreview(true); toast.success("Preview gerado com sucesso!"); };
  const handleConfirm = () => { if (user) saveDocumentHistory(user.id, "RG PDF", nomeCompleto || "Sem nome"); toast.success("Documento confirmado! 1 crédito será debitado."); };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/dashboard/documents")} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 border-accent/50 text-accent text-xs h-8 px-3" onClick={fillTest}><Zap className="w-3.5 h-3.5" /> Teste</Button>
          <Button variant="outline" size="sm" className="gap-1.5 border-destructive/50 text-destructive text-xs h-8 px-3" onClick={clearAll}><Trash2 className="w-3.5 h-3.5" /> Excluir</Button>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary/20 text-primary"><Sparkles className="w-3 h-3" /> 1 Crédito</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[{ icon: Shield, label: "Documento Seguro", desc: "Validação oficial" },
          { icon: Users, label: "Processo Rápido", desc: "Conclua em minutos" },
          { icon: Clock, label: "Validade 45 Dias", desc: "Tempo garantido" }].map((f) => (
          <div key={f.label} className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl navy-gradient flex items-center justify-center shrink-0">
              <f.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{f.label}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 py-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${!showPreview ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>1</div>
          <span className={`text-sm font-medium ${!showPreview ? "text-primary" : "text-muted-foreground"}`}>Preencher</span>
        </div>
        <div className="w-16 h-px bg-border" />
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${showPreview ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</div>
          <span className={`text-sm font-medium ${showPreview ? "text-primary" : "text-muted-foreground"}`}>Preview</span>
        </div>
      </div>

      <div className="glass-card p-8 text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success to-primary flex items-center justify-center mx-auto">
          <FileCheck className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-display font-bold text-primary">Criar RG PDF</h2>
        <p className="text-sm text-muted-foreground">Preencha os dados para gerar o RG em formato PDF</p>
      </div>

      {!showPreview ? (
        <>
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <UserCircle className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-display font-bold text-foreground">Dados Pessoais</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-primary">CPF <span className="text-destructive">*</span></Label>
                <Input placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} className="mt-1.5 bg-secondary/50" maxLength={14} />
              </div>
              <div>
                <Label className="text-sm font-semibold text-primary">Nome Completo <span className="text-destructive">*</span></Label>
                <Input placeholder="Ex: PEDRO DA SILVA GOMES" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-sm font-semibold text-primary">RG <span className="text-destructive">*</span></Label>
                  <Input placeholder="00.000.000-0" value={rg} onChange={(e) => setRg(e.target.value)} className="mt-1.5 bg-secondary/50" />
                </div>
                <Button variant="outline" size="sm" className="mt-7 shrink-0 gap-1.5 border-primary/50 text-primary" onClick={() => setRg(`${generateDigits(2)}.${generateDigits(3)}.${generateDigits(3)}-${generateDigits(1)}`)}>
                  <Shuffle className="w-4 h-4" /> Gerar
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-primary">UF <span className="text-destructive">*</span></Label>
                  <Select value={uf} onValueChange={setUf}>
                    <SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{UF_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-primary">Gênero <span className="text-destructive">*</span></Label>
                  <Select value={genero} onValueChange={setGenero}>
                    <SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{GENERO_OPTIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-primary">Nacionalidade <span className="text-destructive">*</span></Label>
                <Select value={nacionalidade} onValueChange={setNacionalidade}>
                  <SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{NACIONALIDADE_OPTIONS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-primary">Data de Nascimento <span className="text-destructive">*</span></Label>
                  <Input placeholder="DD/MM/AAAA" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className="mt-1.5 bg-secondary/50" />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-primary">Naturalidade <span className="text-destructive">*</span></Label>
                  <Input placeholder="Ex: SÃO PAULO, SP" value={naturalidade} onChange={(e) => setNaturalidade(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-primary">Data de Emissão <span className="text-destructive">*</span></Label>
                  <Input placeholder="DD/MM/AAAA" value={dataEmissao} onChange={(e) => setDataEmissao(e.target.value)} className="mt-1.5 bg-secondary/50" />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-primary">Órgão Emissor <span className="text-destructive">*</span></Label>
                  <Input placeholder="Ex: SSP/SP" value={orgaoEmissor} onChange={(e) => setOrgaoEmissor(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" />
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-foreground">Nome do Pai</Label>
                <Input placeholder="Ex: PEDRO DA SILVA" value={nomePai} onChange={(e) => setNomePai(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" />
              </div>
              <div>
                <Label className="text-sm font-semibold text-foreground">Nome da Mãe</Label>
                <Input placeholder="Ex: MARIA DA SILVA" value={nomeMae} onChange={(e) => setNomeMae(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" />
              </div>
              <div>
                <Label className="text-sm font-semibold text-foreground">Foto 3x4</Label>
                <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "foto")} />
                <div onClick={() => fotoRef.current?.click()} className="mt-1.5 border-2 border-dashed border-border rounded-xl bg-card/50 p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  {fotoPreview ? <img src={fotoPreview} alt="Foto" className="w-32 h-40 object-cover rounded-lg mx-auto" /> : <><ImagePlus className="w-10 h-10 mx-auto text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">Clique para upload</p></>}
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-foreground">Assinatura Digital</Label>
                <input ref={assinaturaRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "assinatura")} />
                <div onClick={() => assinaturaRef.current?.click()} className="mt-1.5 border-2 border-dashed border-border rounded-xl bg-card/50 p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  {assinaturaPreview ? <img src={assinaturaPreview} alt="Assinatura" className="h-20 object-contain mx-auto" /> : <><CheckCircle2 className="w-10 h-10 mx-auto text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">Clique para upload</p></>}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-accent text-white" onClick={handlePreview}><Eye className="w-5 h-5" /> Gerar Preview</Button>
          </div>
        </>
      ) : (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-primary flex items-center justify-center"><Eye className="w-5 h-5 text-white" /></div>
              <h3 className="text-lg font-display font-bold text-foreground">Preview do RG PDF</h3>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowPreview(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Editar</Button>
          </div>
          <div className="rounded-2xl border-2 border-success/30 bg-gradient-to-br from-card via-card to-success/5 p-6 space-y-6 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none"><FileCheck className="w-64 h-64" /></div>
            <div className="text-center space-y-1 border-b border-border pb-4 relative">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-success">REPÚBLICA FEDERATIVA DO BRASIL</p>
              <h3 className="text-lg font-display font-bold text-foreground">REGISTRO GERAL</h3>
            </div>
            <div className="flex gap-6 relative">
              <div className="shrink-0">
                {fotoPreview ? <img src={fotoPreview} alt="Foto" className="w-28 h-36 object-cover rounded-xl border-2 border-success/30" /> :
                <div className="w-28 h-36 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30"><UserCircle className="w-12 h-12 text-muted-foreground" /></div>}
              </div>
              <div className="flex-1 space-y-3">
                <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Nome</p><p className="text-sm font-bold text-foreground">{nomeCompleto || "---"}</p></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">RG</p><p className="text-sm font-mono font-bold text-success">{rg || "---"}</p></div>
                  <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">CPF</p><p className="text-sm font-mono font-bold text-foreground">{cpf || "---"}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Nascimento</p><p className="text-sm text-foreground">{dataNascimento || "---"}</p></div>
                  <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Naturalidade</p><p className="text-sm text-foreground">{naturalidade || "---"}</p></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 border-t border-border pt-4 relative">
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Emissão</p><p className="text-sm text-foreground">{dataEmissao || "---"}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Órgão</p><p className="text-sm text-foreground">{orgaoEmissor || "---"}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">UF</p><p className="text-sm text-foreground">{uf || "---"}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 relative">
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pai</p><p className="text-sm text-foreground">{nomePai || "---"}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Mãe</p><p className="text-sm text-foreground">{nomeMae || "---"}</p></div>
            </div>
            <div className="border-t border-border pt-4 relative">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Assinatura</p>
              {assinaturaPreview ? <img src={assinaturaPreview} alt="Assinatura" className="h-12 mt-1 object-contain" /> : <div className="w-40 h-12 mt-1 border-b-2 border-dashed border-muted-foreground/30" />}
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="lg" onClick={() => setShowPreview(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Editar</Button>
            <Button size="lg" className="gap-2 bg-gradient-to-r from-success to-primary text-white" onClick={handleConfirm}>
              <CheckCircle2 className="w-5 h-5" /> Confirmar (1 Crédito)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RgPdfForm;

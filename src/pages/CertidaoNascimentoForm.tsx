import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Heart, Sparkles, Eye, Download, Wand2, Shuffle, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { saveDocumentHistory } from "@/lib/saveDocumentHistory";

const UF_OPTIONS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const generateDigits = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");

const CertidaoNascimentoForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<"form" | "preview">("form");
  const [loading, setLoading] = useState(false);

  const [nomeCompleto, setNomeCompleto] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [horaNascimento, setHoraNascimento] = useState("");
  const [sexo, setSexo] = useState("");
  const [localNascimento, setLocalNascimento] = useState("");
  const [uf, setUf] = useState("");
  const [nomePai, setNomePai] = useState("");
  const [nomeMae, setNomeMae] = useState("");
  const [avoPaterno, setAvoPaterno] = useState("");
  const [avoPaterna, setAvoPaterna] = useState("");
  const [avoMaterno, setAvoMaterno] = useState("");
  const [avoMaterna, setAvoMaterna] = useState("");
  const [matricula, setMatricula] = useState("");
  const [cartorio, setCartorio] = useState("");
  const [livro, setLivro] = useState("");
  const [folha, setFolha] = useState("");
  const [termo, setTermo] = useState("");
  const [dataRegistro, setDataRegistro] = useState("");

  const handleAIFill = async () => {
    if (!localNascimento || !uf) { toast.error("Preencha cidade e UF."); return; }
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke("medical-ai", {
        body: { type: "custom", prompt: `Gere dados fictícios realistas para uma certidão de nascimento em ${localNascimento}-${uf}. Retorne APENAS JSON: {"cartorio":"nome do cartório","matricula":"32 dígitos numéricos","livro":"A-XXX","folha":"XXX","termo":"XXXXX","dataRegistro":"DD/MM/AAAA"}` },
      });
      if (data?.result) {
        try {
          const json = JSON.parse(data.result.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
          if (json.cartorio) setCartorio(json.cartorio);
          if (json.matricula) setMatricula(json.matricula);
          if (json.livro) setLivro(json.livro);
          if (json.folha) setFolha(json.folha);
          if (json.termo) setTermo(json.termo);
          if (json.dataRegistro) setDataRegistro(json.dataRegistro);
          toast.success("Dados do cartório gerados com IA!");
        } catch { toast.error("Erro ao processar IA."); }
      }
    } catch { toast.error("Erro ao conectar com IA."); }
    setLoading(false);
  };

  const fillTest = () => {
    setNomeCompleto("GABRIEL HENRIQUE SILVA SANTOS"); setDataNascimento("10/03/2024"); setHoraNascimento("08:45");
    setSexo("Masculino"); setLocalNascimento("SÃO PAULO"); setUf("SP");
    setNomePai("CARLOS EDUARDO SILVA"); setNomeMae("AMANDA SANTOS SILVA");
    setAvoPaterno("JOSÉ CARLOS SILVA"); setAvoPaterna("MARIA HELENA SILVA");
    setAvoMaterno("ANTÔNIO SANTOS"); setAvoMaterna("ROSA MARIA SANTOS");
    setMatricula(generateDigits(32)); setCartorio("1º OFÍCIO DE REGISTRO CIVIL DE SÃO PAULO");
    setLivro("A-245"); setFolha("123"); setTermo("45678"); setDataRegistro("15/03/2024");
    toast.success("Campos preenchidos com dados de teste!");
  };
  const clearAll = () => {
    setNomeCompleto(""); setDataNascimento(""); setHoraNascimento(""); setSexo(""); setLocalNascimento("");
    setUf(""); setNomePai(""); setNomeMae(""); setAvoPaterno(""); setAvoPaterna(""); setAvoMaterno("");
    setAvoMaterna(""); setMatricula(""); setCartorio(""); setLivro(""); setFolha(""); setTermo(""); setDataRegistro("");
    toast.success("Campos limpos!");
  };
  const handlePreview = () => {
    if (!nomeCompleto || !dataNascimento || !nomeMae) { toast.error("Preencha os campos obrigatórios."); return; }
    setStep("preview");
  };

  const handleConcluir = () => { toast.success("Certidão de Nascimento gerada com sucesso!"); };

  if (step === "preview") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto pb-12">
        <Button variant="outline" onClick={() => setStep("form")} className="gap-2"><ArrowLeft className="w-4 h-4" />Voltar</Button>
        <div className="glass-card p-8 space-y-6">
          <h2 className="text-xl font-display font-bold text-primary text-center">Prévia — Certidão de Nascimento</h2>
          <div className="border border-border rounded-xl p-6 space-y-3 bg-card/50">
            <div className="text-center pb-3 border-b border-border"><p className="font-bold text-lg text-foreground">{cartorio || "CARTÓRIO"}</p></div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground text-xs">Nome</span><p className="font-semibold text-foreground">{nomeCompleto}</p></div>
              <div><span className="text-muted-foreground text-xs">Nascimento</span><p className="font-semibold text-foreground">{dataNascimento} {horaNascimento && `às ${horaNascimento}`}</p></div>
              <div><span className="text-muted-foreground text-xs">Sexo</span><p className="font-semibold text-foreground">{sexo}</p></div>
              <div><span className="text-muted-foreground text-xs">Local</span><p className="font-semibold text-foreground">{localNascimento}/{uf}</p></div>
              <div><span className="text-muted-foreground text-xs">Pai</span><p className="font-semibold text-foreground">{nomePai}</p></div>
              <div><span className="text-muted-foreground text-xs">Mãe</span><p className="font-semibold text-foreground">{nomeMae}</p></div>
              <div><span className="text-muted-foreground text-xs">Avós Paternos</span><p className="font-semibold text-foreground">{avoPaterno} e {avoPaterna}</p></div>
              <div><span className="text-muted-foreground text-xs">Avós Maternos</span><p className="font-semibold text-foreground">{avoMaterno} e {avoMaterna}</p></div>
              <div><span className="text-muted-foreground text-xs">Matrícula</span><p className="font-semibold text-foreground font-mono text-xs">{matricula}</p></div>
              <div><span className="text-muted-foreground text-xs">Livro/Folha/Termo</span><p className="font-semibold text-foreground">{livro} / {folha} / {termo}</p></div>
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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-destructive to-warning flex items-center justify-center mx-auto"><Heart className="w-8 h-8 text-white" /></div>
        <h2 className="text-xl font-display font-bold text-primary">Certidão de Nascimento</h2>
      </div>
      <div className="glass-card p-6 space-y-4">
        <div><Label className="text-sm font-semibold text-primary">Nome Completo *</Label><Input value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value.toUpperCase())} placeholder="NOME COMPLETO" className="mt-1.5 bg-secondary/50" /></div>
        <div className="grid grid-cols-3 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Data Nascimento *</Label><Input value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} placeholder="DD/MM/AAAA" className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">Hora</Label><Input value={horaNascimento} onChange={(e) => setHoraNascimento(e.target.value)} placeholder="HH:MM" className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">Sexo *</Label>
            <Select value={sexo} onValueChange={setSexo}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="Masculino">Masculino</SelectItem><SelectItem value="Feminino">Feminino</SelectItem></SelectContent></Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Local Nascimento *</Label><Input value={localNascimento} onChange={(e) => setLocalNascimento(e.target.value.toUpperCase())} placeholder="CIDADE" className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">UF *</Label><Select value={uf} onValueChange={setUf}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="UF" /></SelectTrigger><SelectContent>{UF_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <div className="border-t border-border pt-4"><h3 className="text-sm font-bold text-foreground mb-3">Filiação</h3></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Nome do Pai</Label><Input value={nomePai} onChange={(e) => setNomePai(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">Nome da Mãe *</Label><Input value={nomeMae} onChange={(e) => setNomeMae(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Avô Paterno</Label><Input value={avoPaterno} onChange={(e) => setAvoPaterno(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">Avó Paterna</Label><Input value={avoPaterna} onChange={(e) => setAvoPaterna(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">Avô Materno</Label><Input value={avoMaterno} onChange={(e) => setAvoMaterno(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">Avó Materna</Label><Input value={avoMaterna} onChange={(e) => setAvoMaterna(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
        </div>
        <div className="border-t border-border pt-4"><h3 className="text-sm font-bold text-foreground mb-3">Dados do Registro</h3></div>
        <div><Label className="text-sm font-semibold text-primary">Cartório</Label><Input value={cartorio} onChange={(e) => setCartorio(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
        <div className="flex gap-2">
          <div className="flex-1"><Label className="text-sm font-semibold text-primary">Matrícula</Label><Input value={matricula} onChange={(e) => setMatricula(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
          <Button variant="outline" className="mt-7 shrink-0 gap-1 border-primary/50 text-primary" onClick={() => setMatricula(generateDigits(32))}><Shuffle className="w-4 h-4" /></Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Livro</Label><Input value={livro} onChange={(e) => setLivro(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">Folha</Label><Input value={folha} onChange={(e) => setFolha(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">Termo</Label><Input value={termo} onChange={(e) => setTermo(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
        </div>
        <div><Label className="text-sm font-semibold text-primary">Data do Registro</Label><Input value={dataRegistro} onChange={(e) => setDataRegistro(e.target.value)} placeholder="DD/MM/AAAA" className="mt-1.5 bg-secondary/50" /></div>
        <Button variant="outline" onClick={handleAIFill} disabled={loading} className="w-full gap-2 border-accent/50 text-accent hover:bg-accent/10"><Wand2 className="w-4 h-4" />{loading ? "Gerando..." : "Preencher dados do cartório com IA"}</Button>
      </div>
      <Button onClick={handlePreview} className="w-full navy-gradient text-primary-foreground font-semibold py-5 text-base"><Eye className="w-5 h-5 mr-2" />Visualizar Prévia</Button>
    </div>
  );
};

export default CertidaoNascimentoForm;

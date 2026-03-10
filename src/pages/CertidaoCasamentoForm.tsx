import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ScrollText, Sparkles, Eye, Download, Wand2, Shuffle, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { saveDocumentHistory } from "@/lib/saveDocumentHistory";

const UF_OPTIONS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const generateDigits = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");

const CertidaoCasamentoForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<"form" | "preview">("form");
  const [loading, setLoading] = useState(false);

  const [nomeConjuge1, setNomeConjuge1] = useState("");
  const [nomeConjuge2, setNomeConjuge2] = useState("");
  const [dataCasamento, setDataCasamento] = useState("");
  const [regimeBens, setRegimeBens] = useState("");
  const [localCasamento, setLocalCasamento] = useState("");
  const [uf, setUf] = useState("");
  const [cartorio, setCartorio] = useState("");
  const [matricula, setMatricula] = useState("");
  const [livro, setLivro] = useState("");
  const [folha, setFolha] = useState("");
  const [termo, setTermo] = useState("");
  const [dataRegistro, setDataRegistro] = useState("");

  const handleAIFill = async () => {
    if (!localCasamento || !uf) { toast.error("Preencha cidade e UF."); return; }
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke("medical-ai", {
        body: { type: "custom", prompt: `Gere dados fictícios para certidão de casamento em ${localCasamento}-${uf}. JSON: {"cartorio":"nome","matricula":"32 dígitos","livro":"B-XXX","folha":"XXX","termo":"XXXXX","dataRegistro":"DD/MM/AAAA"}` },
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
          toast.success("Dados gerados com IA!");
        } catch { toast.error("Erro ao processar."); }
      }
    } catch { toast.error("Erro ao conectar."); }
    setLoading(false);
  };

  const fillTest = () => {
    setNomeConjuge1("MARCOS ANTÔNIO PEREIRA"); setNomeConjuge2("JULIANA SOUZA FERREIRA");
    setDataCasamento("15/06/2025"); setRegimeBens("Comunhão Parcial de Bens");
    setLocalCasamento("SÃO PAULO"); setUf("SP"); setCartorio("2º CARTÓRIO DE REGISTRO CIVIL DE SÃO PAULO");
    setMatricula(generateDigits(32)); setLivro("B-089"); setFolha("234"); setTermo("56789"); setDataRegistro("20/06/2025");
    toast.success("Campos preenchidos com dados de teste!");
  };
  const clearAll = () => {
    setNomeConjuge1(""); setNomeConjuge2(""); setDataCasamento(""); setRegimeBens("");
    setLocalCasamento(""); setUf(""); setCartorio(""); setMatricula(""); setLivro(""); setFolha(""); setTermo(""); setDataRegistro("");
    toast.success("Campos limpos!");
  };
  const handlePreview = () => {
    if (!nomeConjuge1 || !nomeConjuge2 || !dataCasamento) { toast.error("Preencha os campos obrigatórios."); return; }
    setStep("preview");
  };

  const handleConcluir = () => { toast.success("Certidão de Casamento gerada com sucesso!"); };

  if (step === "preview") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto pb-12">
        <Button variant="outline" onClick={() => setStep("form")} className="gap-2"><ArrowLeft className="w-4 h-4" />Voltar</Button>
        <div className="glass-card p-8 space-y-6">
          <h2 className="text-xl font-display font-bold text-primary text-center">Prévia — Certidão de Casamento</h2>
          <div className="border border-border rounded-xl p-6 space-y-3 bg-card/50">
            {cartorio && <div className="text-center pb-3 border-b border-border"><p className="font-bold text-lg text-foreground">{cartorio}</p></div>}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground text-xs">Cônjuge 1</span><p className="font-semibold text-foreground">{nomeConjuge1}</p></div>
              <div><span className="text-muted-foreground text-xs">Cônjuge 2</span><p className="font-semibold text-foreground">{nomeConjuge2}</p></div>
              <div><span className="text-muted-foreground text-xs">Data</span><p className="font-semibold text-foreground">{dataCasamento}</p></div>
              <div><span className="text-muted-foreground text-xs">Regime</span><p className="font-semibold text-foreground">{regimeBens}</p></div>
              <div><span className="text-muted-foreground text-xs">Local</span><p className="font-semibold text-foreground">{localCasamento}/{uf}</p></div>
              <div><span className="text-muted-foreground text-xs">Matrícula</span><p className="font-semibold text-foreground font-mono text-xs">{matricula}</p></div>
              <div><span className="text-muted-foreground text-xs">Livro/Folha/Termo</span><p className="font-semibold text-foreground">{livro}/{folha}/{termo}</p></div>
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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-warning to-amber-500 flex items-center justify-center mx-auto"><ScrollText className="w-8 h-8 text-white" /></div>
        <h2 className="text-xl font-display font-bold text-primary">Certidão de Casamento</h2>
      </div>
      <div className="glass-card p-6 space-y-4">
        <div><Label className="text-sm font-semibold text-primary">Nome Cônjuge 1 *</Label><Input value={nomeConjuge1} onChange={(e) => setNomeConjuge1(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
        <div><Label className="text-sm font-semibold text-primary">Nome Cônjuge 2 *</Label><Input value={nomeConjuge2} onChange={(e) => setNomeConjuge2(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Data do Casamento *</Label><Input value={dataCasamento} onChange={(e) => setDataCasamento(e.target.value)} placeholder="DD/MM/AAAA" className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">Regime de Bens</Label>
            <Select value={regimeBens} onValueChange={setRegimeBens}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="Comunhão Parcial">Comunhão Parcial</SelectItem><SelectItem value="Comunhão Universal">Comunhão Universal</SelectItem><SelectItem value="Separação Total">Separação Total</SelectItem><SelectItem value="Participação Final">Participação Final</SelectItem></SelectContent></Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Local *</Label><Input value={localCasamento} onChange={(e) => setLocalCasamento(e.target.value.toUpperCase())} placeholder="CIDADE" className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">UF *</Label><Select value={uf} onValueChange={setUf}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="UF" /></SelectTrigger><SelectContent>{UF_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
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

export default CertidaoCasamentoForm;

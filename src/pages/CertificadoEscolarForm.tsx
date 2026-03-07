import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BookOpen, Sparkles, Eye, Download, Wand2, Shuffle, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const UF_OPTIONS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const SERIES = ["Ensino Fundamental", "Ensino Médio - 1º Ano", "Ensino Médio - 2º Ano", "Ensino Médio - 3º Ano", "EJA - Ensino Fundamental", "EJA - Ensino Médio"];
const generateDigits = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");

const CertificadoEscolarForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "preview">("form");
  const [loading, setLoading] = useState(false);

  const [nomeCompleto, setNomeCompleto] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [serie, setSerie] = useState("");
  const [anoConclusao, setAnoConclusao] = useState("");
  const [escola, setEscola] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [diretor, setDiretor] = useState("");
  const [secretario, setSecretario] = useState("");
  const [registroINEP, setRegistroINEP] = useState("");
  const [dataEmissao, setDataEmissao] = useState("");

  const handleAIFill = async () => {
    if (!cidade || !uf) { toast.error("Preencha cidade e UF."); return; }
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke("medical-ai", {
        body: { type: "custom", prompt: `Gere dados fictícios para certificado escolar em ${cidade}-${uf}. JSON: {"escola":"nome da escola","diretor":"nome","secretario":"nome","registroINEP":"8 dígitos","dataEmissao":"DD/MM/AAAA"}` },
      });
      if (data?.result) {
        try {
          const json = JSON.parse(data.result.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
          if (json.escola) setEscola(json.escola);
          if (json.diretor) setDiretor(json.diretor);
          if (json.secretario) setSecretario(json.secretario);
          if (json.registroINEP) setRegistroINEP(json.registroINEP);
          if (json.dataEmissao) setDataEmissao(json.dataEmissao);
          toast.success("Dados da escola gerados com IA!");
        } catch { toast.error("Erro ao processar."); }
      }
    } catch { toast.error("Erro ao conectar."); }
    setLoading(false);
  };

  const fillTest = () => {
    setNomeCompleto("LARISSA CAMPOS OLIVEIRA"); setDataNascimento("12/07/2005");
    setSerie("Ensino Médio - 3º Ano"); setAnoConclusao("2023");
    setEscola("E.E. PROF. MARIA JOSÉ BARONE FERNANDES"); setCidade("SÃO PAULO"); setUf("SP");
    setDiretor("PROF. ANTÔNIO MARCOS SILVA"); setSecretario("CLÁUDIA REGINA SANTOS");
    setRegistroINEP(generateDigits(8)); setDataEmissao("15/02/2024");
    toast.success("Campos preenchidos com dados de teste!");
  };
  const clearAll = () => {
    setNomeCompleto(""); setDataNascimento(""); setSerie(""); setAnoConclusao(""); setEscola("");
    setCidade(""); setUf(""); setDiretor(""); setSecretario(""); setRegistroINEP(""); setDataEmissao("");
    toast.success("Campos limpos!");
  };
  const handlePreview = () => {
    if (!nomeCompleto || !serie) { toast.error("Preencha os campos obrigatórios."); return; }
    setStep("preview");
  };

  const handleConcluir = () => { toast.success("Certificado Escolar gerado com sucesso!"); };

  if (step === "preview") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto pb-12">
        <Button variant="outline" onClick={() => setStep("form")} className="gap-2"><ArrowLeft className="w-4 h-4" />Voltar</Button>
        <div className="glass-card p-8 space-y-6">
          <h2 className="text-xl font-display font-bold text-primary text-center">Prévia — Certificado Escolar</h2>
          <div className="border border-border rounded-xl p-6 space-y-3 bg-card/50">
            {escola && <div className="text-center pb-3 border-b border-border"><p className="font-bold text-lg text-foreground">{escola}</p></div>}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground text-xs">Aluno</span><p className="font-semibold text-foreground">{nomeCompleto}</p></div>
              <div><span className="text-muted-foreground text-xs">Nascimento</span><p className="font-semibold text-foreground">{dataNascimento}</p></div>
              <div><span className="text-muted-foreground text-xs">Série/Nível</span><p className="font-semibold text-foreground">{serie}</p></div>
              <div><span className="text-muted-foreground text-xs">Ano Conclusão</span><p className="font-semibold text-foreground">{anoConclusao}</p></div>
              <div><span className="text-muted-foreground text-xs">Diretor</span><p className="font-semibold text-foreground">{diretor}</p></div>
              <div><span className="text-muted-foreground text-xs">Secretário</span><p className="font-semibold text-foreground">{secretario}</p></div>
              <div><span className="text-muted-foreground text-xs">INEP</span><p className="font-semibold text-foreground">{registroINEP}</p></div>
              <div><span className="text-muted-foreground text-xs">Emissão</span><p className="font-semibold text-foreground">{dataEmissao}</p></div>
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
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary/20 text-primary"><Sparkles className="w-3 h-3" />1 crédito</span>
      </div>
      <div className="glass-card p-8 text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success to-primary flex items-center justify-center mx-auto"><BookOpen className="w-8 h-8 text-white" /></div>
        <h2 className="text-xl font-display font-bold text-primary">Certificado Escolar</h2>
      </div>
      <div className="glass-card p-6 space-y-4">
        <div><Label className="text-sm font-semibold text-primary">Nome Completo *</Label><Input value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
        <div><Label className="text-sm font-semibold text-primary">Data Nascimento</Label><Input value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} placeholder="DD/MM/AAAA" className="mt-1.5 bg-secondary/50" /></div>
        <div><Label className="text-sm font-semibold text-primary">Série / Nível *</Label>
          <Select value={serie} onValueChange={setSerie}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{SERIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
        </div>
        <div><Label className="text-sm font-semibold text-primary">Ano de Conclusão</Label><Input value={anoConclusao} onChange={(e) => setAnoConclusao(e.target.value)} placeholder="2024" className="mt-1.5 bg-secondary/50" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Cidade</Label><Input value={cidade} onChange={(e) => setCidade(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">UF</Label><Select value={uf} onValueChange={setUf}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="UF" /></SelectTrigger><SelectContent>{UF_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <div><Label className="text-sm font-semibold text-primary">Nome da Escola</Label><Input value={escola} onChange={(e) => setEscola(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Diretor</Label><Input value={diretor} onChange={(e) => setDiretor(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">Secretário</Label><Input value={secretario} onChange={(e) => setSecretario(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1"><Label className="text-sm font-semibold text-primary">Registro INEP</Label><Input value={registroINEP} onChange={(e) => setRegistroINEP(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
          <Button variant="outline" className="mt-7 shrink-0 gap-1 border-primary/50 text-primary" onClick={() => setRegistroINEP(generateDigits(8))}><Shuffle className="w-4 h-4" /></Button>
        </div>
        <div><Label className="text-sm font-semibold text-primary">Data Emissão</Label><Input value={dataEmissao} onChange={(e) => setDataEmissao(e.target.value)} placeholder="DD/MM/AAAA" className="mt-1.5 bg-secondary/50" /></div>
        <Button variant="outline" onClick={handleAIFill} disabled={loading} className="w-full gap-2 border-accent/50 text-accent hover:bg-accent/10"><Wand2 className="w-4 h-4" />{loading ? "Gerando..." : "Preencher dados da escola com IA"}</Button>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" className="gap-2 border-accent/50 text-accent flex-1" onClick={fillTest}><Zap className="w-5 h-5" /> Teste</Button>
        <Button onClick={handlePreview} className="flex-[2] navy-gradient text-primary-foreground font-semibold py-5 text-base"><Eye className="w-5 h-5 mr-2" />Visualizar Prévia</Button>
        <Button variant="outline" className="gap-2 border-destructive/50 text-destructive flex-1" onClick={clearAll}><Trash2 className="w-5 h-5" /> Excluir</Button>
      </div>
    </div>
  );
};

export default CertificadoEscolarForm;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Award, Sparkles, Eye, Download, Wand2, Shuffle, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { saveDocumentHistory } from "@/lib/saveDocumentHistory";

const UF_OPTIONS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const generateDigits = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");

const DiplomaForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<"form" | "preview">("form");
  const [loading, setLoading] = useState(false);

  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpf, setCpf] = useState("");
  const [curso, setCurso] = useState("");
  const [grau, setGrau] = useState("");
  const [instituicao, setInstituicao] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [dataColacao, setDataColacao] = useState("");
  const [dataExpedicao, setDataExpedicao] = useState("");
  const [registroMEC, setRegistroMEC] = useState("");
  const [reitor, setReitor] = useState("");

  const formatCPF = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  const handleAIFill = async () => {
    if (!curso || !cidade || !uf) { toast.error("Preencha curso, cidade e UF."); return; }
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke("medical-ai", {
        body: { type: "custom", prompt: `Gere dados fictícios realistas para um diploma de graduação em ${curso} em ${cidade}-${uf}. JSON: {"instituicao":"nome da universidade","reitor":"nome do reitor","registroMEC":"número de registro MEC","dataColacao":"DD/MM/AAAA","dataExpedicao":"DD/MM/AAAA"}` },
      });
      if (data?.result) {
        try {
          const json = JSON.parse(data.result.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
          if (json.instituicao) setInstituicao(json.instituicao);
          if (json.reitor) setReitor(json.reitor);
          if (json.registroMEC) setRegistroMEC(json.registroMEC);
          if (json.dataColacao) setDataColacao(json.dataColacao);
          if (json.dataExpedicao) setDataExpedicao(json.dataExpedicao);
          toast.success("Dados da instituição gerados com IA!");
        } catch { toast.error("Erro ao processar."); }
      }
    } catch { toast.error("Erro ao conectar."); }
    setLoading(false);
  };

  const fillTest = () => {
    setNomeCompleto("RAFAEL AUGUSTO BARBOSA"); setCpf("567.890.123-45"); setCurso("ENGENHARIA CIVIL");
    setGrau("BACHAREL"); setInstituicao("UNIVERSIDADE ESTADUAL DE CAMPINAS - UNICAMP");
    setCidade("CAMPINAS"); setUf("SP"); setDataColacao("15/12/2025"); setDataExpedicao("20/01/2026");
    setRegistroMEC(generateDigits(8)); setReitor("PROF. DR. ANTÔNIO CARLOS NEDER");
    toast.success("Campos preenchidos com dados de teste!");
  };
  const clearAll = () => {
    setNomeCompleto(""); setCpf(""); setCurso(""); setGrau(""); setInstituicao("");
    setCidade(""); setUf(""); setDataColacao(""); setDataExpedicao(""); setRegistroMEC(""); setReitor("");
    toast.success("Campos limpos!");
  };
  const handlePreview = () => {
    if (!nomeCompleto || !curso) { toast.error("Preencha os campos obrigatórios."); return; }
    setStep("preview");
  };

  const handleConcluir = () => { toast.success("Diploma gerado com sucesso!"); };

  if (step === "preview") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto pb-12">
        <Button variant="outline" onClick={() => setStep("form")} className="gap-2"><ArrowLeft className="w-4 h-4" />Voltar</Button>
        <div className="glass-card p-8 space-y-6">
          <h2 className="text-xl font-display font-bold text-primary text-center">Prévia — Diploma</h2>
          <div className="border border-border rounded-xl p-6 space-y-3 bg-card/50">
            {instituicao && <div className="text-center pb-3 border-b border-border"><p className="font-bold text-lg text-foreground">{instituicao}</p></div>}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground text-xs">Graduado(a)</span><p className="font-semibold text-foreground">{nomeCompleto}</p></div>
              <div><span className="text-muted-foreground text-xs">CPF</span><p className="font-semibold text-foreground">{cpf}</p></div>
              <div><span className="text-muted-foreground text-xs">Curso</span><p className="font-semibold text-foreground">{curso}</p></div>
              <div><span className="text-muted-foreground text-xs">Grau</span><p className="font-semibold text-foreground">{grau}</p></div>
              <div><span className="text-muted-foreground text-xs">Colação</span><p className="font-semibold text-foreground">{dataColacao}</p></div>
              <div><span className="text-muted-foreground text-xs">Expedição</span><p className="font-semibold text-foreground">{dataExpedicao}</p></div>
              <div><span className="text-muted-foreground text-xs">Registro MEC</span><p className="font-semibold text-foreground">{registroMEC}</p></div>
              <div><span className="text-muted-foreground text-xs">Reitor</span><p className="font-semibold text-foreground">{reitor}</p></div>
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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-warning to-amber-500 flex items-center justify-center mx-auto"><Award className="w-8 h-8 text-white" /></div>
        <h2 className="text-xl font-display font-bold text-primary">Diploma de Graduação</h2>
      </div>
      <div className="glass-card p-6 space-y-4">
        <div><Label className="text-sm font-semibold text-primary">Nome Completo *</Label><Input value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
        <div><Label className="text-sm font-semibold text-primary">CPF</Label><Input value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} placeholder="000.000.000-00" className="mt-1.5 bg-secondary/50" maxLength={14} /></div>
        <div><Label className="text-sm font-semibold text-primary">Curso *</Label><Input value={curso} onChange={(e) => setCurso(e.target.value)} placeholder="Ex: Direito" className="mt-1.5 bg-secondary/50" /></div>
        <div><Label className="text-sm font-semibold text-primary">Grau Acadêmico</Label>
          <Select value={grau} onValueChange={setGrau}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="Bacharel">Bacharel</SelectItem><SelectItem value="Licenciatura">Licenciatura</SelectItem><SelectItem value="Tecnólogo">Tecnólogo</SelectItem></SelectContent></Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Cidade</Label><Input value={cidade} onChange={(e) => setCidade(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">UF</Label><Select value={uf} onValueChange={setUf}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="UF" /></SelectTrigger><SelectContent>{UF_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <div><Label className="text-sm font-semibold text-primary">Instituição</Label><Input value={instituicao} onChange={(e) => setInstituicao(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Data Colação</Label><Input value={dataColacao} onChange={(e) => setDataColacao(e.target.value)} placeholder="DD/MM/AAAA" className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">Data Expedição</Label><Input value={dataExpedicao} onChange={(e) => setDataExpedicao(e.target.value)} placeholder="DD/MM/AAAA" className="mt-1.5 bg-secondary/50" /></div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1"><Label className="text-sm font-semibold text-primary">Registro MEC</Label><Input value={registroMEC} onChange={(e) => setRegistroMEC(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
          <Button variant="outline" className="mt-7 shrink-0 gap-1 border-primary/50 text-primary" onClick={() => setRegistroMEC(generateDigits(12))}><Shuffle className="w-4 h-4" /></Button>
        </div>
        <div><Label className="text-sm font-semibold text-primary">Reitor(a)</Label><Input value={reitor} onChange={(e) => setReitor(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
        <Button variant="outline" onClick={handleAIFill} disabled={loading} className="w-full gap-2 border-accent/50 text-accent hover:bg-accent/10"><Wand2 className="w-4 h-4" />{loading ? "Gerando..." : "Preencher dados da instituição com IA"}</Button>
      </div>
      <Button onClick={handlePreview} className="w-full navy-gradient text-primary-foreground font-semibold py-5 text-base"><Eye className="w-5 h-5 mr-2" />Visualizar Prévia</Button>
    </div>
  );
};

export default DiplomaForm;

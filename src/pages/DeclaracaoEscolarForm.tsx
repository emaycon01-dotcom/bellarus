import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ScrollText, Sparkles, Eye, Download, Wand2, Shuffle, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const UF_OPTIONS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const TURNOS = ["Matutino", "Vespertino", "Noturno", "Integral"];
const generateDigits = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");

const DeclaracaoEscolarForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "preview">("form");
  const [loading, setLoading] = useState(false);

  const [nomeAluno, setNomeAluno] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [serie, setSerie] = useState("");
  const [turno, setTurno] = useState("");
  const [anoLetivo, setAnoLetivo] = useState("");
  const [matricula, setMatricula] = useState("");
  const [escola, setEscola] = useState("");
  const [enderecoEscola, setEnderecoEscola] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [diretor, setDiretor] = useState("");
  const [dataEmissao, setDataEmissao] = useState("");

  const handleAIFill = async () => {
    if (!cidade || !uf) { toast.error("Preencha cidade e UF."); return; }
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke("medical-ai", {
        body: { type: "custom", prompt: `Gere dados fictícios para declaração escolar em ${cidade}-${uf}. JSON: {"escola":"nome","enderecoEscola":"endereço completo","diretor":"nome","dataEmissao":"DD/MM/AAAA"}` },
      });
      if (data?.result) {
        try {
          const json = JSON.parse(data.result.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
          if (json.escola) setEscola(json.escola);
          if (json.enderecoEscola) setEnderecoEscola(json.enderecoEscola);
          if (json.diretor) setDiretor(json.diretor);
          if (json.dataEmissao) setDataEmissao(json.dataEmissao);
          toast.success("Dados gerados com IA!");
        } catch { toast.error("Erro."); }
      }
    } catch { toast.error("Erro ao conectar."); }
    setLoading(false);
  };

  const fillTest = () => {
    setNomeAluno("MATHEUS HENRIQUE COSTA"); setDataNascimento("25/09/2008"); setSerie("9º Ano");
    setTurno("Matutino"); setAnoLetivo("2026"); setMatricula(generateDigits(8));
    setEscola("E.E. PROF. JOÃO BATISTA DE OLIVEIRA"); setEnderecoEscola("Rua das Palmeiras, 200 - Centro");
    setCidade("SÃO PAULO"); setUf("SP"); setDiretor("PROF. REGINA CÉLIA MARTINS"); setDataEmissao("07/03/2026");
    toast.success("Campos preenchidos com dados de teste!");
  };
  const clearAll = () => {
    setNomeAluno(""); setDataNascimento(""); setSerie(""); setTurno(""); setAnoLetivo(""); setMatricula("");
    setEscola(""); setEnderecoEscola(""); setCidade(""); setUf(""); setDiretor(""); setDataEmissao("");
    toast.success("Campos limpos!");
  };
  const handlePreview = () => {
    if (!nomeAluno || !serie) { toast.error("Preencha os campos obrigatórios."); return; }
    setStep("preview");
  };

  const handleConcluir = () => { toast.success("Declaração Escolar gerada com sucesso!"); };

  if (step === "preview") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto pb-12">
        <Button variant="outline" onClick={() => setStep("form")} className="gap-2"><ArrowLeft className="w-4 h-4" />Voltar</Button>
        <div className="glass-card p-8 space-y-6">
          <h2 className="text-xl font-display font-bold text-primary text-center">Prévia — Declaração Escolar</h2>
          <div className="border border-border rounded-xl p-6 space-y-3 bg-card/50">
            {escola && <div className="text-center pb-3 border-b border-border"><p className="font-bold text-lg text-foreground">{escola}</p><p className="text-xs text-muted-foreground">{enderecoEscola}</p></div>}
            <div className="text-sm space-y-2">
              <p className="text-foreground">Declaramos para os devidos fins que <span className="font-bold">{nomeAluno}</span>, nascido(a) em <span className="font-bold">{dataNascimento}</span>, encontra-se regularmente matriculado(a) nesta instituição de ensino, cursando a <span className="font-bold">{serie}</span>, no turno <span className="font-bold">{turno}</span>, durante o ano letivo de <span className="font-bold">{anoLetivo}</span>.</p>
              <p className="text-foreground">Matrícula: <span className="font-bold">{matricula}</span></p>
            </div>
            <div className="pt-4 text-center text-sm">
              <p className="text-muted-foreground">{cidade}/{uf}, {dataEmissao}</p>
              <p className="font-semibold text-foreground mt-4">{diretor}</p>
              <p className="text-xs text-muted-foreground">Diretor(a)</p>
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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted-foreground to-secondary flex items-center justify-center mx-auto"><ScrollText className="w-8 h-8 text-white" /></div>
        <h2 className="text-xl font-display font-bold text-primary">Declaração Escolar</h2>
        <p className="text-sm text-muted-foreground">Declaração de matrícula escolar</p>
      </div>
      <div className="glass-card p-6 space-y-4">
        <div><Label className="text-sm font-semibold text-primary">Nome do Aluno *</Label><Input value={nomeAluno} onChange={(e) => setNomeAluno(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
        <div><Label className="text-sm font-semibold text-primary">Data Nascimento</Label><Input value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} placeholder="DD/MM/AAAA" className="mt-1.5 bg-secondary/50" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Série/Ano *</Label><Input value={serie} onChange={(e) => setSerie(e.target.value)} placeholder="Ex: 3º Ano do Ensino Médio" className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">Turno</Label>
            <Select value={turno} onValueChange={setTurno}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{TURNOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Ano Letivo</Label><Input value={anoLetivo} onChange={(e) => setAnoLetivo(e.target.value)} placeholder="2025" className="mt-1.5 bg-secondary/50" /></div>
          <div className="flex gap-2">
            <div className="flex-1"><Label className="text-sm font-semibold text-primary">Matrícula</Label><Input value={matricula} onChange={(e) => setMatricula(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
            <Button variant="outline" className="mt-7 shrink-0 gap-1 border-primary/50 text-primary" onClick={() => setMatricula(generateDigits(8))}><Shuffle className="w-4 h-4" /></Button>
          </div>
        </div>
        <div className="border-t border-border pt-4"><h3 className="text-sm font-bold text-foreground mb-3">Dados da Escola</h3></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Cidade</Label><Input value={cidade} onChange={(e) => setCidade(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">UF</Label><Select value={uf} onValueChange={setUf}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="UF" /></SelectTrigger><SelectContent>{UF_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <div><Label className="text-sm font-semibold text-primary">Nome da Escola</Label><Input value={escola} onChange={(e) => setEscola(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
        <div><Label className="text-sm font-semibold text-primary">Endereço da Escola</Label><Input value={enderecoEscola} onChange={(e) => setEnderecoEscola(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
        <div><Label className="text-sm font-semibold text-primary">Diretor(a)</Label><Input value={diretor} onChange={(e) => setDiretor(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
        <div><Label className="text-sm font-semibold text-primary">Data Emissão</Label><Input value={dataEmissao} onChange={(e) => setDataEmissao(e.target.value)} placeholder="DD/MM/AAAA" className="mt-1.5 bg-secondary/50" /></div>
        <Button variant="outline" onClick={handleAIFill} disabled={loading} className="w-full gap-2 border-accent/50 text-accent hover:bg-accent/10"><Wand2 className="w-4 h-4" />{loading ? "Gerando..." : "Preencher dados da escola com IA"}</Button>
      </div>
      <Button onClick={handlePreview} className="w-full navy-gradient text-primary-foreground font-semibold py-5 text-base"><Eye className="w-5 h-5 mr-2" />Visualizar Prévia</Button>
    </div>
  );
};

export default DeclaracaoEscolarForm;

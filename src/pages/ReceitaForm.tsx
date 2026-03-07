import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Shield, Users, Clock, Sparkles, Eye, Activity, CheckCircle2, Shuffle, Search, Plus, Trash2, Wand2, MapPin, Phone, Building2, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const UF_OPTIONS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const MEDICAMENTOS_DATABASE = [
  { nome: "Amoxicilina 500mg", tipo: "Antibiótico", dose: "1 cápsula de 8 em 8 horas por 7 dias" },
  { nome: "Azitromicina 500mg", tipo: "Antibiótico", dose: "1 comprimido por dia por 3 dias" },
  { nome: "Ibuprofeno 600mg", tipo: "Anti-inflamatório", dose: "1 comprimido de 8 em 8 horas por 5 dias" },
  { nome: "Paracetamol 750mg", tipo: "Analgésico", dose: "1 comprimido de 6 em 6 horas se dor" },
  { nome: "Dipirona 500mg", tipo: "Analgésico", dose: "1 comprimido de 6 em 6 horas se febre" },
  { nome: "Omeprazol 20mg", tipo: "Protetor gástrico", dose: "1 cápsula em jejum por 30 dias" },
  { nome: "Prednisona 20mg", tipo: "Corticoide", dose: "1 comprimido por dia por 5 dias" },
  { nome: "Loratadina 10mg", tipo: "Antialérgico", dose: "1 comprimido por dia" },
  { nome: "Dexametasona 4mg", tipo: "Corticoide", dose: "1 comprimido por dia por 3 dias" },
  { nome: "Cefalexina 500mg", tipo: "Antibiótico", dose: "1 cápsula de 6 em 6 horas por 7 dias" },
  { nome: "Nimesulida 100mg", tipo: "Anti-inflamatório", dose: "1 comprimido de 12 em 12 horas por 5 dias" },
  { nome: "Fluoxetina 20mg", tipo: "Antidepressivo", dose: "1 cápsula por dia pela manhã" },
  { nome: "Rivotril 2mg", tipo: "Ansiolítico", dose: "1 comprimido à noite" },
  { nome: "Losartana 50mg", tipo: "Anti-hipertensivo", dose: "1 comprimido por dia" },
  { nome: "Metformina 850mg", tipo: "Antidiabético", dose: "1 comprimido 2x ao dia com refeições" },
  { nome: "Sinvastatina 20mg", tipo: "Estatina", dose: "1 comprimido à noite" },
];

const ESPECIALIDADES = ["CLÍNICO GERAL", "CARDIOLOGISTA", "ORTOPEDISTA", "DERMATOLOGISTA", "NEUROLOGISTA", "GINECOLOGISTA", "PEDIATRA", "PSIQUIATRA", "OFTALMOLOGISTA", "OTORRINOLARINGOLOGISTA", "ENDOCRINOLOGISTA", "GASTROENTEROLOGISTA"];

const generateDigits = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");
const generateCRM = (uf: string) => `CRM/${uf || "SP"} ${generateDigits(6)}`;

interface MedicamentoItem {
  nome: string;
  dose: string;
}

const ReceitaForm = () => {
  const navigate = useNavigate();

  const [nomePaciente, setNomePaciente] = useState("");
  const [cpfPaciente, setCpfPaciente] = useState("");
  const [nomeMedico, setNomeMedico] = useState("");
  const [crm, setCrm] = useState("");
  const [ufMedico, setUfMedico] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [dataReceita, setDataReceita] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // UPA/Hospital fields
  const [nomeUpa, setNomeUpa] = useState("");
  const [enderecoUpa, setEnderecoUpa] = useState("");
  const [telefoneUpa, setTelefoneUpa] = useState("");
  const [cnesUpa, setCnesUpa] = useState("");

  // Medicamentos
  const [medSearch, setMedSearch] = useState("");
  const [showMedResults, setShowMedResults] = useState(false);
  const [medicamentos, setMedicamentos] = useState<MedicamentoItem[]>([]);

  // AI states
  const [loadingMedAi, setLoadingMedAi] = useState(false);
  const [aiMedResults, setAiMedResults] = useState<{ nome: string; tipo: string; dose: string }[]>([]);
  const [loadingMedico, setLoadingMedico] = useState(false);
  const [loadingUpa, setLoadingUpa] = useState(false);

  const localMedResults = useMemo(() => {
    if (!medSearch || medSearch.length < 2) return [];
    const q = medSearch.toLowerCase();
    return MEDICAMENTOS_DATABASE.filter(m => m.nome.toLowerCase().includes(q) || m.tipo.toLowerCase().includes(q)).slice(0, 5);
  }, [medSearch]);

  const combinedMedResults = useMemo(() => {
    const aiOnly = aiMedResults.filter(ai => !localMedResults.some(l => l.nome === ai.nome));
    return [...localMedResults, ...aiOnly].slice(0, 8);
  }, [localMedResults, aiMedResults]);

  const searchMedWithAI = async () => {
    if (!medSearch || medSearch.length < 2) return;
    setLoadingMedAi(true);
    try {
      const { data, error } = await supabase.functions.invoke("medical-ai", {
        body: { type: "medicamento", query: medSearch }
      });
      if (error) throw error;
      if (data?.results) {
        setAiMedResults(data.results);
        setShowMedResults(true);
      }
    } catch {
      toast.error("Erro ao buscar medicamentos com IA");
    } finally {
      setLoadingMedAi(false);
    }
  };

  const generateMedicoAI = async () => {
    setLoadingMedico(true);
    try {
      const { data, error } = await supabase.functions.invoke("medical-ai", {
        body: { type: "medico", query: `Gere um médico ${especialidade || "clínico geral"} do estado ${ufMedico || "SP"}` }
      });
      if (error) throw error;
      if (data?.nome) {
        setNomeMedico(data.nome.toUpperCase());
        setCrm(`CRM/${ufMedico || "SP"} ${data.crm}`);
        if (data.especialidade) setEspecialidade(data.especialidade.toUpperCase());
        toast.success("Dados do médico gerados pela IA!");
      }
    } catch {
      toast.error("Erro ao gerar médico com IA");
    } finally {
      setLoadingMedico(false);
    }
  };

  const generateUpaAI = async () => {
    setLoadingUpa(true);
    try {
      const { data, error } = await supabase.functions.invoke("medical-ai", {
        body: { type: "upa", query: `Gere dados de uma UPA/Hospital no estado ${ufMedico || "SP"}` }
      });
      if (error) throw error;
      if (data?.nome) {
        setNomeUpa(data.nome.toUpperCase());
        setEnderecoUpa(data.endereco);
        setTelefoneUpa(data.telefone);
        setCnesUpa(data.cnes);
        toast.success("Dados da UPA gerados pela IA!");
      }
    } catch {
      toast.error("Erro ao gerar UPA com IA");
    } finally {
      setLoadingUpa(false);
    }
  };

  const addMedicamento = (med: { nome: string; dose: string }) => {
    setMedicamentos(prev => [...prev, { nome: med.nome, dose: med.dose }]);
    setMedSearch("");
    setShowMedResults(false);
    setAiMedResults([]);
    toast.success(`${med.nome} adicionado!`);
  };

  const removeMedicamento = (index: number) => {
    setMedicamentos(prev => prev.filter((_, i) => i !== index));
  };

  const fillTest = () => {
    setNomePaciente("MARIA SILVA SANTOS"); setCpfPaciente("123.456.789-00"); setNomeMedico("DR. CARLOS HENRIQUE OLIVEIRA");
    setCrm("CRM/SP 184523"); setUfMedico("SP"); setEspecialidade("CLÍNICO GERAL"); setDataReceita("15/03/2026");
    setNomeUpa("UPA 24H VILA PRUDENTE"); setEnderecoUpa("Rua do Oratório, 1500 - Vila Prudente, SP");
    setTelefoneUpa("(11) 2061-8022"); setCnesUpa("2078015");
    setMedicamentos([{ nome: "Amoxicilina 500mg", dose: "1 cápsula de 8 em 8 horas por 7 dias" }, { nome: "Paracetamol 750mg", dose: "1 comprimido de 6 em 6 horas se dor" }]);
    toast.success("Campos preenchidos com dados de teste!");
  };
  const clearAll = () => {
    setNomePaciente(""); setCpfPaciente(""); setNomeMedico(""); setCrm(""); setUfMedico(""); setEspecialidade("");
    setDataReceita(""); setObservacoes(""); setNomeUpa(""); setEnderecoUpa(""); setTelefoneUpa(""); setCnesUpa("");
    setMedicamentos([]); setMedSearch(""); setAiMedResults([]);
    toast.success("Campos limpos!");
  };
  const handlePreview = () => { setShowPreview(true); toast.success("Preview gerado!"); };
  const handleConfirm = () => { toast.success("Documento confirmado! 1 crédito será debitado."); };

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
        {[{ icon: Shield, label: "Receita Segura", desc: "Com QR Code" },{ icon: Users, label: "IA Inteligente", desc: "Medicamentos + UPA" },{ icon: Clock, label: "Validade 45 Dias", desc: "Tempo garantido" }].map((f) => (
          <div key={f.label} className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl navy-gradient flex items-center justify-center shrink-0"><f.icon className="w-5 h-5 text-primary-foreground" /></div>
            <div className="min-w-0"><p className="text-sm font-semibold text-foreground truncate">{f.label}</p><p className="text-xs text-muted-foreground">{f.desc}</p></div>
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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto"><Activity className="w-8 h-8 text-white" /></div>
        <h2 className="text-xl font-display font-bold text-primary">Receita Médica</h2>
        <p className="text-sm text-muted-foreground">Receita médica com IA inteligente para medicamentos, médicos e UPA</p>
      </div>

      {!showPreview ? (
        <>
          {/* Dados do Paciente */}
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-display font-bold text-foreground">Dados do Paciente</h3>
            </div>
            <div className="space-y-4">
              <div><Label className="text-sm font-semibold text-primary">Nome Completo <span className="text-destructive">*</span></Label><Input placeholder="Ex: PEDRO DA SILVA" value={nomePaciente} onChange={(e) => setNomePaciente(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              <div><Label className="text-sm font-semibold text-primary">CPF</Label><Input placeholder="000.000.000-00" value={cpfPaciente} onChange={(e) => setCpfPaciente(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
            </div>
          </div>

          {/* Dados do Médico */}
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-display font-bold text-foreground">Dados do Médico</h3>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 border-accent/50 text-accent" onClick={generateMedicoAI} disabled={loadingMedico}>
                {loadingMedico ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                Gerar com IA
              </Button>
            </div>
            <div className="space-y-4">
              <div><Label className="text-sm font-semibold text-primary">Nome do Médico <span className="text-destructive">*</span></Label><Input placeholder="Ex: DR. CARLOS MENDES" value={nomeMedico} onChange={(e) => setNomeMedico(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-primary">UF <span className="text-destructive">*</span></Label>
                  <Select value={ufMedico} onValueChange={setUfMedico}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="UF" /></SelectTrigger><SelectContent>{UF_OPTIONS.map(u=><SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-primary">CRM <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input placeholder="CRM/SP 000000" value={crm} onChange={(e) => setCrm(e.target.value.toUpperCase())} className="bg-secondary/50" />
                    <Button variant="outline" size="sm" className="shrink-0 gap-1 border-primary/50 text-primary" onClick={() => setCrm(generateCRM(ufMedico))}><Shuffle className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-primary">Especialidade</Label>
                <Select value={especialidade} onValueChange={setEspecialidade}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{ESPECIALIDADES.map(e=><SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select>
              </div>
              <div><Label className="text-sm font-semibold text-primary">Data da Receita</Label><Input placeholder="DD/MM/AAAA" value={dataReceita} onChange={(e) => setDataReceita(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
            </div>
          </div>

          {/* Dados da UPA/Hospital */}
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-display font-bold text-foreground">UPA / Hospital / Clínica</h3>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 border-accent/50 text-accent" onClick={generateUpaAI} disabled={loadingUpa}>
                {loadingUpa ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                Gerar com IA
              </Button>
            </div>
            <div className="space-y-4">
              <div><Label className="text-sm font-semibold text-primary">Nome da UPA / Hospital <span className="text-destructive">*</span></Label><Input placeholder="Ex: UPA 24H SÃO MATEUS" value={nomeUpa} onChange={(e) => setNomeUpa(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              <div><Label className="text-sm font-semibold text-primary">Endereço Completo <span className="text-destructive">*</span></Label>
                <div className="relative mt-1.5">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Rua, Número, Bairro, Cidade - UF" value={enderecoUpa} onChange={(e) => setEnderecoUpa(e.target.value)} className="pl-10 bg-secondary/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-semibold text-primary">Telefone</Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="(00) 0000-0000" value={telefoneUpa} onChange={(e) => setTelefoneUpa(e.target.value)} className="pl-10 bg-secondary/50" />
                  </div>
                </div>
                <div><Label className="text-sm font-semibold text-primary">CNES</Label><Input placeholder="0000000" value={cnesUpa} onChange={(e) => setCnesUpa(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              </div>
            </div>
          </div>

          {/* Medicamentos com IA */}
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Sparkles className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-display font-bold text-foreground">Medicamentos <span className="text-xs text-accent font-normal ml-2">✦ IA Inteligente</span></h3>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <Label className="text-sm font-semibold text-primary">Buscar Medicamento</Label>
                <div className="relative mt-1.5 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Digite sintomas ou nome do medicamento..."
                      value={medSearch}
                      onChange={(e) => { setMedSearch(e.target.value); setShowMedResults(true); }}
                      onFocus={() => setShowMedResults(true)}
                      className="pl-10 bg-secondary/50"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0 gap-1.5 border-accent/50 text-accent" onClick={searchMedWithAI} disabled={loadingMedAi || medSearch.length < 2}>
                    {loadingMedAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    IA
                  </Button>
                </div>
                {showMedResults && combinedMedResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 rounded-xl border border-border bg-popover shadow-xl max-h-60 overflow-y-auto">
                    {combinedMedResults.map((med, i) => (
                      <button key={i} className="w-full px-4 py-3 text-left hover:bg-accent/10 transition-colors border-b border-border/30 last:border-0"
                        onClick={() => addMedicamento(med)}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-foreground">{med.nome}</p>
                            <p className="text-xs text-muted-foreground">{med.tipo} • {med.dose}</p>
                          </div>
                          <Plus className="w-4 h-4 text-primary" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {medicamentos.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Medicamentos Adicionados ({medicamentos.length})</Label>
                  {medicamentos.map((med, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">{i + 1}</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">{med.nome}</p>
                        <Input value={med.dose} onChange={(e) => {
                          const updated = [...medicamentos];
                          updated[i] = { ...updated[i], dose: e.target.value };
                          setMedicamentos(updated);
                        }} className="mt-1 bg-secondary/50 text-xs h-8" />
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeMedicamento(i)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              )}

              <div><Label className="text-sm font-semibold text-foreground">Observações</Label><Textarea placeholder="Orientações adicionais..." value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="mt-1.5 bg-secondary/50 min-h-[80px]" /></div>
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"><Eye className="w-5 h-5 text-white" /></div>
              <h3 className="text-lg font-display font-bold text-foreground">Preview Receita Médica</h3>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowPreview(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Editar</Button>
          </div>
          <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-6 space-y-5 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none"><Activity className="w-64 h-64" /></div>
            {/* Header */}
            <div className="text-center space-y-1 border-b border-border pb-4 relative">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">RECEITA MÉDICA</p>
              <h3 className="text-lg font-display font-bold text-foreground">{nomeUpa || "CLÍNICA MÉDICA"}</h3>
              {enderecoUpa && <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><MapPin className="w-3 h-3" /> {enderecoUpa}</p>}
              <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
                {telefoneUpa && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {telefoneUpa}</span>}
                {cnesUpa && <span>CNES: {cnesUpa}</span>}
              </div>
              <p className="text-xs text-muted-foreground">{dataReceita}</p>
            </div>
            {/* Body */}
            <div className="space-y-3 relative">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Paciente</p><p className="text-sm font-bold text-foreground">{nomePaciente || "---"}</p></div>
                <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">CPF</p><p className="text-sm font-mono text-foreground">{cpfPaciente || "---"}</p></div>
              </div>
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-xs font-bold uppercase text-primary">Prescrição</p>
                {medicamentos.length > 0 ? medicamentos.map((med, i) => (
                  <div key={i} className="p-3 rounded-lg bg-card border border-border">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span>
                      <span className="text-sm font-bold text-foreground">{med.nome}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-8">{med.dose}</p>
                  </div>
                )) : <p className="text-sm text-muted-foreground italic">Nenhum medicamento adicionado</p>}
              </div>
              {observacoes && <div className="border-t border-border pt-4"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Observações</p><p className="text-sm text-foreground mt-1">{observacoes}</p></div>}
              <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Médico Responsável</p>
                  <p className="text-sm font-bold text-foreground">{nomeMedico || "---"}</p>
                  <p className="text-xs text-muted-foreground">{especialidade}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">CRM</p>
                  <p className="text-sm font-mono font-bold text-primary">{crm || "---"}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="lg" onClick={() => setShowPreview(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Editar</Button>
            <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-accent text-white" onClick={handleConfirm}><CheckCircle2 className="w-5 h-5" /> Confirmar (1 Crédito)</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceitaForm;

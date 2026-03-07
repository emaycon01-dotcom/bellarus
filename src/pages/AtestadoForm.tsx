import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Shield, Users, Clock, Sparkles, Eye, Stethoscope, CheckCircle2, Shuffle, Search, Wand2, MapPin, Phone, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const UF_OPTIONS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const CID_DATABASE = [
  { code: "J00", name: "Nasofaringite aguda (resfriado comum)", days: 2 },
  { code: "J06.9", name: "Infecção aguda das vias aéreas superiores", days: 3 },
  { code: "J11", name: "Influenza (gripe)", days: 5 },
  { code: "K29.7", name: "Gastrite não especificada", days: 2 },
  { code: "R51", name: "Cefaleia", days: 1 },
  { code: "M54.5", name: "Dor lombar baixa (lombalgia)", days: 3 },
  { code: "R10.4", name: "Dor abdominal", days: 2 },
  { code: "A09", name: "Gastroenterite infecciosa", days: 3 },
  { code: "N39.0", name: "Infecção do trato urinário", days: 3 },
  { code: "R50.9", name: "Febre não especificada", days: 2 },
  { code: "J02.9", name: "Faringite aguda", days: 3 },
  { code: "J03.9", name: "Amigdalite aguda", days: 3 },
  { code: "B34.9", name: "Infecção viral", days: 3 },
  { code: "R11", name: "Náusea e vômitos", days: 1 },
  { code: "G43.9", name: "Enxaqueca não especificada", days: 2 },
  { code: "F41.0", name: "Transtorno de pânico", days: 5 },
  { code: "F32.0", name: "Episódio depressivo leve", days: 7 },
  { code: "M79.1", name: "Mialgia", days: 2 },
  { code: "H10.9", name: "Conjuntivite", days: 3 },
  { code: "L30.9", name: "Dermatite não especificada", days: 2 },
];

const ESPECIALIDADES = ["CLÍNICO GERAL", "CARDIOLOGISTA", "ORTOPEDISTA", "DERMATOLOGISTA", "NEUROLOGISTA", "GINECOLOGISTA", "PEDIATRA", "PSIQUIATRA", "OFTALMOLOGISTA", "OTORRINOLARINGOLOGISTA"];

const generateDigits = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");
const generateCRM = (uf: string) => `CRM/${uf || "SP"} ${generateDigits(6)}`;

const AtestadoForm = () => {
  const navigate = useNavigate();

  const [nomePaciente, setNomePaciente] = useState("");
  const [cpfPaciente, setCpfPaciente] = useState("");
  const [dataNascPaciente, setDataNascPaciente] = useState("");
  const [nomeMedico, setNomeMedico] = useState("");
  const [crm, setCrm] = useState("");
  const [ufMedico, setUfMedico] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [cidSearch, setCidSearch] = useState("");
  const [cidSelecionado, setCidSelecionado] = useState<{ code: string; name: string } | null>(null);
  const [diasAfastamento, setDiasAfastamento] = useState("");
  const [dataAtestado, setDataAtestado] = useState("");
  const [horaAtendimento, setHoraAtendimento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showCidResults, setShowCidResults] = useState(false);

  // UPA/Hospital fields
  const [nomeUpa, setNomeUpa] = useState("");
  const [enderecoUpa, setEnderecoUpa] = useState("");
  const [telefoneUpa, setTelefoneUpa] = useState("");
  const [cnesUpa, setCnesUpa] = useState("");

  // AI loading states
  const [loadingCidAi, setLoadingCidAi] = useState(false);
  const [aiCidResults, setAiCidResults] = useState<{ code: string; name: string; days: number }[]>([]);
  const [loadingMedico, setLoadingMedico] = useState(false);
  const [loadingUpa, setLoadingUpa] = useState(false);

  const cidResults = useMemo(() => {
    if (!cidSearch || cidSearch.length < 2) return [];
    const q = cidSearch.toLowerCase();
    return CID_DATABASE.filter(c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)).slice(0, 5);
  }, [cidSearch]);

  const combinedCidResults = useMemo(() => {
    const local = cidResults.map(c => ({ ...c, days: c.days }));
    const aiOnly = aiCidResults.filter(ai => !local.some(l => l.code === ai.code));
    return [...local, ...aiOnly].slice(0, 8);
  }, [cidResults, aiCidResults]);

  const searchCidWithAI = async () => {
    if (!cidSearch || cidSearch.length < 2) return;
    setLoadingCidAi(true);
    try {
      const { data, error } = await supabase.functions.invoke("medical-ai", {
        body: { type: "cid", query: cidSearch }
      });
      if (error) throw error;
      if (data?.results) {
        setAiCidResults(data.results);
        setShowCidResults(true);
      }
    } catch {
      toast.error("Erro ao buscar CIDs com IA");
    } finally {
      setLoadingCidAi(false);
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

  const handlePreview = () => { setShowPreview(true); toast.success("Preview gerado!"); };
  const handleConfirm = () => { toast.success("Documento confirmado! 1 crédito será debitado."); };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/dashboard/documents")} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary/20 text-primary"><Sparkles className="w-3 h-3" /> 1 Crédito</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[{ icon: Shield, label: "Documento Seguro", desc: "Com QR Code" },{ icon: Users, label: "IA Inteligente", desc: "CID + Médico + UPA" },{ icon: Clock, label: "Validade 45 Dias", desc: "Tempo garantido" }].map((f) => (
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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-destructive to-primary flex items-center justify-center mx-auto"><Stethoscope className="w-8 h-8 text-white" /></div>
        <h2 className="text-xl font-display font-bold text-primary">Atestado Médico</h2>
        <p className="text-sm text-muted-foreground">Atestado médico com IA inteligente para CID, médicos e UPA</p>
      </div>

      {!showPreview ? (
        <>
          {/* Dados do Paciente */}
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Stethoscope className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-display font-bold text-foreground">Dados do Paciente</h3>
            </div>
            <div className="space-y-4">
              <div><Label className="text-sm font-semibold text-primary">Nome Completo <span className="text-destructive">*</span></Label><Input placeholder="Ex: PEDRO DA SILVA" value={nomePaciente} onChange={(e) => setNomePaciente(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-semibold text-primary">CPF</Label><Input placeholder="000.000.000-00" value={cpfPaciente} onChange={(e) => setCpfPaciente(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
                <div><Label className="text-sm font-semibold text-primary">Data de Nascimento</Label><Input placeholder="DD/MM/AAAA" value={dataNascPaciente} onChange={(e) => setDataNascPaciente(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              </div>
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
                  <Label className="text-sm font-semibold text-primary">UF do Médico <span className="text-destructive">*</span></Label>
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

          {/* Diagnóstico com IA */}
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Sparkles className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-display font-bold text-foreground">Diagnóstico <span className="text-xs text-accent font-normal ml-2">✦ IA Inteligente</span></h3>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <Label className="text-sm font-semibold text-primary">Buscar CID (Código da Doença) <span className="text-destructive">*</span></Label>
                <div className="relative mt-1.5 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Digite sintomas ou nome da doença..."
                      value={cidSearch}
                      onChange={(e) => { setCidSearch(e.target.value); setShowCidResults(true); }}
                      onFocus={() => setShowCidResults(true)}
                      className="pl-10 bg-secondary/50"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0 gap-1.5 border-accent/50 text-accent" onClick={searchCidWithAI} disabled={loadingCidAi || cidSearch.length < 2}>
                    {loadingCidAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    IA
                  </Button>
                </div>
                {showCidResults && combinedCidResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 rounded-xl border border-border bg-popover shadow-xl max-h-60 overflow-y-auto">
                    {combinedCidResults.map((cid) => (
                      <button key={cid.code} className="w-full px-4 py-3 text-left hover:bg-accent/10 transition-colors flex items-center gap-3 border-b border-border/30 last:border-0"
                        onClick={() => { setCidSelecionado({ code: cid.code, name: cid.name }); setCidSearch(`${cid.code} - ${cid.name}`); setDiasAfastamento(String(cid.days)); setShowCidResults(false); setAiCidResults([]); }}>
                        <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">{cid.code}</span>
                        <span className="text-sm text-foreground flex-1">{cid.name}</span>
                        <span className="text-[10px] text-muted-foreground">{cid.days}d</span>
                      </button>
                    ))}
                  </div>
                )}
                {cidSelecionado && (
                  <div className="mt-2 p-3 rounded-lg bg-success/10 border border-success/20 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-sm text-success font-semibold">{cidSelecionado.code} - {cidSelecionado.name}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-semibold text-primary">Dias de Afastamento <span className="text-destructive">*</span></Label><Input placeholder="Ex: 3" value={diasAfastamento} onChange={(e) => setDiasAfastamento(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
                <div><Label className="text-sm font-semibold text-primary">Data do Atestado</Label><Input placeholder="DD/MM/AAAA" value={dataAtestado} onChange={(e) => setDataAtestado(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              </div>
              <div><Label className="text-sm font-semibold text-primary">Hora do Atendimento</Label><Input placeholder="HH:MM" value={horaAtendimento} onChange={(e) => setHoraAtendimento(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              <div><Label className="text-sm font-semibold text-foreground">Observações</Label><Textarea placeholder="Observações adicionais..." value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="mt-1.5 bg-secondary/50 min-h-[80px]" /></div>
            </div>
          </div>

          <div className="glass-card p-6 bg-muted/30 text-center">
            <Button size="lg" className="gap-2 bg-gradient-to-r from-destructive to-primary text-white" onClick={handlePreview}><Eye className="w-5 h-5" /> Gerar Preview</Button>
          </div>
        </>
      ) : (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-destructive to-primary flex items-center justify-center"><Eye className="w-5 h-5 text-white" /></div>
              <h3 className="text-lg font-display font-bold text-foreground">Preview Atestado Médico</h3>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowPreview(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Editar</Button>
          </div>
          <div className="rounded-2xl border-2 border-destructive/30 bg-gradient-to-br from-card via-card to-destructive/5 p-6 space-y-5 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none"><Stethoscope className="w-64 h-64" /></div>
            {/* Header */}
            <div className="text-center space-y-1 border-b border-border pb-4 relative">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-destructive">ATESTADO MÉDICO</p>
              <h3 className="text-lg font-display font-bold text-foreground">{nomeUpa || "CLÍNICA MÉDICA"}</h3>
              {enderecoUpa && <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><MapPin className="w-3 h-3" /> {enderecoUpa}</p>}
              <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
                {telefoneUpa && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {telefoneUpa}</span>}
                {cnesUpa && <span>CNES: {cnesUpa}</span>}
              </div>
              <p className="text-xs text-muted-foreground">{dataAtestado} às {horaAtendimento}</p>
            </div>
            {/* Body */}
            <div className="space-y-4 relative">
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="text-sm text-foreground leading-relaxed">
                  Atesto para os devidos fins que o(a) paciente <span className="font-bold">{nomePaciente || "___"}</span>,
                  portador(a) do CPF <span className="font-mono font-bold">{cpfPaciente || "___"}</span>,
                  nascido(a) em <span className="font-bold">{dataNascPaciente || "___"}</span>,
                  foi atendido(a) nesta data e necessita de <span className="font-bold text-primary">{diasAfastamento || "___"} dia(s)</span> de afastamento
                  de suas atividades.
                </p>
                {cidSelecionado && (
                  <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-xs text-muted-foreground">CID</p>
                    <p className="text-sm font-bold text-primary">{cidSelecionado.code} - {cidSelecionado.name}</p>
                  </div>
                )}
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
            <Button size="lg" className="gap-2 bg-gradient-to-r from-destructive to-primary text-white" onClick={handleConfirm}><CheckCircle2 className="w-5 h-5" /> Confirmar (1 Crédito)</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AtestadoForm;

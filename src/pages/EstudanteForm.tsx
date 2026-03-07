import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Shield, Users, Clock, Sparkles, Eye, GraduationCap, CheckCircle2, Shuffle, ImagePlus, UserCircle, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

const UF_OPTIONS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const TIPO_CURSO = ["GRADUAÇÃO", "PÓS-GRADUAÇÃO", "MESTRADO", "DOUTORADO", "TÉCNICO", "ENSINO MÉDIO"];
const PERIODO = ["MATUTINO", "VESPERTINO", "NOTURNO", "INTEGRAL", "EAD"];
const generateDigits = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");
const generateMatricula = () => `${new Date().getFullYear()}${generateDigits(6)}`;

const EstudanteForm = () => {
  const navigate = useNavigate();
  const fotoRef = useRef<HTMLInputElement>(null);

  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [instituicao, setInstituicao] = useState("");
  const [curso, setCurso] = useState("");
  const [tipoCurso, setTipoCurso] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [matricula, setMatricula] = useState("");
  const [uf, setUf] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [semestre, setSemestre] = useState("");
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Máximo 10MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setFotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const fillTest = () => {
    setNomeCompleto("FERNANDA OLIVEIRA SANTOS"); setCpf("890.123.456-78"); setRg(generateDigits(9));
    setDataNascimento("10/05/2000"); setInstituicao("UNIVERSIDADE DE SÃO PAULO - USP");
    setCurso("ENGENHARIA DE COMPUTAÇÃO"); setTipoCurso("GRADUAÇÃO"); setPeriodo("INTEGRAL");
    setMatricula(generateMatricula()); setUf("SP"); setDataValidade("31/12/2026"); setSemestre("6º SEMESTRE");
    toast.success("Campos preenchidos com dados de teste!");
  };
  const clearAll = () => {
    setNomeCompleto(""); setCpf(""); setRg(""); setDataNascimento(""); setInstituicao("");
    setCurso(""); setTipoCurso(""); setPeriodo(""); setMatricula(""); setUf("");
    setDataValidade(""); setSemestre(""); setFotoPreview(null);
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
        {[{ icon: Shield, label: "Documento Seguro", desc: "Validação oficial" },{ icon: Users, label: "Processo Rápido", desc: "Conclua em minutos" },{ icon: Clock, label: "Validade 45 Dias", desc: "Tempo garantido" }].map((f) => (
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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-warning to-destructive flex items-center justify-center mx-auto"><GraduationCap className="w-8 h-8 text-white" /></div>
        <h2 className="text-xl font-display font-bold text-primary">Carteira de Estudante PDF</h2>
        <p className="text-sm text-muted-foreground">Carteirinha de estudante universitária</p>
      </div>

      {!showPreview ? (
        <>
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <UserCircle className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-display font-bold text-foreground">Dados do Estudante</h3>
            </div>
            <div className="space-y-4">
              <div><Label className="text-sm font-semibold text-primary">Nome Completo <span className="text-destructive">*</span></Label><Input placeholder="Ex: PEDRO DA SILVA" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-semibold text-primary">CPF <span className="text-destructive">*</span></Label><Input placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
                <div><Label className="text-sm font-semibold text-primary">RG</Label><Input placeholder="00.000.000-0" value={rg} onChange={(e) => setRg(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-semibold text-primary">Data de Nascimento <span className="text-destructive">*</span></Label><Input placeholder="DD/MM/AAAA" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
                <div>
                  <Label className="text-sm font-semibold text-primary">UF</Label>
                  <Select value={uf} onValueChange={setUf}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="UF" /></SelectTrigger><SelectContent>{UF_OPTIONS.map(u=><SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-foreground">Foto 3x4</Label>
                <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                <div onClick={() => fotoRef.current?.click()} className="mt-1.5 border-2 border-dashed border-border rounded-xl bg-card/50 p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  {fotoPreview ? <img src={fotoPreview} alt="Foto" className="w-32 h-40 object-cover rounded-lg mx-auto" /> : <><ImagePlus className="w-10 h-10 mx-auto text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">Clique para upload</p></>}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <GraduationCap className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-display font-bold text-foreground">Dados Acadêmicos</h3>
            </div>
            <div className="space-y-4">
              <div><Label className="text-sm font-semibold text-primary">Instituição de Ensino <span className="text-destructive">*</span></Label><Input placeholder="Ex: UNIVERSIDADE FEDERAL DO RJ" value={instituicao} onChange={(e) => setInstituicao(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              <div><Label className="text-sm font-semibold text-primary">Curso <span className="text-destructive">*</span></Label><Input placeholder="Ex: CIÊNCIA DA COMPUTAÇÃO" value={curso} onChange={(e) => setCurso(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-primary">Tipo do Curso</Label>
                  <Select value={tipoCurso} onValueChange={setTipoCurso}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{TIPO_CURSO.map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-primary">Período</Label>
                  <Select value={periodo} onValueChange={setPeriodo}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{PERIODO.map(p=><SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-primary">Matrícula</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input placeholder="2024000000" value={matricula} onChange={(e) => setMatricula(e.target.value)} className="bg-secondary/50" />
                    <Button variant="outline" size="sm" className="shrink-0 gap-1 border-primary/50 text-primary" onClick={() => setMatricula(generateMatricula())}><Shuffle className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div><Label className="text-sm font-semibold text-primary">Semestre Atual</Label><Input placeholder="Ex: 5º" value={semestre} onChange={(e) => setSemestre(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              </div>
              <div><Label className="text-sm font-semibold text-primary">Validade da Carteira</Label><Input placeholder="DD/MM/AAAA" value={dataValidade} onChange={(e) => setDataValidade(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
            </div>
          </div>

          <div className="glass-card p-6 bg-muted/30 flex items-center justify-center gap-3">
            <Button size="lg" className="gap-2 bg-gradient-to-r from-warning to-destructive text-white" onClick={handlePreview}><Eye className="w-5 h-5" /> Gerar Preview</Button>
          </div>
        </>
      ) : (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning to-destructive flex items-center justify-center"><Eye className="w-5 h-5 text-white" /></div>
              <h3 className="text-lg font-display font-bold text-foreground">Preview Carteira Estudante</h3>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowPreview(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Editar</Button>
          </div>
          <div className="rounded-2xl border-2 border-warning/30 bg-gradient-to-br from-card via-card to-warning/5 p-6 space-y-5 relative overflow-hidden">
            <div className="text-center space-y-1 border-b border-border pb-4">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-warning">CARTEIRA DE IDENTIFICAÇÃO ESTUDANTIL</p>
              <h3 className="text-lg font-display font-bold text-foreground">{instituicao || "INSTITUIÇÃO"}</h3>
            </div>
            <div className="flex gap-6">
              <div className="shrink-0">
                {fotoPreview ? <img src={fotoPreview} alt="Foto" className="w-28 h-36 object-cover rounded-xl border-2 border-warning/30" /> :
                <div className="w-28 h-36 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30"><UserCircle className="w-12 h-12 text-muted-foreground" /></div>}
              </div>
              <div className="flex-1 space-y-3">
                <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Nome</p><p className="text-sm font-bold text-foreground">{nomeCompleto || "---"}</p></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">CPF</p><p className="text-sm font-mono text-foreground">{cpf || "---"}</p></div>
                  <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">RG</p><p className="text-sm font-mono text-foreground">{rg || "---"}</p></div>
                </div>
                <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Nascimento</p><p className="text-sm text-foreground">{dataNascimento || "---"}</p></div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-border pt-4">
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Curso</p><p className="text-sm font-bold text-foreground">{curso || "---"}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Matrícula</p><p className="text-sm font-mono text-warning">{matricula || "---"}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Semestre</p><p className="text-sm text-foreground">{semestre || "---"}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Período</p><p className="text-sm text-foreground">{periodo || "---"}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Tipo</p><p className="text-sm text-foreground">{tipoCurso || "---"}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Validade</p><p className="text-sm font-bold text-success">{dataValidade || "---"}</p></div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="lg" onClick={() => setShowPreview(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Editar</Button>
            <Button size="lg" className="gap-2 bg-gradient-to-r from-warning to-destructive text-white" onClick={handleConfirm}><CheckCircle2 className="w-5 h-5" /> Confirmar (1 Crédito)</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstudanteForm;

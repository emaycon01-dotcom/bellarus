import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Shield, Users, Clock, Shuffle, Sparkles, Eye, Car, CheckCircle2, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { saveDocumentHistory } from "@/lib/saveDocumentHistory";

const UF_OPTIONS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const COMBUSTIVEL_OPTIONS = ["GASOLINA", "ETANOL", "FLEX", "DIESEL", "GNV", "ELÉTRICO"];
const TIPO_VEICULO = ["AUTOMÓVEL", "MOTOCICLETA", "CAMINHONETE", "CAMINHÃO", "ÔNIBUS", "UTILITÁRIO"];
const generateDigits = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");
const generatePlaca = () => {
  const l = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return `${l[Math.floor(Math.random()*26)]}${l[Math.floor(Math.random()*26)]}${l[Math.floor(Math.random()*26)]}${Math.floor(Math.random()*10)}${l[Math.floor(Math.random()*26)]}${generateDigits(2)}`;
};
const generateRenavam = () => generateDigits(11);

const CrlveForm = () => {
  const navigate = useNavigate();
  const [placa, setPlaca] = useState("");
  const [renavam, setRenavam] = useState("");
  const [chassi, setChassi] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anoFab, setAnoFab] = useState("");
  const [anoMod, setAnoMod] = useState("");
  const [cor, setCor] = useState("");
  const [combustivel, setCombustivel] = useState("");
  const [tipoVeiculo, setTipoVeiculo] = useState("");
  const [uf, setUf] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [nomeProprietario, setNomeProprietario] = useState("");
  const [cpfProprietario, setCpfProprietario] = useState("");
  const [dataEmissao, setDataEmissao] = useState("");
  const [exercicio, setExercicio] = useState("2024");
  const [showPreview, setShowPreview] = useState(false);

  const fillTest = () => {
    setPlaca(generatePlaca()); setRenavam(generateRenavam()); setChassi(`9BW${generateDigits(14)}`);
    setMarca("VOLKSWAGEN"); setModelo("GOL 1.0"); setAnoFab("2022"); setAnoMod("2023"); setCor("PRATA");
    setCombustivel("FLEX"); setTipoVeiculo("AUTOMÓVEL"); setUf("SP"); setMunicipio("SÃO PAULO");
    setNomeProprietario("ROBERTO CARLOS SILVA"); setCpfProprietario("789.012.345-67");
    setDataEmissao("10/01/2024"); setExercicio("2024");
    toast.success("Campos preenchidos com dados de teste!");
  };
  const clearAll = () => {
    setPlaca(""); setRenavam(""); setChassi(""); setMarca(""); setModelo(""); setAnoFab(""); setAnoMod("");
    setCor(""); setCombustivel(""); setTipoVeiculo(""); setUf(""); setMunicipio(""); setNomeProprietario("");
    setCpfProprietario(""); setDataEmissao(""); setExercicio("2024");
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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-ring flex items-center justify-center mx-auto"><Car className="w-8 h-8 text-white" /></div>
        <h2 className="text-xl font-display font-bold text-primary">Criar CRLV-e Digital</h2>
        <p className="text-sm text-muted-foreground">Certificado de Registro e Licenciamento de Veículo</p>
      </div>

      {!showPreview ? (
        <>
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Car className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-display font-bold text-foreground">Dados do Veículo</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-primary">Placa <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input placeholder="ABC1D23" value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())} className="bg-secondary/50" />
                    <Button variant="outline" size="sm" className="shrink-0 gap-1 border-primary/50 text-primary" onClick={() => setPlaca(generatePlaca())}><Shuffle className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-primary">RENAVAM <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input placeholder="00000000000" value={renavam} onChange={(e) => setRenavam(e.target.value.replace(/\D/g,"").slice(0,11))} className="bg-secondary/50" />
                    <Button variant="outline" size="sm" className="shrink-0 gap-1 border-primary/50 text-primary" onClick={() => setRenavam(generateRenavam())}><Shuffle className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-primary">Chassi <span className="text-destructive">*</span></Label>
                <div className="flex gap-2 mt-1.5">
                  <Input placeholder="9BWZZZ377VT004251" value={chassi} onChange={(e) => setChassi(e.target.value.toUpperCase())} className="bg-secondary/50" />
                  <Button variant="outline" size="sm" className="shrink-0 gap-1 border-primary/50 text-primary" onClick={() => setChassi(`9BW${generateDigits(14)}`)}><Shuffle className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-semibold text-primary">Marca <span className="text-destructive">*</span></Label><Input placeholder="Ex: VOLKSWAGEN" value={marca} onChange={(e) => setMarca(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
                <div><Label className="text-sm font-semibold text-primary">Modelo <span className="text-destructive">*</span></Label><Input placeholder="Ex: GOL 1.0" value={modelo} onChange={(e) => setModelo(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label className="text-sm font-semibold text-primary">Ano Fab.</Label><Input placeholder="2023" value={anoFab} onChange={(e) => setAnoFab(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
                <div><Label className="text-sm font-semibold text-primary">Ano Mod.</Label><Input placeholder="2024" value={anoMod} onChange={(e) => setAnoMod(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
                <div><Label className="text-sm font-semibold text-primary">Cor</Label><Input placeholder="PRATA" value={cor} onChange={(e) => setCor(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-primary">Combustível</Label>
                  <Select value={combustivel} onValueChange={setCombustivel}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{COMBUSTIVEL_OPTIONS.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-primary">Tipo</Label>
                  <Select value={tipoVeiculo} onValueChange={setTipoVeiculo}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{TIPO_VEICULO.map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-display font-bold text-foreground">Dados do Proprietário</h3>
            </div>
            <div className="space-y-4">
              <div><Label className="text-sm font-semibold text-primary">Nome do Proprietário <span className="text-destructive">*</span></Label><Input placeholder="Ex: PEDRO DA SILVA" value={nomeProprietario} onChange={(e) => setNomeProprietario(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              <div><Label className="text-sm font-semibold text-primary">CPF do Proprietário <span className="text-destructive">*</span></Label><Input placeholder="000.000.000-00" value={cpfProprietario} onChange={(e) => setCpfProprietario(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-primary">UF <span className="text-destructive">*</span></Label>
                  <Select value={uf} onValueChange={setUf}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="UF" /></SelectTrigger><SelectContent>{UF_OPTIONS.map(u=><SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select>
                </div>
                <div><Label className="text-sm font-semibold text-primary">Município</Label><Input placeholder="Ex: SÃO PAULO" value={municipio} onChange={(e) => setMunicipio(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-semibold text-primary">Data Emissão</Label><Input placeholder="DD/MM/AAAA" value={dataEmissao} onChange={(e) => setDataEmissao(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
                <div><Label className="text-sm font-semibold text-primary">Exercício</Label><Input placeholder="2024" value={exercicio} onChange={(e) => setExercicio(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-ring text-white" onClick={handlePreview}><Eye className="w-5 h-5" /> Gerar Preview</Button>
          </div>
        </>
      ) : (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-ring flex items-center justify-center"><Eye className="w-5 h-5 text-white" /></div>
              <h3 className="text-lg font-display font-bold text-foreground">Preview CRLV-e</h3>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowPreview(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Editar</Button>
          </div>
          <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-6 space-y-5 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none"><Car className="w-64 h-64" /></div>
            <div className="text-center space-y-1 border-b border-border pb-4 relative">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">REPÚBLICA FEDERATIVA DO BRASIL</p>
              <h3 className="text-lg font-display font-bold text-foreground">CRLV-e - CERTIFICADO DE REGISTRO E LICENCIAMENTO</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 relative">
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Placa</p><p className="text-sm font-mono font-bold text-primary">{placa || "---"}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">RENAVAM</p><p className="text-sm font-mono text-foreground">{renavam || "---"}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Chassi</p><p className="text-sm font-mono text-foreground text-xs">{chassi || "---"}</p></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-border pt-4 relative">
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Marca/Modelo</p><p className="text-sm font-bold text-foreground">{marca} {modelo || "---"}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ano</p><p className="text-sm text-foreground">{anoFab}/{anoMod || "---"}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Cor</p><p className="text-sm text-foreground">{cor || "---"}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 relative">
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Combustível</p><p className="text-sm text-foreground">{combustivel || "---"}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Tipo</p><p className="text-sm text-foreground">{tipoVeiculo || "---"}</p></div>
            </div>
            <div className="border-t border-border pt-4 space-y-3 relative">
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Proprietário</p><p className="text-sm font-bold text-foreground">{nomeProprietario || "---"}</p></div>
              <div className="grid grid-cols-3 gap-4">
                <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">CPF</p><p className="text-sm font-mono text-foreground">{cpfProprietario || "---"}</p></div>
                <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Município/UF</p><p className="text-sm text-foreground">{municipio}/{uf || "---"}</p></div>
                <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Exercício</p><p className="text-sm font-bold text-success">{exercicio || "---"}</p></div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="lg" onClick={() => setShowPreview(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Editar</Button>
            <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-ring text-white" onClick={handleConfirm}><CheckCircle2 className="w-5 h-5" /> Confirmar (1 Crédito)</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrlveForm;

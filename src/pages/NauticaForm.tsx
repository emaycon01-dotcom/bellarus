import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Shield,
  Users,
  Clock,
  CreditCard,
  Shuffle,
  ImagePlus,
  CheckCircle2,
  Sparkles,
  Eye,
  UserCircle,
  FileText,
  Ship,
  Anchor,
  Contact,
  Trash2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { saveDocumentHistory } from "@/lib/saveDocumentHistory";

const UF_OPTIONS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const UF_EXTENSO: Record<string, string> = {
  AC:"ACRE",AL:"ALAGOAS",AP:"AMAPÁ",AM:"AMAZONAS",BA:"BAHIA",CE:"CEARÁ",
  DF:"DISTRITO FEDERAL",ES:"ESPÍRITO SANTO",GO:"GOIÁS",MA:"MARANHÃO",
  MT:"MATO GROSSO",MS:"MATO GROSSO DO SUL",MG:"MINAS GERAIS",PA:"PARÁ",
  PB:"PARAÍBA",PR:"PARANÁ",PE:"PERNAMBUCO",PI:"PIAUÍ",RJ:"RIO DE JANEIRO",
  RN:"RIO GRANDE DO NORTE",RS:"RIO GRANDE DO SUL",RO:"RONDÔNIA",RR:"RORAIMA",
  SC:"SANTA CATARINA",SP:"SÃO PAULO",SE:"SERGIPE",TO:"TOCANTINS",
};

const CATEGORIA_NAUTICA = ["Arrais-Amador", "Mestre-Amador", "Capitão-Amador", "Motonauta", "Veleiro"];
const GENERO_OPTIONS = ["Masculino", "Feminino"];
const NACIONALIDADE_OPTIONS = ["BRASILEIRA", "ESTRANGEIRA"];

const generateDigits = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");
const generateRegistro = () => `${generateDigits(4)}-${generateDigits(6)}`;
const generateProtocolo = () => `${generateDigits(6)}.${generateDigits(6)}/${generateDigits(4)}-${generateDigits(2)}`;

const formatCPF = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

const NauticaForm = () => {
  const navigate = useNavigate();
  const fotoRef = useRef<HTMLInputElement>(null);
  const assinaturaRef = useRef<HTMLInputElement>(null);

  // Dados pessoais
  const [cpf, setCpf] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [uf, setUf] = useState("");
  const [genero, setGenero] = useState("");
  const [nacionalidade, setNacionalidade] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [naturalidade, setNaturalidade] = useState("");
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [assinaturaPreview, setAssinaturaPreview] = useState<string | null>(null);

  // Dados da habilitação
  const [registro, setRegistro] = useState("");
  const [categoria, setCategoria] = useState("");
  const [dataEmissao, setDataEmissao] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [protocolo, setProtocolo] = useState("");
  const [capitania, setCapitania] = useState("");
  const [estadoExtenso, setEstadoExtenso] = useState("");

  // Dados complementares
  const [nomePai, setNomePai] = useState("");
  const [nomeMae, setNomeMae] = useState("");
  const [rg, setRg] = useState("");

  // Preview mode
  const [showPreview, setShowPreview] = useState(false);

  const fillTest = () => {
    setCpf("901.234.567-89"); setNomeCompleto("RICARDO MENDES COSTA"); setUf("RJ"); setGenero("Masculino");
    setNacionalidade("BRASILEIRA"); setDataNascimento("20/11/1985"); setNaturalidade("RIO DE JANEIRO");
    setRegistro(generateRegistro()); setCategoria("Arrais-Amador");
    setDataEmissao("15/01/2024"); setDataValidade("15/01/2029");
    setProtocolo(generateProtocolo()); setCapitania("CAPITANIA DOS PORTOS DO RIO DE JANEIRO");
    setEstadoExtenso("RIO DE JANEIRO"); setNomePai("MARCOS MENDES COSTA");
    setNomeMae("REGINA MENDES COSTA"); setRg(`${generateDigits(7)} SSP RJ`);
    toast.success("Campos preenchidos com dados de teste!");
  };
  const clearAll = () => {
    setCpf(""); setNomeCompleto(""); setUf(""); setGenero(""); setNacionalidade(""); setDataNascimento("");
    setNaturalidade(""); setFotoPreview(null); setAssinaturaPreview(null); setRegistro(""); setCategoria("");
    setDataEmissao(""); setDataValidade(""); setProtocolo(""); setCapitania(""); setEstadoExtenso("");
    setNomePai(""); setNomeMae(""); setRg("");
    toast.success("Campos limpos!");
  };

  const handleUfChange = (val: string) => {
    setUf(val);
    setEstadoExtenso(UF_EXTENSO[val] || "");
  };

  const handleDataEmissaoChange = (val: string) => {
    setDataEmissao(val);
    if (val.length === 10) {
      const parts = val.split("/");
      if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const year = parseInt(parts[2]);
        if (!isNaN(year)) {
          setDataValidade(`${day}/${month}/${year + 5}`);
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "foto" | "assinatura") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (type === "foto") setFotoPreview(result);
      else setAssinaturaPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handlePreview = () => {
    setShowPreview(true);
    toast.success("Preview gerado com sucesso!");
  };

  const saldo = 5;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/dashboard/documents")} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 border-accent/50 text-accent text-xs h-8 px-3" onClick={fillTest}><Zap className="w-3.5 h-3.5" /> Teste</Button>
          <Button variant="outline" size="sm" className="gap-1.5 border-destructive/50 text-destructive text-xs h-8 px-3" onClick={clearAll}><Trash2 className="w-3.5 h-3.5" /> Excluir</Button>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary/20 text-primary"><Sparkles className="w-3 h-3" /> 0.75 crédito</span>
        </div>
      </div>

      {/* Feature badges */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Shield, label: "Documento Seguro", desc: "Validação oficial" },
          { icon: Users, label: "Processo Rápido", desc: "Conclua em minutos" },
          { icon: Clock, label: "Validade 45 Dias", desc: "Tempo de uso garantido" },
        ].map((f) => (
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

      {/* Stepper */}
      <div className="flex items-center justify-center gap-4 py-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${!showPreview ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>1</div>
          <span className={`text-sm font-medium ${!showPreview ? "text-primary" : "text-muted-foreground"}`}>Preencher Dados</span>
        </div>
        <div className="w-16 h-px bg-border" />
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${showPreview ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</div>
          <span className={`text-sm font-medium ${showPreview ? "text-primary" : "text-muted-foreground"}`}>Visualizar</span>
        </div>
      </div>

      {/* Main card */}
      <div className="glass-card p-8 text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center mx-auto">
          <Ship className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-display font-bold text-primary">Criar Náutica PDF</h2>
        <p className="text-sm text-muted-foreground">
          Preencha os dados abaixo para gerar sua Carteira de Habilitação Amadora (CHA)
        </p>
      </div>

      {!showPreview ? (
        <>
          {/* CPF Section */}
          <div className="glass-card p-6 space-y-4">
            <div className="glass-card p-5 space-y-3 bg-secondary/30">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Contact className="w-5 h-5 text-primary" />
              </div>
              <div>
                <Label className="text-sm font-semibold text-primary">CPF <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  className="mt-1.5 bg-secondary/50"
                  maxLength={14}
                />
              </div>
            </div>
          </div>

          {/* Section 1 - Dados Pessoais */}
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <UserCircle className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-display font-bold text-foreground">Dados Pessoais</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-primary">Nome Completo <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="Ex: PEDRO DA SILVA GOMES"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value.toUpperCase())}
                  className="mt-1.5 bg-secondary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-primary">UF <span className="text-destructive">*</span></Label>
                  <Select value={uf} onValueChange={handleUfChange}>
                    <SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {UF_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-primary">Gênero <span className="text-destructive">*</span></Label>
                  <Select value={genero} onValueChange={setGenero}>
                    <SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {GENERO_OPTIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-primary">Nacionalidade <span className="text-destructive">*</span></Label>
                <Select value={nacionalidade} onValueChange={setNacionalidade}>
                  <SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {NACIONALIDADE_OPTIONS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold text-primary">Data de Nascimento <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="DD/MM/AAAA"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="mt-1.5 bg-secondary/50"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-primary">Naturalidade <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="Ex: RIO DE JANEIRO, RJ"
                  value={naturalidade}
                  onChange={(e) => setNaturalidade(e.target.value.toUpperCase())}
                  className="mt-1.5 bg-secondary/50"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <Label className="text-sm font-semibold text-foreground">Foto de Perfil</Label>
                <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "foto")} />
                <div
                  onClick={() => fotoRef.current?.click()}
                  className="mt-1.5 border-2 border-dashed border-border rounded-xl bg-card/50 p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="Foto" className="w-32 h-40 object-cover rounded-lg mx-auto" />
                  ) : (
                    <>
                      <ImagePlus className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Clique para fazer upload</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, JPEG até 10MB</p>
                    </>
                  )}
                </div>
              </div>

              {/* Signature Upload */}
              <div>
                <Label className="text-sm font-semibold text-foreground">Assinatura Digital</Label>
                <input ref={assinaturaRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "assinatura")} />
                <div
                  onClick={() => assinaturaRef.current?.click()}
                  className="mt-1.5 border-2 border-dashed border-border rounded-xl bg-card/50 p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  {assinaturaPreview ? (
                    <img src={assinaturaPreview} alt="Assinatura" className="h-20 object-contain mx-auto" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Clique para fazer upload</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, JPEG até 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 - Dados da Habilitação Náutica */}
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Anchor className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-display font-bold text-foreground">Dados da Habilitação</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-primary">
                  Nº de Registro <span className="text-muted-foreground text-xs">(XXXX-XXXXXX)</span> <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    placeholder="0000-000000"
                    value={registro}
                    onChange={(e) => setRegistro(e.target.value)}
                    className="bg-secondary/50"
                  />
                  <Button variant="outline" size="sm" className="shrink-0 gap-1.5 border-primary/50 text-primary" onClick={() => setRegistro(generateRegistro())}>
                    <Shuffle className="w-4 h-4" /> Gerar
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-primary">Categoria <span className="text-destructive">*</span></Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIA_NAUTICA.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-primary">Data de Emissão <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="DD/MM/AAAA"
                    value={dataEmissao}
                    onChange={(e) => handleDataEmissaoChange(e.target.value)}
                    className="mt-1.5 bg-secondary/50"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-primary">Data de Validade <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="DD/MM/AAAA"
                    value={dataValidade}
                    onChange={(e) => setDataValidade(e.target.value)}
                    className="mt-1.5 bg-secondary/50"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-primary">
                  Nº do Protocolo <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    placeholder="000000.000000/0000-00"
                    value={protocolo}
                    onChange={(e) => setProtocolo(e.target.value)}
                    className="bg-secondary/50"
                  />
                  <Button variant="outline" size="sm" className="shrink-0 gap-1.5 border-primary/50 text-primary" onClick={() => setProtocolo(generateProtocolo())}>
                    <Shuffle className="w-4 h-4" /> Gerar
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-primary">Capitania / Delegacia <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="Ex: CAPITANIA DOS PORTOS DO RIO DE JANEIRO"
                  value={capitania}
                  onChange={(e) => setCapitania(e.target.value.toUpperCase())}
                  className="mt-1.5 bg-secondary/50"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-primary">Estado por Extenso <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="Ex: RIO DE JANEIRO"
                  value={estadoExtenso}
                  onChange={(e) => setEstadoExtenso(e.target.value.toUpperCase())}
                  className="mt-1.5 bg-secondary/50"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-primary">RG <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="Ex: 12.345.678-9"
                  value={rg}
                  onChange={(e) => setRg(e.target.value)}
                  className="mt-1.5 bg-secondary/50"
                />
              </div>
            </div>
          </div>

          {/* Section 3 - Filiação */}
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-display font-bold text-foreground">Filiação</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-foreground">Nome do Pai</Label>
                <Input
                  placeholder="Ex: PEDRO DA SILVA GOMES"
                  value={nomePai}
                  onChange={(e) => setNomePai(e.target.value.toUpperCase())}
                  className="mt-1.5 bg-secondary/50"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-foreground">Nome da Mãe</Label>
                <Input
                  placeholder="Ex: MARIA DA SILVA GOMES"
                  value={nomeMae}
                  onChange={(e) => setNomeMae(e.target.value.toUpperCase())}
                  className="mt-1.5 bg-secondary/50"
                />
              </div>
            </div>
          </div>

          {/* Preview Button */}
          <div className="glass-card p-6 bg-muted/30 flex items-center justify-center gap-3">
            <Button variant="outline" size="lg" className="gap-2 border-accent/50 text-accent" onClick={fillTest}><Zap className="w-5 h-5" /> Teste</Button>
            <Button size="lg" className="gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600" onClick={handlePreview}><Eye className="w-5 h-5" /> Gerar Preview</Button>
            <Button variant="outline" size="lg" className="gap-2 border-destructive/50 text-destructive" onClick={clearAll}><Trash2 className="w-5 h-5" /> Excluir</Button>
          </div>
        </>
      ) : (
        <>
          {/* PREVIEW SECTION */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-display font-bold text-foreground">Preview do Documento</h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowPreview(false)} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Editar Dados
              </Button>
            </div>

            {/* Document Preview Card */}
            <div className="rounded-2xl border-2 border-cyan-500/30 bg-gradient-to-br from-card via-card to-cyan-950/10 p-6 space-y-6 relative overflow-hidden">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <Ship className="w-64 h-64" />
              </div>

              {/* Header */}
              <div className="text-center space-y-1 border-b border-border pb-4 relative">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">MARINHA DO BRASIL</p>
                <h3 className="text-lg font-display font-bold text-foreground">CARTEIRA DE HABILITAÇÃO AMADORA</h3>
                <p className="text-xs text-muted-foreground">CHA - Carteira de Habilitação para Amadores</p>
              </div>

              {/* Photo + Main Info */}
              <div className="flex gap-6 relative">
                <div className="shrink-0">
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="Foto" className="w-28 h-36 object-cover rounded-xl border-2 border-cyan-500/30" />
                  ) : (
                    <div className="w-28 h-36 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
                      <UserCircle className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Nome Completo</p>
                    <p className="text-sm font-bold text-foreground">{nomeCompleto || "---"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">CPF</p>
                      <p className="text-sm font-mono font-bold text-foreground">{cpf || "---"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">RG</p>
                      <p className="text-sm font-mono font-bold text-foreground">{rg || "---"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Data de Nascimento</p>
                      <p className="text-sm text-foreground">{dataNascimento || "---"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Naturalidade</p>
                      <p className="text-sm text-foreground">{naturalidade || "---"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Habilitação Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-border pt-4 relative">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Nº Registro</p>
                  <p className="text-sm font-mono font-bold text-cyan-400">{registro || "---"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Categoria</p>
                  <p className="text-sm font-bold text-foreground">{categoria || "---"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Protocolo</p>
                  <p className="text-sm font-mono text-foreground">{protocolo || "---"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Emissão</p>
                  <p className="text-sm text-foreground">{dataEmissao || "---"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Validade</p>
                  <p className="text-sm font-bold text-emerald-400">{dataValidade || "---"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">UF</p>
                  <p className="text-sm text-foreground">{estadoExtenso || uf || "---"}</p>
                </div>
              </div>

              {/* Capitania */}
              <div className="border-t border-border pt-4 relative">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Capitania / Delegacia</p>
                <p className="text-sm font-bold text-foreground">{capitania || "---"}</p>
              </div>

              {/* Filiação */}
              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 relative">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pai</p>
                  <p className="text-sm text-foreground">{nomePai || "---"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Mãe</p>
                  <p className="text-sm text-foreground">{nomeMae || "---"}</p>
                </div>
              </div>

              {/* Assinatura */}
              <div className="border-t border-border pt-4 flex items-center justify-between relative">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Assinatura</p>
                  {assinaturaPreview ? (
                    <img src={assinaturaPreview} alt="Assinatura" className="h-12 mt-1 object-contain" />
                  ) : (
                    <div className="w-40 h-12 mt-1 border-b-2 border-dashed border-muted-foreground/30" />
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Nacionalidade</p>
                  <p className="text-sm text-foreground">{nacionalidade || "---"}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="lg" onClick={() => setShowPreview(false)} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar e Editar
              </Button>
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600"
                onClick={() => toast.info("Emissão do documento será implementada em breve.")}
              >
                <Sparkles className="w-5 h-5" />
                Emitir Documento (0.75 CR)
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Important Info */}
      <div className="glass-card p-6 border-primary/30 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h4 className="font-display font-bold text-foreground">Informações Importantes</h4>
        </div>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li>• Certifique-se de que todas as imagens tenham fundo transparente</li>
          <li>• Use imagens em alta qualidade para melhor resultado</li>
          <li>• O documento gerado terá validade de 45 dias</li>
          <li>• A validade é calculada automaticamente (+5 anos)</li>
        </ul>
      </div>
    </div>
  );
};

export default NauticaForm;

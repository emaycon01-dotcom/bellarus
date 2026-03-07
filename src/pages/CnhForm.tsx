import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  Contact,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

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

const GENERO_OPTIONS = ["Masculino", "Feminino"];
const NACIONALIDADE_OPTIONS = ["BRASILEIRA", "ESTRANGEIRA"];
const CATEGORIA_OPTIONS = ["A", "B", "AB", "C", "D", "E", "AC", "AD", "AE"];
const CNH_DEFINITIVA_OPTIONS = ["Sim", "Não"];

const OBSERVACOES = ["EAR", "MOPP", "A", "E", "99", "15", "D", "F"];

const generateDigits = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");
const generateRenach = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return `${letters[Math.floor(Math.random() * 26)]}${letters[Math.floor(Math.random() * 26)]}${generateDigits(9)}`;
};
const generateRG = () => `${generateDigits(7)} SSP ${UF_OPTIONS[Math.floor(Math.random() * UF_OPTIONS.length)]}`;

const formatCPF = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

const CnhForm = () => {
  const navigate = useNavigate();
  const fotoRef = useRef<HTMLInputElement>(null);
  const assinaturaRef = useRef<HTMLInputElement>(null);

  // Section 1
  const [cpf, setCpf] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [uf, setUf] = useState("");
  const [genero, setGenero] = useState("");
  const [nacionalidade, setNacionalidade] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [assinaturaPreview, setAssinaturaPreview] = useState<string | null>(null);

  // Section 2
  const [registro, setRegistro] = useState("");
  const [categoria, setCategoria] = useState("");
  const [cnhDefinitiva, setCnhDefinitiva] = useState("");
  const [dataPrimeiraHab, setDataPrimeiraHab] = useState("");
  const [dataEmissao, setDataEmissao] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [cidadeEstado, setCidadeEstado] = useState("");
  const [estadoExtenso, setEstadoExtenso] = useState("");
  const [rg, setRg] = useState("");
  const [codigoSeguranca, setCodigoSeguranca] = useState("");
  const [renach, setRenach] = useState("");

  // Section 3
  const [espelho, setEspelho] = useState("");
  const [observacoes, setObservacoes] = useState<string[]>([]);
  const [nomePai, setNomePai] = useState("");
  const [nomeMae, setNomeMae] = useState("");

  const handleUfChange = (val: string) => {
    setUf(val);
    setEstadoExtenso(UF_EXTENSO[val] || "");
  };

  const handleDataEmissaoChange = (val: string) => {
    setDataEmissao(val);
    // Auto-calculate validity (+10 years)
    if (val.length === 10) {
      const parts = val.split("/");
      if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const year = parseInt(parts[2]);
        if (!isNaN(year)) {
          setDataValidade(`${day}/${month}/${year + 10}`);
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

  const toggleObs = (obs: string) => {
    setObservacoes((prev) =>
      prev.includes(obs) ? prev.filter((o) => o !== obs) : [...prev, obs]
    );
  };

  const fillTest = () => {
    setCpf("345.678.901-23"); setNomeCompleto("PEDRO HENRIQUE ALMEIDA"); setUf("SP"); setGenero("Masculino");
    setNacionalidade("BRASILEIRA"); setDataNascimento("15/06/1990"); setRegistro(generateDigits(11));
    setCategoria("AB"); setCnhDefinitiva("Sim"); setDataPrimeiraHab("20/03/2010");
    setDataEmissao("10/01/2024"); setDataValidade("10/01/2034"); setCidadeEstado("SÃO PAULO, SP");
    setEstadoExtenso("SÃO PAULO"); setRg(`${generateDigits(7)} SSP SP`); setCodigoSeguranca(generateDigits(11));
    setRenach(generateRenach()); setEspelho(generateDigits(10)); setNomePai("CARLOS ALMEIDA SILVA");
    setNomeMae("ANA PAULA ALMEIDA");
    toast.success("Campos preenchidos com dados de teste!");
  };
  const clearAll = () => {
    setCpf(""); setNomeCompleto(""); setUf(""); setGenero(""); setNacionalidade(""); setDataNascimento("");
    setFotoPreview(null); setAssinaturaPreview(null); setRegistro(""); setCategoria(""); setCnhDefinitiva("");
    setDataPrimeiraHab(""); setDataEmissao(""); setDataValidade(""); setCidadeEstado(""); setEstadoExtenso("");
    setRg(""); setCodigoSeguranca(""); setRenach(""); setEspelho(""); setObservacoes([]); setNomePai(""); setNomeMae("");
    toast.success("Campos limpos!");
  };
  const handlePreview = () => {
    toast.info("Preview do documento será exibido em breve.");
  };

  const saldo = 5;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/documents")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </Button>
        <div className="text-right">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="w-4 h-4" />
            Saldo: {saldo} créditos
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary/20 text-primary mt-1">
            <Sparkles className="w-3 h-3" />
            Usa 1 crédito
          </span>
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
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">1</div>
          <span className="text-sm font-medium text-primary">Preencher Dados</span>
        </div>
        <div className="w-16 h-px bg-border" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">2</div>
          <span className="text-sm text-muted-foreground">Visualizar</span>
        </div>
      </div>

      {/* Main card */}
      <div className="glass-card p-8 text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl navy-gradient flex items-center justify-center mx-auto">
          <Contact className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-display font-bold text-primary">Criar CNH Digital</h2>
        <p className="text-sm text-muted-foreground">
          Preencha os dados abaixo para gerar sua Carteira Nacional de Habilitação digital
        </p>
      </div>

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

      {/* Section 1 */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <UserCircle className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-display font-bold text-foreground">Seção 1</h3>
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
            <Label className="text-sm font-semibold text-primary">Data de Nascimento / Local <span className="text-destructive">*</span></Label>
            <Input
              placeholder="EX: 12/02/2000, RIO DE JANEIRO, RJ"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value.toUpperCase())}
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

      {/* Section 2 */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-display font-bold text-foreground">Seção 2</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold text-primary">
              REGISTRO DA CNH <span className="text-muted-foreground text-xs">(11 DÍGITOS)</span> <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                placeholder="00397731618"
                value={registro}
                onChange={(e) => setRegistro(e.target.value.replace(/\D/g, "").slice(0, 11))}
                className="bg-secondary/50"
              />
              <Button variant="outline" size="sm" className="shrink-0 gap-1.5 border-primary/50 text-primary" onClick={() => setRegistro(generateDigits(11))}>
                <Shuffle className="w-4 h-4" /> Gerar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-primary">Categoria da CNH <span className="text-destructive">*</span></Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIA_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold text-primary">CNH Definitiva? <span className="text-destructive">*</span></Label>
              <Select value={cnhDefinitiva} onValueChange={setCnhDefinitiva}>
                <SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {CNH_DEFINITIVA_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold text-primary">Data de 1ª Habilitação <span className="text-destructive">*</span></Label>
            <Input
              placeholder="DD/MM/AAAA"
              value={dataPrimeiraHab}
              onChange={(e) => setDataPrimeiraHab(e.target.value)}
              className="mt-1.5 bg-secondary/50"
            />
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
              Cidade / Estado da CNH <span className="text-destructive">*</span>{" "}
              <span className="text-primary cursor-pointer text-xs">Onde fica?</span>
            </Label>
            <Input
              placeholder="RIO DE JANEIRO, RJ"
              value={cidadeEstado}
              onChange={(e) => setCidadeEstado(e.target.value.toUpperCase())}
              className="mt-1.5 bg-secondary/50"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold text-primary">
              Estado por Extenso <span className="text-destructive">*</span>{" "}
              <span className="text-primary cursor-pointer text-xs">Onde fica?</span>
            </Label>
            <Input
              placeholder="Ex: MINAS GERAIS"
              value={estadoExtenso}
              onChange={(e) => setEstadoExtenso(e.target.value.toUpperCase())}
              className="mt-1.5 bg-secondary/50"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold text-primary">
              RG <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                placeholder="Ex: 3674826 SSP AL"
                value={rg}
                onChange={(e) => setRg(e.target.value.toUpperCase())}
                className="bg-secondary/50"
              />
              <Button variant="outline" size="sm" className="shrink-0 gap-1.5 border-success text-success" onClick={() => setRg(generateRG())}>
                <Shuffle className="w-4 h-4" /> Gerar
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold text-primary">
              CÓDIGO DE SEGURANÇA <span className="text-destructive">*</span>{" "}
              <span className="text-primary cursor-pointer text-xs">Onde fica?</span>
            </Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                placeholder="Ex: 96972197651"
                value={codigoSeguranca}
                onChange={(e) => setCodigoSeguranca(e.target.value.replace(/\D/g, "").slice(0, 11))}
                className="bg-secondary/50"
              />
              <Button variant="outline" size="sm" className="shrink-0 gap-1.5 border-primary/50 text-primary" onClick={() => setCodigoSeguranca(generateDigits(11))}>
                <Shuffle className="w-4 h-4" /> Gerar
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold text-primary">
              RENACH <span className="text-destructive">*</span>{" "}
              <span className="text-primary cursor-pointer text-xs">Onde fica?</span>
            </Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                placeholder="Ex: SC975697214"
                value={renach}
                onChange={(e) => setRenach(e.target.value.toUpperCase())}
                className="bg-secondary/50"
              />
              <Button variant="outline" size="sm" className="shrink-0 gap-1.5 border-primary/50 text-primary" onClick={() => setRenach(generateRenach())}>
                <Shuffle className="w-4 h-4" /> Gerar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3 */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Contact className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-display font-bold text-foreground">Seção 3</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold text-primary">
              Nº do espelho da CNH <span className="text-destructive">*</span>{" "}
              <span className="text-primary cursor-pointer text-xs">Onde fica?</span>
            </Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                placeholder="32131277"
                value={espelho}
                onChange={(e) => setEspelho(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="bg-secondary/50"
              />
              <Button variant="outline" size="sm" className="shrink-0 gap-1.5 border-primary/50 text-primary" onClick={() => setEspelho(generateDigits(10))}>
                <Shuffle className="w-4 h-4" /> Gerar
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold text-foreground">
              Observações{" "}
              <span className="text-primary cursor-pointer text-xs">Onde fica?</span>
            </Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {OBSERVACOES.map((obs) => (
                <div key={obs} className="flex items-center gap-2">
                  <Checkbox
                    id={`obs-${obs}`}
                    checked={observacoes.includes(obs)}
                    onCheckedChange={() => toggleObs(obs)}
                  />
                  <label htmlFor={`obs-${obs}`} className="text-sm text-foreground cursor-pointer">{obs}</label>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              {observacoes.length > 0
                ? observacoes.join(", ")
                : "Selecionadas aparecem aqui automaticamente"}
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold text-foreground">Nome Pai</Label>
            <Input
              placeholder="Ex: PEDRO DA SILVA GOMES"
              value={nomePai}
              onChange={(e) => setNomePai(e.target.value.toUpperCase())}
              className="mt-1.5 bg-secondary/50"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold text-foreground">Nome Mãe</Label>
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
        <Button variant="outline" size="lg" className="gap-2 border-accent/50 text-accent" onClick={fillTest}><Sparkles className="w-5 h-5" /> Teste</Button>
        <Button variant="outline" size="lg" className="gap-2 border-primary/50 text-primary hover:bg-primary/10" onClick={handlePreview}><Eye className="w-5 h-5" /> Gerar Preview</Button>
        <Button variant="outline" size="lg" className="gap-2 border-destructive/50 text-destructive" onClick={clearAll}><Trash2 className="w-5 h-5" /> Excluir</Button>
      </div>

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
          <li>• Mantenha suas credenciais em local seguro</li>
        </ul>
      </div>
    </div>
  );
};

export default CnhForm;

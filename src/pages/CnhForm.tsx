import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Shield, Users, Clock, Shuffle, ImagePlus, CheckCircle2, Sparkles,
  Eye, UserCircle, FileText, Contact, Trash2, Zap,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import cnhTemplate from "@/assets/cnh-template.png";
import jsPDF from "jspdf";

const UF_OPTIONS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
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
const OBSERVACOES = ["EAR", "MOPP", "A", "E", "99", "15", "D", "F"];

const generateDigits = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");
const generateRenach = () => {
  const L = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return `${L[Math.floor(Math.random() * 26)]}${L[Math.floor(Math.random() * 26)]}${generateDigits(9)}`;
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
  const { user } = useAuth();
  const fotoRef = useRef<HTMLInputElement>(null);
  const assinaturaRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [cpf, setCpf] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [uf, setUf] = useState("");
  const [genero, setGenero] = useState("");
  const [nacionalidade, setNacionalidade] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [assinaturaPreview, setAssinaturaPreview] = useState<string | null>(null);
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
  const [espelho, setEspelho] = useState("");
  const [observacoes, setObservacoes] = useState<string[]>([]);
  const [nomePai, setNomePai] = useState("");
  const [nomeMae, setNomeMae] = useState("");

  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const handleUfChange = (val: string) => { setUf(val); setEstadoExtenso(UF_EXTENSO[val] || ""); };
  const handleDataEmissaoChange = (val: string) => {
    setDataEmissao(val);
    if (val.length === 10) {
      const parts = val.split("/");
      if (parts.length === 3) { const y = parseInt(parts[2]); if (!isNaN(y)) setDataValidade(`${parts[0]}/${parts[1]}/${y + 10}`); }
    }
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "foto" | "assinatura") => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Arquivo muito grande. Máximo 10MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { const r = ev.target?.result as string; type === "foto" ? setFotoPreview(r) : setAssinaturaPreview(r); };
    reader.readAsDataURL(file);
  };
  const toggleObs = (obs: string) => setObservacoes(prev => prev.includes(obs) ? prev.filter(o => o !== obs) : [...prev, obs]);

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

  const drawOnTemplate = useCallback((withWatermark: boolean): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        const w = img.width;
        const h = img.height;

        // === CNH CARD AREA (upper-left of page) ===
        // All positions as fractions of image width/height based on the real PDF layout

        // Clear text areas before writing (white rectangles to overwrite template data)
        ctx.fillStyle = "#FFFFFF";
        // Name area
        ctx.fillRect(w * 0.135, h * 0.072, w * 0.27, h * 0.016);
        // 1ª Habilitação area
        ctx.fillRect(w * 0.39, h * 0.072, w * 0.12, h * 0.016);
        // Data nascimento area
        ctx.fillRect(w * 0.195, h * 0.095, w * 0.27, h * 0.016);
        // Data emissão area
        ctx.fillRect(w * 0.195, h * 0.118, w * 0.1, h * 0.016);
        // Validade area
        ctx.fillRect(w * 0.31, h * 0.118, w * 0.1, h * 0.016);
        // Categoria area
        ctx.fillRect(w * 0.435, h * 0.118, w * 0.04, h * 0.02);
        // Doc identidade area
        ctx.fillRect(w * 0.195, h * 0.143, w * 0.27, h * 0.016);
        // CPF area
        ctx.fillRect(w * 0.195, h * 0.166, w * 0.12, h * 0.016);
        // Nº Registro area
        ctx.fillRect(w * 0.34, h * 0.166, w * 0.12, h * 0.016);
        // Cat Hab area
        ctx.fillRect(w * 0.46, h * 0.166, w * 0.04, h * 0.016);
        // Nacionalidade area
        ctx.fillRect(w * 0.195, h * 0.19, w * 0.27, h * 0.016);
        // Filiação Pai area
        ctx.fillRect(w * 0.195, h * 0.215, w * 0.27, h * 0.016);
        // Filiação Mae area
        ctx.fillRect(w * 0.195, h * 0.235, w * 0.27, h * 0.016);
        // Photo area
        ctx.fillRect(w * 0.06, h * 0.1, w * 0.09, h * 0.12);
        // Assinatura area
        ctx.fillRect(w * 0.06, h * 0.22, w * 0.12, h * 0.04);
        // Observações area
        ctx.fillRect(w * 0.08, h * 0.38, w * 0.12, h * 0.015);
        // LOCAL / cidade area
        ctx.fillRect(w * 0.06, h * 0.495, w * 0.15, h * 0.015);
        // Espelho / Renach numbers area
        ctx.fillRect(w * 0.36, h * 0.478, w * 0.12, h * 0.015);
        ctx.fillRect(w * 0.36, h * 0.493, w * 0.12, h * 0.015);
        // Estado extenso area
        ctx.fillRect(w * 0.12, h * 0.52, w * 0.28, h * 0.025);

        // === WRITE FORM DATA ===
        ctx.fillStyle = "#000";

        // 2 e 1 NOME E SOBRENOME
        ctx.font = `bold ${w * 0.012}px Arial`;
        ctx.fillText(nomeCompleto || "", w * 0.135, h * 0.085);

        // 1ª HABILITAÇÃO
        ctx.font = `${w * 0.01}px Arial`;
        ctx.fillText(dataPrimeiraHab || "", w * 0.39, h * 0.085);

        // 3 DATA, LOCAL E UF DE NASCIMENTO
        ctx.font = `bold ${w * 0.01}px Arial`;
        ctx.fillText(dataNascimento || "", w * 0.2, h * 0.108);

        // 4a DATA EMISSÃO
        ctx.fillText(dataEmissao || "", w * 0.2, h * 0.131);

        // 4b VALIDADE
        ctx.fillText(dataValidade || "", w * 0.315, h * 0.131);

        // Categoria (large, bold next to validade)
        ctx.font = `bold ${w * 0.018}px Arial`;
        ctx.fillText(categoria || "", w * 0.44, h * 0.134);

        // 4c DOC IDENTIDADE / ORG EMISSOR / UF
        ctx.font = `bold ${w * 0.01}px Arial`;
        ctx.fillText(rg || "", w * 0.2, h * 0.155);

        // 4d CPF
        ctx.fillText(cpf || "", w * 0.2, h * 0.178);

        // 5 Nº REGISTRO
        ctx.fillText(registro || "", w * 0.345, h * 0.178);

        // 9 CAT HAB
        ctx.fillText(categoria || "", w * 0.465, h * 0.178);

        // NACIONALIDADE
        ctx.font = `bold ${w * 0.01}px Arial`;
        ctx.fillText(nacionalidade === "BRASILEIRA" ? "BRASILEIRO" : "ESTRANGEIRO", w * 0.2, h * 0.202);

        // FILIAÇÃO - PAI
        ctx.fillText(nomePai || "", w * 0.2, h * 0.226);

        // FILIAÇÃO - MÃE
        ctx.fillText(nomeMae || "", w * 0.2, h * 0.246);

        // 12 OBSERVAÇÕES
        ctx.font = `${w * 0.009}px Arial`;
        ctx.fillText(observacoes.join(", "), w * 0.085, h * 0.392);

        // LOCAL (cidade, UF)
        ctx.font = `bold ${w * 0.009}px Arial`;
        ctx.fillText(cidadeEstado || "", w * 0.065, h * 0.505);

        // Espelho number
        ctx.font = `${w * 0.009}px Arial`;
        ctx.fillText(espelho || "", w * 0.365, h * 0.488);

        // Renach
        ctx.fillText(renach || "", w * 0.365, h * 0.503);

        // Código segurança
        ctx.fillText(codigoSeguranca || "", w * 0.365, h * 0.518);

        // ESTADO POR EXTENSO (centered)
        ctx.font = `bold ${w * 0.02}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(estadoExtenso || "", w * 0.25, h * 0.54);
        ctx.textAlign = "left";

        // MRZ lines at bottom
        ctx.font = `${w * 0.012}px "Courier New", monospace`;
        const regClean = (registro || "").replace(/\D/g, "");
        const cpfClean = (cpf || "").replace(/\D/g, "");
        const nascParts = (dataNascimento || "").split(",")[0]?.split("/") || [];
        const nascYYMMDD = nascParts.length >= 3 ? `${nascParts[2]?.slice(-2) || "00"}${nascParts[1] || "00"}${nascParts[0] || "00"}` : "000000";
        const valParts = (dataValidade || "").split("/") || [];
        const valYYMMDD = valParts.length >= 3 ? `${valParts[2]?.slice(-2) || "00"}${valParts[1] || "00"}${valParts[0] || "00"}` : "000000";
        const gChar = genero === "Feminino" ? "F" : "M";
        const nameMRZ = nomeCompleto.replace(/\s+/g, "<").toUpperCase();

        ctx.fillRect(w * 0.1, h * 0.76, w * 0.4, h * 0.05);
        ctx.fillStyle = "#000";
        ctx.fillText(`I<BRA${regClean.padEnd(15, "<")}`, w * 0.105, h * 0.775);
        ctx.fillText(`${nascYYMMDD}${gChar}${valYYMMDD}BRA${"<".repeat(12)}4`, w * 0.105, h * 0.79);
        ctx.fillText(`${nameMRZ}${"<".repeat(Math.max(0, 30 - nameMRZ.length))}`, w * 0.105, h * 0.805);

        // Photo (3x4 area)
        if (fotoPreview) {
          const photoImg = new Image();
          photoImg.onload = () => {
            ctx.drawImage(photoImg, w * 0.062, h * 0.1, w * 0.085, h * 0.115);
            drawSignatureAndFinish();
          };
          photoImg.src = fotoPreview;
        } else {
          drawSignatureAndFinish();
        }

        function drawSignatureAndFinish() {
          if (assinaturaPreview) {
            const sigImg = new Image();
            sigImg.onload = () => {
              ctx.drawImage(sigImg, w * 0.065, h * 0.225, w * 0.11, h * 0.035);
              finish();
            };
            sigImg.src = assinaturaPreview;
          } else {
            finish();
          }
        }

        function finish() {
          if (withWatermark) {
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(-Math.PI / 4);
            ctx.font = `bold ${w * 0.05}px Arial`;
            ctx.fillStyle = "rgba(255, 0, 0, 0.18)";
            ctx.textAlign = "center";
            for (let i = -3; i <= 3; i++) {
              ctx.fillText("BELLARUS NÃO COPIE", 0, i * h * 0.08);
            }
            ctx.restore();
          }
          resolve(canvas.toDataURL("image/png"));
        }
      };
      img.src = cnhTemplate;
    });
  }, [nomeCompleto, cpf, rg, dataNascimento, nomePai, nomeMae, registro, dataValidade, dataPrimeiraHab, categoria, dataEmissao, cidadeEstado, observacoes, estadoExtenso, espelho, renach, codigoSeguranca, fotoPreview, assinaturaPreview, nacionalidade, genero]);

  const handlePreview = async () => {
    const imageData = await drawOnTemplate(true);
    setPreviewImage(imageData);
    setShowPreview(true);
    toast.success("Preview gerado com marca d'água!");
  };

  const handleConfirm = async () => {
    if (!user) { toast.error("Faça login para continuar."); return; }
    setConfirming(true);
    
    const { data: profile } = await supabase.from("profiles").select("credits").eq("id", user.id).single();
    if (!profile || profile.credits < 1) {
      toast.error("Créditos insuficientes! Recarregue sua conta.");
      setConfirming(false);
      return;
    }

    const { error } = await supabase.from("profiles").update({ credits: profile.credits - 1 }).eq("id", user.id);
    if (error) { toast.error("Erro ao debitar crédito."); setConfirming(false); return; }

    const cleanImage = await drawOnTemplate(false);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    pdf.addImage(cleanImage, "PNG", 0, 0, 210, 297);
    pdf.save(`CNH_${nomeCompleto.replace(/\s+/g, "_")}.pdf`);

    toast.success("PDF gerado com sucesso! 1 crédito debitado.");
    setConfirming(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/dashboard/documents")} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 border-accent/50 text-accent text-xs h-8 px-3" onClick={fillTest}><Zap className="w-3.5 h-3.5" /> Teste</Button>
          <Button variant="outline" size="sm" className="gap-1.5 border-destructive/50 text-destructive text-xs h-8 px-3" onClick={clearAll}><Trash2 className="w-3.5 h-3.5" /> Excluir</Button>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary/20 text-primary"><Sparkles className="w-3 h-3" /> 1 Crédito</span>
        </div>
      </div>

      {/* Feature badges */}
      <div className="grid grid-cols-3 gap-3">
        {[{ icon: Shield, label: "Documento Seguro", desc: "Validação oficial" }, { icon: Users, label: "Processo Rápido", desc: "Conclua em minutos" }, { icon: Clock, label: "Validade 45 Dias", desc: "Tempo garantido" }].map((f) => (
          <div key={f.label} className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl navy-gradient flex items-center justify-center shrink-0"><f.icon className="w-5 h-5 text-primary-foreground" /></div>
            <div className="min-w-0"><p className="text-sm font-semibold text-foreground truncate">{f.label}</p><p className="text-xs text-muted-foreground">{f.desc}</p></div>
          </div>
        ))}
      </div>

      {/* Stepper */}
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

      {/* Main card */}
      <div className="glass-card p-8 text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl navy-gradient flex items-center justify-center mx-auto"><Contact className="w-8 h-8 text-primary-foreground" /></div>
        <h2 className="text-xl font-display font-bold text-primary">Criar CNH Digital</h2>
        <p className="text-sm text-muted-foreground">Preencha os dados para gerar sua CNH</p>
      </div>

      {!showPreview ? (
        <>
          {/* Section 1 - Personal Data */}
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4"><UserCircle className="w-5 h-5 text-primary" /><h3 className="text-lg font-display font-bold text-foreground">Dados Pessoais</h3></div>
            <div className="space-y-4">
              <div><Label className="text-sm font-semibold text-primary">CPF <span className="text-destructive">*</span></Label><Input placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} className="mt-1.5 bg-secondary/50" maxLength={14} /></div>
              <div><Label className="text-sm font-semibold text-primary">Nome Completo <span className="text-destructive">*</span></Label><Input placeholder="Ex: PEDRO DA SILVA GOMES" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-semibold text-primary">UF <span className="text-destructive">*</span></Label><Select value={uf} onValueChange={handleUfChange}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{UF_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className="text-sm font-semibold text-primary">Gênero <span className="text-destructive">*</span></Label><Select value={genero} onValueChange={setGenero}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{GENERO_OPTIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div><Label className="text-sm font-semibold text-primary">Nacionalidade <span className="text-destructive">*</span></Label><Select value={nacionalidade} onValueChange={setNacionalidade}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{NACIONALIDADE_OPTIONS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="text-sm font-semibold text-primary">Data de Nascimento / Local <span className="text-destructive">*</span></Label><Input placeholder="EX: 12/02/2000, RIO DE JANEIRO, RJ" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              <div>
                <Label className="text-sm font-semibold text-foreground">Foto 3x4</Label>
                <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "foto")} />
                <div onClick={() => fotoRef.current?.click()} className="mt-1.5 border-2 border-dashed border-border rounded-xl bg-card/50 p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  {fotoPreview ? <img src={fotoPreview} alt="Foto" className="w-32 h-40 object-cover rounded-lg mx-auto" /> : <><ImagePlus className="w-10 h-10 mx-auto text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">Clique para upload</p></>}
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-foreground">Assinatura Digital</Label>
                <input ref={assinaturaRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "assinatura")} />
                <div onClick={() => assinaturaRef.current?.click()} className="mt-1.5 border-2 border-dashed border-border rounded-xl bg-card/50 p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  {assinaturaPreview ? <img src={assinaturaPreview} alt="Assinatura" className="h-20 object-contain mx-auto" /> : <><CheckCircle2 className="w-10 h-10 mx-auto text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">Clique para upload</p></>}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 - Document Data */}
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4"><FileText className="w-5 h-5 text-primary" /><h3 className="text-lg font-display font-bold text-foreground">Dados do Documento</h3></div>
            <div className="space-y-4">
              <div><Label className="text-sm font-semibold text-primary">Registro da CNH (11 dígitos) <span className="text-destructive">*</span></Label>
                <div className="flex gap-2 mt-1.5"><Input placeholder="00397731618" value={registro} onChange={(e) => setRegistro(e.target.value.replace(/\D/g, "").slice(0, 11))} className="bg-secondary/50" /><Button variant="outline" size="sm" className="shrink-0 gap-1.5 border-primary/50 text-primary" onClick={() => setRegistro(generateDigits(11))}><Shuffle className="w-4 h-4" /> Gerar</Button></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-semibold text-primary">Categoria <span className="text-destructive">*</span></Label><Select value={categoria} onValueChange={setCategoria}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{CATEGORIA_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className="text-sm font-semibold text-primary">CNH Definitiva? <span className="text-destructive">*</span></Label><Select value={cnhDefinitiva} onValueChange={setCnhDefinitiva}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{["Sim","Não"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div><Label className="text-sm font-semibold text-primary">1ª Habilitação <span className="text-destructive">*</span></Label><Input placeholder="DD/MM/AAAA" value={dataPrimeiraHab} onChange={(e) => setDataPrimeiraHab(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-semibold text-primary">Data de Emissão <span className="text-destructive">*</span></Label><Input placeholder="DD/MM/AAAA" value={dataEmissao} onChange={(e) => handleDataEmissaoChange(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
                <div><Label className="text-sm font-semibold text-primary">Data de Validade <span className="text-destructive">*</span></Label><Input placeholder="DD/MM/AAAA" value={dataValidade} onChange={(e) => setDataValidade(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              </div>
              <div><Label className="text-sm font-semibold text-primary">Cidade / Estado <span className="text-destructive">*</span></Label><Input placeholder="SÃO PAULO, SP" value={cidadeEstado} onChange={(e) => setCidadeEstado(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              <div><Label className="text-sm font-semibold text-primary">Estado por Extenso <span className="text-destructive">*</span></Label><Input placeholder="Ex: MINAS GERAIS" value={estadoExtenso} onChange={(e) => setEstadoExtenso(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              <div><Label className="text-sm font-semibold text-primary">RG <span className="text-destructive">*</span></Label>
                <div className="flex gap-2 mt-1.5"><Input placeholder="Ex: 3674826 SSP AL" value={rg} onChange={(e) => setRg(e.target.value.toUpperCase())} className="bg-secondary/50" /><Button variant="outline" size="sm" className="shrink-0 gap-1.5 border-success text-success" onClick={() => setRg(generateRG())}><Shuffle className="w-4 h-4" /> Gerar</Button></div>
              </div>
              <div><Label className="text-sm font-semibold text-primary">Código de Segurança <span className="text-destructive">*</span></Label>
                <div className="flex gap-2 mt-1.5"><Input placeholder="96972197651" value={codigoSeguranca} onChange={(e) => setCodigoSeguranca(e.target.value.replace(/\D/g, "").slice(0, 11))} className="bg-secondary/50" /><Button variant="outline" size="sm" className="shrink-0 gap-1.5 border-primary/50 text-primary" onClick={() => setCodigoSeguranca(generateDigits(11))}><Shuffle className="w-4 h-4" /> Gerar</Button></div>
              </div>
              <div><Label className="text-sm font-semibold text-primary">RENACH <span className="text-destructive">*</span></Label>
                <div className="flex gap-2 mt-1.5"><Input placeholder="SC975697214" value={renach} onChange={(e) => setRenach(e.target.value.toUpperCase())} className="bg-secondary/50" /><Button variant="outline" size="sm" className="shrink-0 gap-1.5 border-primary/50 text-primary" onClick={() => setRenach(generateRenach())}><Shuffle className="w-4 h-4" /> Gerar</Button></div>
              </div>
            </div>
          </div>

          {/* Section 3 - Extra */}
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4"><Contact className="w-5 h-5 text-primary" /><h3 className="text-lg font-display font-bold text-foreground">Informações Adicionais</h3></div>
            <div className="space-y-4">
              <div><Label className="text-sm font-semibold text-primary">Nº Espelho <span className="text-destructive">*</span></Label>
                <div className="flex gap-2 mt-1.5"><Input placeholder="32131277" value={espelho} onChange={(e) => setEspelho(e.target.value.replace(/\D/g, "").slice(0, 10))} className="bg-secondary/50" /><Button variant="outline" size="sm" className="shrink-0 gap-1.5 border-primary/50 text-primary" onClick={() => setEspelho(generateDigits(10))}><Shuffle className="w-4 h-4" /> Gerar</Button></div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-foreground">Observações</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {OBSERVACOES.map((obs) => (
                    <div key={obs} className="flex items-center gap-2"><Checkbox id={`obs-${obs}`} checked={observacoes.includes(obs)} onCheckedChange={() => toggleObs(obs)} /><label htmlFor={`obs-${obs}`} className="text-sm text-foreground cursor-pointer">{obs}</label></div>
                  ))}
                </div>
                <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">{observacoes.length > 0 ? observacoes.join(", ") : "Selecionadas aparecem aqui"}</div>
              </div>
              <div><Label className="text-sm font-semibold text-foreground">Nome do Pai</Label><Input placeholder="Ex: PEDRO DA SILVA" value={nomePai} onChange={(e) => setNomePai(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              <div><Label className="text-sm font-semibold text-foreground">Nome da Mãe</Label><Input placeholder="Ex: MARIA DA SILVA" value={nomeMae} onChange={(e) => setNomeMae(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-primary flex items-center justify-center"><Eye className="w-5 h-5 text-white" /></div>
              <h3 className="text-lg font-display font-bold text-foreground">Preview da CNH</h3>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowPreview(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Editar</Button>
          </div>

          {previewImage && (
            <div className="rounded-2xl border-2 border-success/30 overflow-hidden">
              <img src={previewImage} alt="Preview CNH" className="w-full" />
            </div>
          )}

          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="lg" onClick={() => setShowPreview(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Editar</Button>
            <Button size="lg" disabled={confirming} className="gap-2 bg-gradient-to-r from-success to-primary text-white" onClick={handleConfirm}>
              <CheckCircle2 className="w-5 h-5" /> {confirming ? "Processando..." : "Pronto (1 Crédito)"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CnhForm;

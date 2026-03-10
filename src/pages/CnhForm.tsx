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
  const { user, isAdmin } = useAuth();
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

        // ===== CLEAR ALL DATA AREAS WITH WHITE RECTANGLES =====
        ctx.fillStyle = "#e8e8e0"; // Match the CNH card background color

        // Photo area (3x4)
        ctx.fillRect(w * 0.042, h * 0.094, w * 0.1, h * 0.155);
        // Signature area
        ctx.fillRect(w * 0.042, h * 0.257, w * 0.132, h * 0.05);

        // Name field
        ctx.fillRect(w * 0.12, h * 0.078, w * 0.29, h * 0.02);
        // 1ª Habilitação field
        ctx.fillRect(w * 0.42, h * 0.078, w * 0.11, h * 0.02);
        // Data nascimento / local / UF field
        ctx.fillRect(w * 0.19, h * 0.105, w * 0.33, h * 0.02);
        // Data emissão field
        ctx.fillRect(w * 0.19, h * 0.132, w * 0.1, h * 0.02);
        // Validade field
        ctx.fillRect(w * 0.31, h * 0.132, w * 0.1, h * 0.02);
        // ACC / Categoria large area
        ctx.fillRect(w * 0.43, h * 0.122, w * 0.08, h * 0.035);
        // Doc identidade field
        ctx.fillRect(w * 0.19, h * 0.158, w * 0.33, h * 0.02);
        // CPF field
        ctx.fillRect(w * 0.19, h * 0.184, w * 0.12, h * 0.02);
        // Nº Registro field
        ctx.fillRect(w * 0.33, h * 0.184, w * 0.12, h * 0.02);
        // Cat Hab field
        ctx.fillRect(w * 0.465, h * 0.184, w * 0.05, h * 0.02);
        // Nacionalidade field
        ctx.fillRect(w * 0.19, h * 0.21, w * 0.33, h * 0.02);
        // Filiação pai field
        ctx.fillRect(w * 0.19, h * 0.235, w * 0.33, h * 0.02);
        // Filiação mãe field
        ctx.fillRect(w * 0.19, h * 0.258, w * 0.33, h * 0.02);

        // Category table - dates columns (clear all date values in the grid)
        // Left table dates (column 12 left)
        ctx.fillRect(w * 0.20, h * 0.335, w * 0.08, h * 0.012);
        ctx.fillRect(w * 0.20, h * 0.352, w * 0.08, h * 0.012);
        ctx.fillRect(w * 0.20, h * 0.369, w * 0.08, h * 0.012);
        ctx.fillRect(w * 0.20, h * 0.386, w * 0.08, h * 0.012);
        ctx.fillRect(w * 0.20, h * 0.403, w * 0.08, h * 0.012);
        ctx.fillRect(w * 0.20, h * 0.420, w * 0.08, h * 0.012);
        ctx.fillRect(w * 0.20, h * 0.437, w * 0.08, h * 0.012);
        // Right table dates (column 12 right)
        ctx.fillRect(w * 0.41, h * 0.335, w * 0.08, h * 0.012);
        ctx.fillRect(w * 0.41, h * 0.352, w * 0.08, h * 0.012);
        ctx.fillRect(w * 0.41, h * 0.369, w * 0.08, h * 0.012);
        ctx.fillRect(w * 0.41, h * 0.386, w * 0.08, h * 0.012);
        ctx.fillRect(w * 0.41, h * 0.403, w * 0.08, h * 0.012);
        ctx.fillRect(w * 0.41, h * 0.420, w * 0.08, h * 0.012);
        ctx.fillRect(w * 0.41, h * 0.437, w * 0.08, h * 0.012);

        // 12 OBSERVAÇÕES value
        ctx.fillRect(w * 0.065, h * 0.462, w * 0.18, h * 0.015);

        // ASSINADO DIGITALMENTE line
        // Espelho number area
        ctx.fillRect(w * 0.35, h * 0.537, w * 0.14, h * 0.015);
        // Renach number area
        ctx.fillRect(w * 0.35, h * 0.555, w * 0.14, h * 0.015);

        // LOCAL: cidade, UF
        ctx.fillRect(w * 0.065, h * 0.575, w * 0.18, h * 0.02);

        // Estado extenso (BAHIA)
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(w * 0.065, h * 0.595, w * 0.44, h * 0.04);

        // Barcode number on left side (26040051771) - vertical
        ctx.fillStyle = "#e8e8e0";
        ctx.fillRect(w * 0.042, h * 0.12, w * 0.02, h * 0.42);

        // MRZ lines at bottom
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(w * 0.065, h * 0.79, w * 0.42, h * 0.06);

        // ===== WRITE FORM DATA =====
        ctx.fillStyle = "#000";

        // 2 e 1 NOME E SOBRENOME
        ctx.font = `bold ${w * 0.013}px Arial`;
        ctx.fillText(nomeCompleto || "", w * 0.125, h * 0.093);

        // 1ª HABILITAÇÃO
        ctx.font = `${w * 0.011}px Arial`;
        ctx.fillText(dataPrimeiraHab || "", w * 0.425, h * 0.093);

        // 3 DATA, LOCAL E UF DE NASCIMENTO
        ctx.font = `bold ${w * 0.011}px Arial`;
        ctx.fillText(dataNascimento || "", w * 0.195, h * 0.12);

        // 4a DATA EMISSÃO
        ctx.fillText(dataEmissao || "", w * 0.195, h * 0.147);

        // 4b VALIDADE
        ctx.fillText(dataValidade || "", w * 0.315, h * 0.147);

        // ACC / Categoria (large bold)
        ctx.font = `bold ${w * 0.022}px Arial`;
        ctx.fillText(categoria || "", w * 0.445, h * 0.15);

        // 4c DOC IDENTIDADE / ORG EMISSOR / UF
        ctx.font = `bold ${w * 0.011}px Arial`;
        ctx.fillText(rg || "", w * 0.195, h * 0.173);

        // 4d CPF
        ctx.fillText(cpf || "", w * 0.195, h * 0.199);

        // 5 Nº REGISTRO
        ctx.fillText(registro || "", w * 0.335, h * 0.199);

        // 9 CAT HAB
        ctx.fillText(categoria || "", w * 0.47, h * 0.199);

        // NACIONALIDADE
        ctx.fillText(nacionalidade === "BRASILEIRA" ? "BRASILEIRO" : "ESTRANGEIRO", w * 0.195, h * 0.225);

        // FILIAÇÃO - PAI
        ctx.fillText(nomePai || "", w * 0.195, h * 0.25);

        // FILIAÇÃO - MÃE
        ctx.fillText(nomeMae || "", w * 0.195, h * 0.273);

        // 12 OBSERVAÇÕES
        ctx.font = `${w * 0.009}px Arial`;
        ctx.fillText(observacoes.join(", "), w * 0.07, h * 0.473);

        // LOCAL (cidade, UF)
        ctx.font = `bold ${w * 0.01}px Arial`;
        ctx.fillText(cidadeEstado || "", w * 0.07, h * 0.588);

        // Espelho number
        ctx.font = `${w * 0.009}px Arial`;
        ctx.fillText(espelho || "", w * 0.355, h * 0.548);

        // Renach
        ctx.fillText(renach || "", w * 0.355, h * 0.565);

        // Código segurança (vertical barcode number)
        ctx.save();
        ctx.translate(w * 0.056, h * 0.5);
        ctx.rotate(-Math.PI / 2);
        ctx.font = `bold ${w * 0.012}px Arial`;
        ctx.fillText(codigoSeguranca || "", 0, 0);
        ctx.restore();

        // ESTADO POR EXTENSO (centered)
        ctx.font = `bold ${w * 0.025}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(estadoExtenso || "", w * 0.27, h * 0.62);
        ctx.textAlign = "left";

        // MRZ lines at bottom
        ctx.font = `${w * 0.013}px "Courier New", monospace`;
        const regClean = (registro || "").replace(/\D/g, "");
        const cpfClean = (cpf || "").replace(/\D/g, "");
        const nascParts = (dataNascimento || "").split(",")[0]?.split("/") || [];
        const nascYYMMDD = nascParts.length >= 3 ? `${nascParts[2]?.slice(-2) || "00"}${nascParts[1] || "00"}${nascParts[0] || "00"}` : "000000";
        const valParts = (dataValidade || "").split("/") || [];
        const valYYMMDD = valParts.length >= 3 ? `${valParts[2]?.slice(-2) || "00"}${valParts[1] || "00"}${valParts[0] || "00"}` : "000000";
        const gChar = genero === "Feminino" ? "F" : "M";
        const nameMRZ = nomeCompleto.replace(/\s+/g, "<").toUpperCase();

        ctx.fillText(`I<BRA${regClean.padEnd(15, "<")}`, w * 0.1, h * 0.805);
        ctx.fillText(`${nascYYMMDD}${gChar}${valYYMMDD}BRA${"<".repeat(12)}4`, w * 0.1, h * 0.82);
        ctx.fillText(`${nameMRZ}${"<".repeat(Math.max(0, 30 - nameMRZ.length))}`, w * 0.1, h * 0.835);

        // Photo (3x4 area)
        if (fotoPreview) {
          const photoImg = new Image();
          photoImg.onload = () => {
            ctx.drawImage(photoImg, w * 0.046, h * 0.098, w * 0.092, h * 0.148);
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
              ctx.drawImage(sigImg, w * 0.05, h * 0.262, w * 0.12, h * 0.04);
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
    
    if (!isAdmin) {
      const { data: profile } = await supabase.from("profiles").select("credits").eq("id", user.id).single();
      if (!profile || profile.credits < 1) {
        toast.error("Créditos insuficientes! Recarregue sua conta.");
        setConfirming(false);
        return;
      }

      const { error } = await supabase.from("profiles").update({ credits: profile.credits - 1 }).eq("id", user.id);
      if (error) { toast.error("Erro ao debitar crédito."); setConfirming(false); return; }
    }

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
              <div>
                <h3 className="text-lg font-display font-bold text-foreground">Preview da CNH</h3>
                <p className="text-xs text-muted-foreground">Visualização com marca d'água de proteção</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowPreview(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Editar</Button>
          </div>

          {previewImage && (
            <div className="rounded-2xl border-2 border-success/30 overflow-hidden shadow-lg">
              <img src={previewImage} alt="Preview CNH" className="w-full" />
            </div>
          )}

          <div className="glass-card p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span>O PDF final será gerado <strong>sem marca d'água</strong> após o pagamento de 1 crédito.</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="lg" onClick={() => setShowPreview(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Editar Dados</Button>
            <Button size="lg" disabled={confirming} className="gap-2 bg-gradient-to-r from-success to-primary text-white shadow-lg hover:shadow-xl transition-all" onClick={handleConfirm}>
              <FileText className="w-5 h-5" /> {confirming ? "Gerando PDF..." : "Gerar PDF (1 Crédito)"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CnhForm;

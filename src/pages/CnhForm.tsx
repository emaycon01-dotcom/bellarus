import { useState, useRef } from "react";
import { getTestPhoto, getTestSignature } from "@/lib/loadTestImages";
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
import { saveDocumentHistory } from "@/lib/saveDocumentHistory";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "react-qr-code";
import cnhBgImage from "@/assets/cnh-template-official.png";

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

// ── Coordinate map (pixels on 1653×2339 canvas) ─────────────────────
// Calibrated against cnh-template-official.png layout
const F = {
  // ── Foto 3×4 e assinatura (lado esquerdo do cartão) ──
  foto:          { x: 80,  y: 250, w: 198, h: 275 },
  assinatura:    { x: 82,  y: 568, w: 194, h: 48  },

  // ── Dados pessoais (lado direito da foto) ──
  nome:          { x: 302, y: 220, w: 510, h: 28, size: 17 },
  primeiraHab:   { x: 830, y: 220, w: 195, h: 28, size: 15 },
  nascimento:    { x: 302, y: 278, w: 575, h: 24, size: 13 },

  // ── Linha: emissão / validade / ACC ──
  emissao:       { x: 302, y: 330, w: 172, h: 24, size: 13 },
  validade:      { x: 500, y: 330, w: 172, h: 24, size: 13 },
  acc:           { x: 710, y: 330, w: 75,  h: 24, size: 13 },

  // ── Doc identidade ──
  docId:         { x: 302, y: 378, w: 520, h: 24, size: 13 },

  // ── Linha: CPF / Registro / Categoria ──
  cpf:           { x: 302, y: 428, w: 210, h: 24, size: 13 },
  registro:      { x: 538, y: 428, w: 185, h: 24, size: 13 },
  catHab:        { x: 758, y: 428, w: 85,  h: 24, size: 13 },

  // ── Nacionalidade ──
  nacional:      { x: 302, y: 475, w: 380, h: 24, size: 13 },

  // ── Filiação (pai e mãe) ──
  filiacaoPai:   { x: 302, y: 520, w: 520, h: 24, size: 13 },
  filiacaoMae:   { x: 302, y: 548, w: 520, h: 24, size: 13 },

  // ── Seção inferior: Observações ──
  obs:           { x: 142, y: 910, w: 395, h: 115, size: 12 },

  // ── Assinatura digital e departamento ──
  assinado:      { x: 225, y: 1095, w: 430, h: 24, size: 12 },
  depto:         { x: 165, y: 1120, w: 500, h: 22, size: 11 },

  // ── Local / código segurança / renach ──
  local:         { x: 112, y: 1172, w: 330, h: 22, size: 12 },
  codSeg:        { x: 455, y: 1172, w: 330, h: 22, size: 12 },
  renachField:   { x: 455, y: 1198, w: 330, h: 22, size: 12 },

  // ── Nome do estado por extenso ──
  estadoExtenso: { x: 112, y: 1235, w: 480, h: 42, size: 26 },

  // ── Espelho vertical (margem esquerda) ──
  espelhoSup:    { x: 52,  y: 255, w: 22, h: 310, size: 10 },
  espelhoInf:    { x: 52,  y: 620, w: 22, h: 310, size: 10 },

  // ── QR Code (lado direito superior) ──
  qr:            { x: 905, y: 108, w: 500, h: 500 },

  // ── MRZ (rodapé) ──
  mrz:           { x: 78,  y: 1710, w: 1500, h: 140, size: 20 },
} as const;

const TW = 1653;
const TH = 2339;

const CnhForm = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const fotoRef = useRef<HTMLInputElement>(null);
  const assinaturaRef = useRef<HTMLInputElement>(null);

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
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);

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

  const fillTest = async () => {
    setCpf("345.678.901-23"); setNomeCompleto("PEDRO HENRIQUE ALMEIDA"); setUf("SP"); setGenero("Masculino");
    setNacionalidade("BRASILEIRA"); setDataNascimento("15/06/1990, SÃO PAULO, SP"); setRegistro(generateDigits(11));
    setCategoria("AB"); setCnhDefinitiva("Sim"); setDataPrimeiraHab("20/03/2010");
    setDataEmissao("10/01/2024"); setDataValidade("10/01/2034"); setCidadeEstado("SÃO PAULO, SP");
    setEstadoExtenso("SÃO PAULO"); setRg(`${generateDigits(7)} SSP SP`); setCodigoSeguranca(generateDigits(11));
    setRenach(generateRenach()); setEspelho(generateDigits(10)); setNomePai("CARLOS ALMEIDA SILVA");
    setNomeMae("ANA PAULA ALMEIDA");
    const [photo, sig] = await Promise.all([getTestPhoto(), getTestSignature()]);
    if (photo) setFotoPreview(photo);
    if (sig) setAssinaturaPreview(sig);
    toast.success("Campos preenchidos com dados de teste!");
  };
  const clearAll = () => {
    setCpf(""); setNomeCompleto(""); setUf(""); setGenero(""); setNacionalidade(""); setDataNascimento("");
    setFotoPreview(null); setAssinaturaPreview(null); setRegistro(""); setCategoria(""); setCnhDefinitiva("");
    setDataPrimeiraHab(""); setDataEmissao(""); setDataValidade(""); setCidadeEstado(""); setEstadoExtenso("");
    setRg(""); setCodigoSeguranca(""); setRenach(""); setEspelho(""); setObservacoes([]); setNomePai(""); setNomeMae("");
    toast.success("Campos limpos!");
  };

  const getMRZ = () => {
    const regClean = (registro || "").replace(/\D/g, "");
    const nascParts = (dataNascimento || "").split(",")[0]?.split("/") || [];
    const nascYYMMDD = nascParts.length >= 3
      ? `${nascParts[2]?.slice(-2) || "00"}${nascParts[1] || "00"}${nascParts[0] || "00"}`
      : "000000";
    const valParts = (dataValidade || "").split("/") || [];
    const valYYMMDD = valParts.length >= 3
      ? `${valParts[2]?.slice(-2) || "00"}${valParts[1] || "00"}${valParts[0] || "00"}`
      : "000000";
    const gChar = genero === "Feminino" ? "F" : "M";
    const nameMRZ = nomeCompleto.replace(/\s+/g, "<").toUpperCase();
    return {
      line1: `I<BRA${regClean.padEnd(15, "<")}`,
      line2: `${nascYYMMDD}${gChar}${valYYMMDD}BRA${"<".repeat(12)}4`,
      line3: `${nameMRZ}${"<".repeat(Math.max(0, 30 - nameMRZ.length))}`,
    };
  };

  // ══════════════════════════════════════════════════════════════════
  // PDF GENERATION — via backend Edge Function with template
  // ══════════════════════════════════════════════════════════════════
  const buildPayload = (withWatermark: boolean, finalVerificationId?: string | null) => ({
    nome_completo: nomeCompleto,
    cpf,
    data_nascimento: dataNascimento,
    rg,
    data_emissao: dataEmissao,
    data_validade: dataValidade,
    codigo_seguranca: codigoSeguranca,
    renach,
    numero_espelho: espelho,
    data_primeira_hab: dataPrimeiraHab,
    cidade_estado: cidadeEstado,
    estado_extenso: estadoExtenso,
    registro,
    categoria,
    nome_pai: nomePai,
    nome_mae: nomeMae,
    nacionalidade,
    genero,
    observacoes: observacoes.join(", "),
    foto_base64: fotoPreview || "",
    assinatura_base64: assinaturaPreview || "",
    watermark: withWatermark,
    verification_url: finalVerificationId
      ? `${window.location.origin}/verificar/${finalVerificationId}`
      : window.location.origin,
  });

  const callBackendPdf = async (withWatermark: boolean, finalVerificationId?: string | null): Promise<Blob> => {
    const { data, error } = await supabase.functions.invoke("generate-cnh-pdf", {
      body: buildPayload(withWatermark, finalVerificationId),
    });

    if (error) throw error;

    // supabase.functions.invoke returns data as Blob when Content-Type is application/pdf
    if (data instanceof Blob) return data;

    // Fallback: if it came as ArrayBuffer or other
    if (data instanceof ArrayBuffer) return new Blob([data], { type: "application/pdf" });

    throw new Error("Resposta inesperada do servidor");
  };

  // ── Preview ──
  const handlePreview = async () => {
    if (!user) { toast.error("Faça login para continuar."); return; }
    setVerificationId(null);
    setShowPreview(true);
    try {
      const blob = await callBackendPdf(true);
      if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl);
      setPreviewPdfUrl(URL.createObjectURL(blob));
      toast.success("Preview gerado com marca d'água!");
    } catch (err) {
      console.error("Erro ao gerar preview:", err);
      toast.error("Erro ao gerar preview.");
    }
  };

  // ── Confirm & Download ──
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

    let finalVerificationId = verificationId;
    try {
      const docData = {
        cpf, registro, categoria, dataNascimento, dataEmissao, dataValidade,
        cidadeEstado, rg, nacionalidade, nomePai, nomeMae, genero, renach, espelho,
      };
      const { data: inserted, error: vErr } = await supabase
        .from("document_verifications")
        .insert({
          user_id: user.id,
          document_type: "CNH Digital",
          document_name: nomeCompleto || "Sem nome",
          document_data: docData,
          photo_url: fotoPreview,
          status: "valid",
        } as any)
        .select("id")
        .single();
      if (vErr) throw vErr;
      finalVerificationId = inserted.id;
      setVerificationId(inserted.id);
    } catch (err) {
      console.error("Erro ao salvar verificação:", err);
      toast.error("Erro ao gerar verificação do documento.");
      setConfirming(false);
      return;
    }

    try {
      const pdfBytes = await generatePdfBytes(false, finalVerificationId);
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const uid = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      a.download = `CNH_${nomeCompleto.replace(/\s+/g, "_")}_${uid}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      if (user) saveDocumentHistory(user.id, "CNH Digital", nomeCompleto || "Sem nome");
      toast.success(isAdmin ? "PDF gerado com sucesso! (Admin — sem débito)" : "PDF gerado com sucesso! 1 crédito debitado.");
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      toast.error("Erro ao gerar o PDF. Tente novamente.");
    }
    setConfirming(false);
  };

  // ── UI ──
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
        {[{ icon: Shield, label: "Documento Seguro", desc: "Validação oficial" }, { icon: Users, label: "Processo Rápido", desc: "Conclua em minutos" }, { icon: Clock, label: "Validade 45 Dias", desc: "Tempo garantido" }].map((f) => (
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
        <div className="w-16 h-16 rounded-2xl navy-gradient flex items-center justify-center mx-auto"><Contact className="w-8 h-8 text-primary-foreground" /></div>
        <h2 className="text-xl font-display font-bold text-primary">Criar CNH Digital</h2>
        <p className="text-sm text-muted-foreground">Preencha os dados para gerar sua CNH</p>
      </div>

      {!showPreview ? (
        <>
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

          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4"><FileText className="w-5 h-5 text-primary" /><h3 className="text-lg font-display font-bold text-foreground">Dados do Documento</h3></div>
            <div className="space-y-4">
              <div><Label className="text-sm font-semibold text-primary">Registro da CNH (11 dígitos) <span className="text-destructive">*</span></Label>
                <div className="flex gap-2 mt-1.5"><Input placeholder="00397731618" value={registro} onChange={(e) => setRegistro(e.target.value.replace(/\D/g, "").slice(0, 11))} className="bg-secondary/50" /><Button variant="outline" size="sm" className="shrink-0 gap-1.5 border-primary/50 text-primary" onClick={() => setRegistro(generateDigits(11))}><Shuffle className="w-4 h-4" /> Gerar</Button></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-semibold text-primary">Categoria <span className="text-destructive">*</span></Label><Select value={categoria} onValueChange={setCategoria}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{CATEGORIA_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className="text-sm font-semibold text-primary">CNH Definitiva <span className="text-destructive">*</span></Label><Select value={cnhDefinitiva} onValueChange={setCnhDefinitiva}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="Sim">Sim</SelectItem><SelectItem value="Não">Não</SelectItem></SelectContent></Select></div>
              </div>
              <div><Label className="text-sm font-semibold text-primary">1ª Habilitação <span className="text-destructive">*</span></Label><Input placeholder="DD/MM/AAAA" value={dataPrimeiraHab} onChange={(e) => setDataPrimeiraHab(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-semibold text-primary">Data de Emissão <span className="text-destructive">*</span></Label><Input placeholder="DD/MM/AAAA" value={dataEmissao} onChange={(e) => handleDataEmissaoChange(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
                <div><Label className="text-sm font-semibold text-primary">Data de Validade <span className="text-destructive">*</span></Label><Input placeholder="DD/MM/AAAA" value={dataValidade} onChange={(e) => setDataValidade(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              </div>
              <div><Label className="text-sm font-semibold text-primary">Cidade / Estado <span className="text-destructive">*</span></Label><Input placeholder="SÃO PAULO, SP" value={cidadeEstado} onChange={(e) => setCidadeEstado(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              <div><Label className="text-sm font-semibold text-primary">Estado por Extenso <span className="text-destructive">*</span></Label><Input placeholder="Ex: MINAS GERAIS" value={estadoExtenso} onChange={(e) => setEstadoExtenso(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              <div><Label className="text-sm font-semibold text-primary">RG <span className="text-destructive">*</span></Label>
                <div className="flex gap-2 mt-1.5"><Input placeholder="Ex: 3674826 SSP AL" value={rg} onChange={(e) => setRg(e.target.value.toUpperCase())} className="bg-secondary/50" /><Button variant="outline" size="sm" className="shrink-0 gap-1.5 border-accent/50 text-accent" onClick={() => setRg(generateRG())}><Shuffle className="w-4 h-4" /> Gerar</Button></div>
              </div>
              <div><Label className="text-sm font-semibold text-primary">Código de Segurança <span className="text-destructive">*</span></Label>
                <div className="flex gap-2 mt-1.5"><Input placeholder="96972197651" value={codigoSeguranca} onChange={(e) => setCodigoSeguranca(e.target.value.replace(/\D/g, "").slice(0, 11))} className="bg-secondary/50" /><Button variant="outline" size="sm" className="shrink-0 gap-1.5 border-primary/50 text-primary" onClick={() => setCodigoSeguranca(generateDigits(11))}><Shuffle className="w-4 h-4" /> Gerar</Button></div>
              </div>
              <div><Label className="text-sm font-semibold text-primary">RENACH <span className="text-destructive">*</span></Label>
                <div className="flex gap-2 mt-1.5"><Input placeholder="SC975697214" value={renach} onChange={(e) => setRenach(e.target.value.toUpperCase())} className="bg-secondary/50" /><Button variant="outline" size="sm" className="shrink-0 gap-1.5 border-primary/50 text-primary" onClick={() => setRenach(generateRenach())}><Shuffle className="w-4 h-4" /> Gerar</Button></div>
              </div>
            </div>
          </div>

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center"><Eye className="w-5 h-5 text-white" /></div>
              <div>
                <h3 className="text-lg font-display font-bold text-foreground">Preview da CNH</h3>
                <p className="text-xs text-muted-foreground">Visualização com marca d'água de proteção</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setShowPreview(false); if (previewPdfUrl) { URL.revokeObjectURL(previewPdfUrl); setPreviewPdfUrl(null); } }} className="gap-2"><ArrowLeft className="w-4 h-4" /> Editar</Button>
          </div>

          {previewPdfUrl && (
            <div className="rounded-2xl border-2 border-accent/30 overflow-hidden shadow-lg">
              <iframe src={previewPdfUrl} title="Preview CNH" style={{ width: "100%", height: "80vh", border: "none", display: "block" }} />
            </div>
          )}

          <div className="glass-card p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span>O PDF final será gerado <strong>sem marca d'água</strong> após o pagamento de 1 crédito.</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="lg" onClick={() => { setShowPreview(false); if (previewPdfUrl) { URL.revokeObjectURL(previewPdfUrl); setPreviewPdfUrl(null); } }} className="gap-2"><ArrowLeft className="w-4 h-4" /> Editar Dados</Button>
            <Button size="lg" disabled={confirming} className="gap-2 bg-gradient-to-r from-accent to-primary text-white shadow-lg hover:shadow-xl transition-all" onClick={handleConfirm}>
              <FileText className="w-5 h-5" /> {confirming ? "Gerando PDF..." : "Gerar PDF (1 Crédito)"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CnhForm;
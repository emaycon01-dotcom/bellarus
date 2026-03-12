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
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "react-qr-code";

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

const catMap: Record<string, string[]> = {
  "A": ["A"], "B": ["B"], "AB": ["A", "B"], "C": ["B", "C"],
  "D": ["B", "C", "D"], "E": ["B", "C", "D", "E"],
  "AC": ["A", "C"], "AD": ["A", "D"], "AE": ["A", "E"],
};

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

  // MRZ generation
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

  const activeCats = catMap[categoria] || [];
  const leftCats = ["ACC", "A", "A1", "B", "B1", "C", "C1"];
  const rightCats = ["D", "D1", "BE", "CE", "C1E", "DE", "D1E"];
  const mrz = getMRZ();

  // Template dimensions (fixed)
  const TW = 1653;
  const TH = 2339;
  const EXPORT_DPI = 300;
  const CSS_DPI = 96;
  const RENDER_SCALE = EXPORT_DPI / CSS_DPI;

  // Shared PDF generation function
  const generatePdfBytes = async (withWatermark: boolean, finalVerificationId?: string | null): Promise<Uint8Array> => {
    const templateBytes = await fetch("/templates/cnh-template.pdf").then(r => r.arrayBuffer());
    const pdfDoc = await PDFDocument.load(templateBytes);
    const page = pdfDoc.getPages()[0];
    const { width: pageW, height: pageH } = page.getSize();

    const scaleX = pageW / TW;
    const scaleY = pageH / TH;

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Helper: draw text directly without white rectangle background
    const drawText = (text: string, field: { top: number; left: number; w: number; h: number; fontSize: number }, options?: { color?: { r: number; g: number; b: number }; bold?: boolean }) => {
      const pdfX = field.left * scaleX;
      const pdfY = pageH - (field.top + field.h) * scaleY;
      const pdfW = field.w * scaleX;
      const fontSize = field.fontSize * scaleY * 1.1;

      const color = options?.color ? rgb(options.color.r, options.color.g, options.color.b) : rgb(0, 0, 0);
      const usedFont = options?.bold !== false ? fontBold : font;

      page.drawText(text || "", {
        x: pdfX,
        y: pdfY + 2 * scaleY,
        size: Math.min(fontSize, 14),
        font: usedFont,
        color,
        maxWidth: pdfW,
      });
    };

    // Draw all text fields
    drawText(nomeCompleto, baseF.nome);
    drawText(dataPrimeiraHab, baseF.primeiraHab);
    drawText(dataNascimento, baseF.nascimento);
    drawText(dataEmissao, baseF.emissao);
    drawText(dataValidade, baseF.validade);
    drawText(rg, baseF.docId);
    drawText(cpf, baseF.cpf);
    drawText(registro, baseF.registro, { color: { r: 0.8, g: 0, b: 0 } });
    drawText(categoria, baseF.catHab);
    drawText(nacionalidade === "BRASILEIRA" ? "BRASILEIRO(A)" : "ESTRANGEIRO(A)", baseF.nacional);
    drawText(nomePai, baseF.filiacaoPai);
    drawText(nomeMae, baseF.filiacaoMae);
    drawText(observacoes.join(", "), baseF.obs);
    drawText(cidadeEstado, baseF.local);
    drawText(codigoSeguranca, baseF.codSeg);
    drawText(renach, baseF.renachField);
    drawText(estadoExtenso, baseF.estadoExtenso, { bold: true });

    // Embed photo
    if (fotoPreview) {
      try {
        const photoBytes = await fetch(fotoPreview).then(r => r.arrayBuffer());
        const photoImage = fotoPreview.includes("image/png")
          ? await pdfDoc.embedPng(photoBytes)
          : await pdfDoc.embedJpg(photoBytes);
        const f = baseF.foto;
        page.drawImage(photoImage, {
          x: f.left * scaleX,
          y: pageH - (f.top + f.h) * scaleY,
          width: f.w * scaleX,
          height: f.h * scaleY,
        });
      } catch (e) { console.warn("Erro ao embutir foto:", e); }
    }

    // Embed signature (no white rectangle)
    if (assinaturaPreview) {
      try {
        const sigBytes = await fetch(assinaturaPreview).then(r => r.arrayBuffer());
        const sigImage = assinaturaPreview.includes("image/png")
          ? await pdfDoc.embedPng(sigBytes)
          : await pdfDoc.embedJpg(sigBytes);
        const f = baseF.assinatura;
        page.drawImage(sigImage, {
          x: f.left * scaleX,
          y: pageH - (f.top + f.h) * scaleY,
          width: f.w * scaleX,
          height: f.h * scaleY,
        });
      } catch (e) { console.warn("Erro ao embutir assinatura:", e); }
    }

    // Generate QR code
    const verUrl = finalVerificationId
      ? `${window.location.origin}/verificar/${finalVerificationId}`
      : window.location.origin;
    try {
      const qrDiv = document.createElement("div");
      qrDiv.style.position = "fixed";
      qrDiv.style.left = "-9999px";
      document.body.appendChild(qrDiv);
      const { createRoot } = await import("react-dom/client");
      const root = createRoot(qrDiv);
      await new Promise<void>((resolve) => {
        root.render(<QRCode value={verUrl} size={500} level="H" />);
        setTimeout(resolve, 300);
      });
      const qrSvg = qrDiv.querySelector("svg");
      if (qrSvg) {
        const svgData = new XMLSerializer().serializeToString(qrSvg);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.src = svgUrl;
        await new Promise<void>((resolve) => { img.onload = () => resolve(); });
        const c = document.createElement("canvas");
        c.width = 520; c.height = 520;
        const ctx = c.getContext("2d")!;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, 520, 520);
        ctx.drawImage(img, 10, 10, 500, 500);
        URL.revokeObjectURL(svgUrl);
        const qrPng = c.toDataURL("image/png");
        const qrBytes = await fetch(qrPng).then(r => r.arrayBuffer());
        const qrImage = await pdfDoc.embedPng(qrBytes);
        const qf = baseF.qr;
        page.drawImage(qrImage, {
          x: qf.left * scaleX,
          y: pageH - (qf.top + qf.h) * scaleY,
          width: qf.w * scaleX,
          height: qf.h * scaleY,
        });
      }
      root.unmount();
      document.body.removeChild(qrDiv);
    } catch (e) { console.warn("Erro ao embutir QR Code:", e); }

    // Espelho vertical text (no white rectangles)
    if (espelho) {
      const espFontSize = 8;
      const chars = espelho.split("");
      const supField = baseF.espelhoSup;
      const supStartY = pageH - supField.top * scaleY;
      chars.forEach((ch, i) => {
        page.drawText(ch, {
          x: supField.left * scaleX,
          y: supStartY - i * (espFontSize + 2) * scaleY,
          size: espFontSize,
          font: fontBold,
          color: rgb(0, 0, 0),
        });
      });
      const infField = baseF.espelhoInf;
      const infStartY = pageH - infField.top * scaleY;
      chars.forEach((ch, i) => {
        page.drawText(ch, {
          x: infField.left * scaleX,
          y: infStartY - i * (espFontSize + 2) * scaleY,
          size: espFontSize,
          font: fontBold,
          color: rgb(0, 0, 0),
        });
      });
    }

    // Watermark
    if (withWatermark) {
      const watermarkFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      [260, 700, 1140, 1580, 2020].forEach((topPos) => {
        page.drawText("BELLARUS NÃO COPIE", {
          x: 120 * scaleX,
          y: pageH - topPos * scaleY,
          size: 72 * scaleY,
          font: watermarkFont,
          color: rgb(1, 0, 0),
          opacity: 0.15,
        });
      });
    }

    return pdfDoc.save();
  };

  const handlePreview = async () => {
    if (!user) { toast.error("Faça login para continuar."); return; }
    setVerificationId(null);
    setShowPreview(true);
    try {
      const pdfBytes = await generatePdfBytes(true);
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl);
      setPreviewPdfUrl(URL.createObjectURL(blob));
      toast.success("Preview gerado com marca d'água!");
    } catch (err) {
      console.error("Erro ao gerar preview:", err);
      toast.error("Erro ao gerar preview.");
    }
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

    // Create verification record ONLY on paid confirm
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

  /* =========================================================
   * DOCUMENT CONTAINER – 1653×2339 px fixed, all absolute px
   * Positions calibrated to cnh_digital_página_1-2.png template
   * ========================================================= */
  const verificationUrl = verificationId
    ? `${window.location.origin}/verificar/${verificationId}`
    : window.location.origin;

  const baseF = {
    foto:        { top: 285, left: 100, w: 215, h: 285 },
    nome:        { top: 248, left: 345, w: 560, h: 26, fontSize: 19 },
    primeiraHab: { top: 248, left: 960, w: 220, h: 26, fontSize: 19 },
    nascimento:  { top: 310, left: 345, w: 620, h: 24, fontSize: 16 },
    emissao:     { top: 365, left: 340, w: 195, h: 24, fontSize: 16 },
    validade:    { top: 365, left: 575, w: 195, h: 24, fontSize: 16 },
    acc:         { top: 365, left: 815, w: 80, h: 24, fontSize: 16 },
    docId:       { top: 415, left: 340, w: 560, h: 24, fontSize: 16 },
    cpf:         { top: 468, left: 340, w: 235, h: 24, fontSize: 16 },
    registro:    { top: 468, left: 625, w: 200, h: 24, fontSize: 16 },
    catHab:      { top: 468, left: 870, w: 90, h: 24, fontSize: 16 },
    nacional:    { top: 515, left: 340, w: 400, h: 24, fontSize: 16 },
    filiacaoPai: { top: 568, left: 340, w: 560, h: 24, fontSize: 16 },
    filiacaoMae: { top: 600, left: 340, w: 560, h: 24, fontSize: 16 },
    assinatura:  { top: 650, left: 125, w: 280, h: 65 },
    espelhoSup:  { top: 250, left: 58, w: 24, h: 420, fontSize: 12 },
    espelhoInf:  { top: 760, left: 58, w: 24, h: 420, fontSize: 12 },
    obs:         { top: 1085, left: 175, w: 420, h: 100, fontSize: 14 },
    assinado:    { top: 1220, left: 250, w: 440, h: 24, fontSize: 14 },
    depto:       { top: 1248, left: 180, w: 540, h: 22, fontSize: 12 },
    local:       { top: 1315, left: 125, w: 360, h: 22, fontSize: 13 },
    codSeg:      { top: 1315, left: 500, w: 360, h: 22, fontSize: 13 },
    renachField: { top: 1340, left: 500, w: 360, h: 22, fontSize: 13 },
    estadoExtenso: { top: 1360, left: 125, w: 500, h: 40, fontSize: 28 },
    qr:          { top: 140, left: 1020, w: 520, h: 520 },
    serproTxt1:  { top: 1060, left: 850, w: 560, h: 70, fontSize: 13 },
    serproTxt2:  { top: 1150, left: 850, w: 560, h: 70, fontSize: 13 },
    serproLabel: { top: 1280, left: 1100, w: 260, h: 28, fontSize: 22 },
    legenda:     { top: 1440, left: 85, w: 1500, h: 120, fontSize: 10 },
    mrz:         { top: 1560, left: 85, w: 1450, h: 130, fontSize: 22 },
  } as const;

  const F = {
    ...baseF,
    catLeftStart: 795,
    catLeftX: 275,
    catRightStart: 795,
    catRightX: 660,
    catRowH: 38,
    catValidadeW: 155,
    catValidadeH: 20,
  } as const;

  const fixedTextBase = {
    fontFamily: "Arial, Helvetica, sans-serif",
    lineHeight: 1,
    letterSpacing: 0,
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
  };

  const fixedTextStyle = (
    field: { top: number; left: number; w: number; h: number; fontSize: number },
    extra: Record<string, unknown> = {},
  ) => ({
    position: "absolute" as const,
    top: field.top,
    left: field.left,
    width: field.w,
    height: field.h,
    fontSize: field.fontSize,
    ...fixedTextBase,
    ...extra,
  });

  const documentJSX = (
    <div
      ref={documentRef}
      id="cnh-documento"
      style={{
        position: "relative",
        width: TW,
        height: TH,
        overflow: "hidden",
        fontFamily: "Arial, Helvetica, sans-serif",
        backgroundColor: "#fff",
      }}
    >
      {/* TEMPLATE PNG FIXO 1653x2339 (sem background CSS) */}
      <img
        src={cnhTemplateBg}
        alt=""
        aria-hidden="true"
        draggable={false}
        crossOrigin="anonymous"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: TW,
          height: TH,
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 0,
        }}
      />
      {/* FOTO 3x4 */}
      {fotoPreview && (
        <img
          src={fotoPreview}
          alt="Foto"
          crossOrigin="anonymous"
          style={{
            position: "absolute",
            top: F.foto.top,
            left: F.foto.left,
            width: F.foto.w,
            height: F.foto.h,
            objectFit: "cover",
          }}
        />
      )}

      {/* ESPELHO (vertical superior) */}
      <div
        style={fixedTextStyle(F.espelhoSup, {
          fontWeight: "bold",
          color: "#000",
          writingMode: "vertical-rl",
          textOrientation: "upright",
          textAlign: "center",
        })}
      >
        {espelho}
      </div>

      {/* NOME E SOBRENOME */}
      <div style={fixedTextStyle(F.nome, { fontWeight: "bold", color: "#000" })}>
        {nomeCompleto}
      </div>

      {/* 1ª HABILITAÇÃO */}
      <div style={fixedTextStyle(F.primeiraHab, { fontWeight: "bold", color: "#000" })}>
        {dataPrimeiraHab}
      </div>

      {/* DATA/LOCAL NASCIMENTO */}
      <div style={fixedTextStyle(F.nascimento, { fontWeight: "bold", color: "#000" })}>
        {dataNascimento}
      </div>

      {/* DATA EMISSÃO */}
      <div style={fixedTextStyle(F.emissao, { fontWeight: "bold", color: "#000" })}>
        {dataEmissao}
      </div>

      {/* VALIDADE */}
      <div style={fixedTextStyle(F.validade, { fontWeight: "bold", color: "#000" })}>
        {dataValidade}
      </div>

      {/* ACC */}
      <div style={fixedTextStyle(F.acc, { fontWeight: "bold", color: "#000" })}>
        {activeCats.length > 0 ? "ACC" : ""}
      </div>

      {/* DOC IDENTIDADE */}
      <div style={fixedTextStyle(F.docId, { fontWeight: "bold", color: "#000" })}>
        {rg}
      </div>

      {/* CPF */}
      <div style={fixedTextStyle(F.cpf, { fontWeight: "bold", color: "#000" })}>
        {cpf}
      </div>

      {/* Nº REGISTRO (vermelho) */}
      <div style={fixedTextStyle(F.registro, { fontWeight: "bold", color: "#cc0000" })}>
        {registro}
      </div>

      {/* CAT HAB */}
      <div style={fixedTextStyle(F.catHab, { fontWeight: "bold", color: "#000" })}>
        {categoria}
      </div>

      {/* NACIONALIDADE */}
      <div style={fixedTextStyle(F.nacional, { fontWeight: "bold", color: "#000" })}>
        {nacionalidade === "BRASILEIRA" ? "BRASILEIRO(A)" : "ESTRANGEIRO(A)"}
      </div>

      {/* FILIAÇÃO – PAI */}
      <div style={fixedTextStyle(F.filiacaoPai, { fontWeight: "bold", color: "#000" })}>
        {nomePai}
      </div>

      {/* FILIAÇÃO – MÃE */}
      <div style={fixedTextStyle(F.filiacaoMae, { fontWeight: "bold", color: "#000" })}>
        {nomeMae}
      </div>

      {/* ASSINATURA DO PORTADOR */}
      {assinaturaPreview && (
        <img
          src={assinaturaPreview}
          alt="Assinatura"
          crossOrigin="anonymous"
          style={{
            position: "absolute",
            top: F.assinatura.top,
            left: F.assinatura.left,
            width: F.assinatura.w,
            height: F.assinatura.h,
            objectFit: "contain",
          }}
        />
      )}

      {/* CATEGORIAS – lado esquerdo */}
      {leftCats.map((cat, i) => {
        const isActive = cat === "ACC" ? activeCats.length > 0 : activeCats.includes(cat);
        if (!isActive) return null;
        return (
          <div
            key={`left-${cat}`}
            style={fixedTextStyle(
              {
                top: F.catLeftStart + i * F.catRowH,
                left: F.catLeftX,
                w: F.catValidadeW,
                h: F.catValidadeH,
                fontSize: 14,
              },
              { color: "#000", fontWeight: "bold" },
            )}
          >
            {dataValidade}
          </div>
        );
      })}

      {/* CATEGORIAS – lado direito */}
      {rightCats.map((cat, i) => {
        const isActive = activeCats.includes(cat);
        if (!isActive) return null;
        return (
          <div
            key={`right-${cat}`}
            style={fixedTextStyle(
              {
                top: F.catRightStart + i * F.catRowH,
                left: F.catRightX,
                w: F.catValidadeW,
                h: F.catValidadeH,
                fontSize: 14,
              },
              { color: "#000", fontWeight: "bold" },
            )}
          >
            {dataValidade}
          </div>
        );
      })}

      {/* 12 OBSERVAÇÕES */}
      <div style={fixedTextStyle(F.obs, { fontWeight: "bold", color: "#000" })}>
        {observacoes.join(", ")}
      </div>

      {/* ASSINADO DIGITALMENTE */}
      <div
        style={fixedTextStyle(F.assinado, {
          color: "#000",
          textAlign: "center",
          fontWeight: "bold",
        })}
      >
        ASSINADO DIGITALMENTE
      </div>
      <div
        style={fixedTextStyle(F.depto, {
          color: "#000",
          textAlign: "center",
          fontWeight: "bold",
        })}
      >
        DEPARTAMENTO ESTADUAL DE TRÂNSITO
      </div>

      {/* LOCAL */}
      <div style={fixedTextStyle(F.local, { color: "#555" })}>
        {cidadeEstado}
      </div>

      {/* CÓDIGO SEGURANÇA (bottom section) */}
      <div style={fixedTextStyle(F.codSeg, { color: "#555" })}>
        {codigoSeguranca}
      </div>

      {/* RENACH (bottom section) */}
      <div style={fixedTextStyle(F.renachField, { color: "#555" })}>
        {renach}
      </div>

      {/* ESTADO POR EXTENSO */}
      <div style={fixedTextStyle(F.estadoExtenso, { fontWeight: "bold", color: "#000" })}>
        {estadoExtenso}
      </div>

      {/* QR CODE */}
      <div
        id="qrcode"
        style={{
          position: "absolute",
          top: F.qr.top,
          left: F.qr.left,
          width: F.qr.w,
          height: F.qr.h,
        }}
      >
        <QRCode
          value={verificationUrl}
          size={F.qr.w - 10}
          level="H"
          style={{ width: F.qr.w - 10, height: F.qr.h - 10 }}
        />
      </div>

      {/* TEXTO SERPRO */}
      <div style={{
        position: "absolute",
        top: F.serproTxt1.top,
        left: F.serproTxt1.left,
        width: F.serproTxt1.w,
        height: F.serproTxt1.h,
        fontSize: F.serproTxt1.fontSize,
        color: "#333",
        fontFamily: "Arial, Helvetica, sans-serif",
        lineHeight: 1,
        letterSpacing: 0,
        overflow: "hidden",
      }}>
        Documento assinado com certificado digital em conformidade
        com a Medida Provisória nº 2200-2/2001. Sua validade poderá
        ser confirmada por meio do programa Assinador Serpro.
      </div>
      <div style={{
        position: "absolute",
        top: F.serproTxt2.top,
        left: F.serproTxt2.left,
        width: F.serproTxt2.w,
        height: F.serproTxt2.h,
        fontSize: F.serproTxt2.fontSize,
        color: "#333",
        fontFamily: "Arial, Helvetica, sans-serif",
        lineHeight: 1,
        letterSpacing: 0,
        overflow: "hidden",
      }}>
        As orientações para instalar o Assinador Serpro e realizar a
        validação do documento digital estão disponíveis em:
        https://www.serpro.gov.br/assinador-digital.
      </div>

      {/* SERPRO / SENATRAN */}
      <div style={fixedTextStyle(F.serproLabel, { fontWeight: "bold", color: "#000" })}>
        <span>SERPRO</span>
        <span style={{ color: "#666" }}> / </span>
        <span>SENATRAN</span>
      </div>

      {/* ESPELHO (vertical inferior) */}
      <div
        style={fixedTextStyle(F.espelhoInf, {
          fontWeight: "bold",
          color: "#000",
          writingMode: "vertical-rl",
          textOrientation: "upright",
          textAlign: "center",
        })}
      >
        {espelho}
      </div>

      {/* LEGENDA (rodapé) */}
      <div style={{
        position: "absolute",
        top: F.legenda.top,
        left: F.legenda.left,
        width: F.legenda.w,
        height: F.legenda.h,
        fontSize: F.legenda.fontSize,
        color: "#444",
        fontFamily: "Arial, Helvetica, sans-serif",
        lineHeight: 1,
        letterSpacing: 0,
        overflow: "hidden",
      }}>
        {`2 e 1. Nome e Sobrenome / Name and Surname / Nombre y Apellidos - Primera Habilitação / First Driver License / Primera Licencia de Conducir – 3. Data e Local de Nascimento / Date and Place of Birth DD/MM/YYYY / Fecha y Lugar de Nacimiento - 4a. Data de Emissão / Issuing Date DD/MM/YYYY / Fecha de Emisión - 4b. Data de Validade / Expiration Date DD/MM/YYYY / Válida Hasta – ACC – 4c. Documento Identidade - Órgão emissor / Identity Document - Issuing Authority / Documento de Identificación – Autoridad Expedidora – 4d. CPF – 5. Número de registro da CNH / Driver License Number / Número de Permiso de Conducir – 9. Categoria de Veículos da Carteira de Habilitação / Driver license Class / Categoría de Permiso de Conducir – Nacionalidade / Nationality / Nacionalidad – Filiação / Father / Filiación – 12. Observações / Observations / Observaciones – Local / Place / Lugar`}
      </div>

      {/* MRZ LINES */}
      <div style={{
        position: "absolute",
        top: F.mrz.top,
        left: F.mrz.left,
        width: F.mrz.w,
        height: F.mrz.h,
        fontSize: F.mrz.fontSize,
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#222",
        lineHeight: 1,
        letterSpacing: 0,
        overflow: "hidden",
      }}>
        <div>{mrz.line1}</div>
        <div>{mrz.line2}</div>
        <div>{mrz.line3}</div>
      </div>

      {/* WATERMARK OVERLAY */}
      {isWatermark && (
        <div style={{
          position: "absolute", top: 0, left: 0, width: TW, height: TH,
          pointerEvents: "none",
        }}>
          {[260, 700, 1140, 1580, 2020].map((topPos) => (
            <div
              key={topPos}
              style={{
                position: "absolute",
                top: topPos,
                left: 120,
                fontSize: 72,
                fontWeight: "bold",
                color: "rgba(255, 0, 0, 0.15)",
                whiteSpace: "nowrap" as const,
              }}
            >
              BELLARUS NÃO COPIE
            </div>
          ))}
        </div>
      )}
    </div>
  );

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
              <iframe
                src={previewPdfUrl}
                title="Preview CNH"
                style={{ width: "100%", height: "80vh", border: "none", display: "block" }}
              />
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

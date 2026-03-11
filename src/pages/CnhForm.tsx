import { useState, useRef, useCallback } from "react";
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

/* ---- QR Code drawing on canvas (simple text-based pattern) ---- */
function drawQRPlaceholder(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, data: string) {
  const modules = 25;
  const cellSize = size / modules;
  // Generate a deterministic pattern from the data string
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  }
  ctx.fillStyle = "#000";
  // Draw finder patterns (3 corners)
  const drawFinder = (fx: number, fy: number) => {
    ctx.fillRect(fx, fy, cellSize * 7, cellSize * 7);
    ctx.fillStyle = "#fff";
    ctx.fillRect(fx + cellSize, fy + cellSize, cellSize * 5, cellSize * 5);
    ctx.fillStyle = "#000";
    ctx.fillRect(fx + cellSize * 2, fy + cellSize * 2, cellSize * 3, cellSize * 3);
  };
  drawFinder(x, y);
  drawFinder(x + (modules - 7) * cellSize, y);
  drawFinder(x, y + (modules - 7) * cellSize);

  // Fill data area with pseudo-random pattern
  const seed = Math.abs(hash);
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      // Skip finder pattern areas
      if ((row < 8 && col < 8) || (row < 8 && col >= modules - 8) || (row >= modules - 8 && col < 8)) continue;
      const val = ((seed * (row * modules + col + 1)) >> 3) & 1;
      if (val) {
        ctx.fillStyle = "#000";
        ctx.fillRect(x + col * cellSize, y + row * cellSize, cellSize, cellSize);
      }
    }
  }
}

/* ---- Security pattern drawing ---- */
function drawSecurityPattern(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Subtle diagonal lines
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 1;
  for (let i = -h; i < w + h; i += 18) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + h, h);
    ctx.stroke();
  }
  // Subtle circles
  ctx.strokeStyle = "rgba(255,255,255,0.02)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(w * 0.7, h * 0.5, 80 + i * 40, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/* ---- Rounded rect helper ---- */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

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

  const fillTest = async () => {
    setCpf("345.678.901-23"); setNomeCompleto("PEDRO HENRIQUE ALMEIDA"); setUf("SP"); setGenero("Masculino");
    setNacionalidade("BRASILEIRA"); setDataNascimento("15/06/1990"); setRegistro(generateDigits(11));
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

  const drawOnTemplate = useCallback((withWatermark: boolean): Promise<string> => {
    return new Promise((resolve) => {
      // Modern horizontal card: 2400 x 1400 px (landscape)
      const W = 2400;
      const H = 1400;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      // ===== BACKGROUND =====
      // Main gradient: deep navy to dark teal
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, "#0a1628");
      bgGrad.addColorStop(0.5, "#0d2137");
      bgGrad.addColorStop(1, "#0a2a3c");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Security pattern overlay
      drawSecurityPattern(ctx, W, H);

      // Accent stripe at top
      const topGrad = ctx.createLinearGradient(0, 0, W, 0);
      topGrad.addColorStop(0, "#1a73e8");
      topGrad.addColorStop(0.5, "#00bcd4");
      topGrad.addColorStop(1, "#1a73e8");
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, W, 8);

      // Accent stripe at bottom
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, H - 8, W, 8);

      // Subtle right-side glow
      const glowGrad = ctx.createRadialGradient(W * 0.85, H * 0.3, 0, W * 0.85, H * 0.3, 500);
      glowGrad.addColorStop(0, "rgba(26,115,232,0.08)");
      glowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, W, H);

      // ===== HEADER BAR =====
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(0, 20, W, 90);

      // System name
      ctx.font = "bold 38px 'Segoe UI', Arial, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.fillText("REPÚBLICA FEDERATIVA DO BRASIL", 40, 65);

      ctx.font = "300 22px 'Segoe UI', Arial, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText("CARTEIRA NACIONAL DE HABILITAÇÃO  •  DRIVER LICENSE", 40, 95);

      // Category badge (top right)
      if (categoria) {
        ctx.font = "bold 64px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#00bcd4";
        ctx.textAlign = "right";
        ctx.fillText(categoria, W - 50, 85);
        ctx.font = "300 18px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillText("CATEGORIA", W - 50, 105);
        ctx.textAlign = "left";
      }

      // ===== PHOTO AREA (left side) =====
      const photoX = 50;
      const photoY = 145;
      const photoW = 420;
      const photoH = 540;

      // Photo frame with gradient border
      const framePad = 4;
      ctx.strokeStyle = "#00bcd4";
      ctx.lineWidth = 3;
      roundRect(ctx, photoX - framePad, photoY - framePad, photoW + framePad * 2, photoH + framePad * 2, 16);
      ctx.stroke();

      // Photo placeholder bg
      ctx.fillStyle = "#162a42";
      roundRect(ctx, photoX, photoY, photoW, photoH, 12);
      ctx.fill();

      // ===== SIGNATURE AREA (below photo) =====
      const sigX = photoX;
      const sigY = photoY + photoH + 30;
      const sigW = photoW;
      const sigH = 120;

      ctx.font = "300 16px 'Segoe UI', Arial, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillText("ASSINATURA DO PORTADOR", sigX, sigY - 8);

      // Signature box
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      roundRect(ctx, sigX, sigY, sigW, sigH, 8);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      roundRect(ctx, sigX, sigY, sigW, sigH, 8);
      ctx.fill();

      // ===== DATA FIELDS (right side) =====
      const dataX = photoX + photoW + 60;
      const dataW = W - dataX - 50;
      let currentY = 155;
      const lineH = 75;

      const drawField = (label: string, value: string, x: number, y: number, fieldW?: number) => {
        ctx.font = "300 16px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.textAlign = "left";
        ctx.fillText(label, x, y);
        ctx.font = "600 28px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(value || "—", x, y + 34);
        // Underline
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + 44);
        ctx.lineTo(x + (fieldW || dataW), y + 44);
        ctx.stroke();
      };

      // Row 1: Nome completo (full width)
      drawField("NOME COMPLETO", nomeCompleto, dataX, currentY, dataW);
      currentY += lineH;

      // Row 2: CPF | RG (split)
      const halfW = (dataW - 40) / 2;
      drawField("CPF", cpf, dataX, currentY, halfW);
      drawField("DOC. IDENTIDADE", rg, dataX + halfW + 40, currentY, halfW);
      currentY += lineH;

      // Row 3: Nascimento | Nacionalidade
      drawField("NASCIMENTO", dataNascimento, dataX, currentY, halfW);
      drawField("NACIONALIDADE", nacionalidade === "BRASILEIRA" ? "BRASILEIRO(A)" : "ESTRANGEIRO(A)", dataX + halfW + 40, currentY, halfW);
      currentY += lineH;

      // Row 4: Emissão | Validade
      drawField("DATA EMISSÃO", dataEmissao, dataX, currentY, halfW);
      drawField("VALIDADE", dataValidade, dataX + halfW + 40, currentY, halfW);
      currentY += lineH;

      // Row 5: 1ª Hab | Registro
      drawField("1ª HABILITAÇÃO", dataPrimeiraHab, dataX, currentY, halfW);
      // Registro in accent color
      ctx.font = "300 16px 'Segoe UI', Arial, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.fillText("Nº REGISTRO", dataX + halfW + 40, currentY);
      ctx.font = "bold 28px 'Segoe UI', Arial, sans-serif";
      ctx.fillStyle = "#00bcd4";
      ctx.fillText(registro || "—", dataX + halfW + 40, currentY + 34);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(dataX + halfW + 40, currentY + 44);
      ctx.lineTo(dataX + halfW + 40 + halfW, currentY + 44);
      ctx.stroke();
      currentY += lineH;

      // Row 6: Filiação (PAI | MÃE)
      drawField("FILIAÇÃO (PAI)", nomePai, dataX, currentY, halfW);
      drawField("FILIAÇÃO (MÃE)", nomeMae, dataX + halfW + 40, currentY, halfW);
      currentY += lineH;

      // Row 7: Cidade/Estado | UF
      drawField("LOCAL", cidadeEstado, dataX, currentY, halfW);
      drawField("UF", estadoExtenso, dataX + halfW + 40, currentY, halfW);
      currentY += lineH;

      // ===== BOTTOM BAR =====
      const bottomBarY = H - 200;

      // Separator line
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, bottomBarY);
      ctx.lineTo(W - 40, bottomBarY);
      ctx.stroke();

      // Bottom info row
      const bottomY = bottomBarY + 35;
      const colW = (W - 100) / 5;

      const drawBottomField = (label: string, value: string, x: number) => {
        ctx.font = "300 14px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.textAlign = "left";
        ctx.fillText(label, x, bottomY);
        ctx.font = "500 20px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillText(value || "—", x, bottomY + 28);
      };

      drawBottomField("RENACH", renach, 50);
      drawBottomField("ESPELHO", espelho, 50 + colW);
      drawBottomField("CÓD. SEGURANÇA", codigoSeguranca, 50 + colW * 2);
      drawBottomField("OBSERVAÇÕES", observacoes.join(", ") || "—", 50 + colW * 3);

      // QR Code area (bottom right)
      const qrSize = 150;
      const qrX = W - qrSize - 50;
      const qrY = bottomBarY + 15;

      // QR background
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 8);
      ctx.fill();
      drawQRPlaceholder(ctx, qrX, qrY, qrSize, `${registro}-${cpf}-${nomeCompleto}`);

      // ===== MRZ ZONE =====
      const mrzY = H - 55;
      ctx.font = "16px 'Courier New', monospace";
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.textAlign = "left";
      const regClean = (registro || "").replace(/\D/g, "");
      const nameMRZ = nomeCompleto.replace(/\s+/g, "<").toUpperCase();
      ctx.fillText(`I<BRA${regClean.padEnd(15, "<")}<<<<<<`, 50, mrzY);
      ctx.fillText(`${nameMRZ}${"<".repeat(Math.max(0, 44 - nameMRZ.length))}`, 50, mrzY + 22);

      // ===== DRAW PHOTO =====
      const drawPhoto = (): Promise<void> => {
        if (!fotoPreview) return Promise.resolve();
        return new Promise((res) => {
          const img = new Image();
          img.onload = () => {
            // Clip to rounded rect
            ctx.save();
            roundRect(ctx, photoX, photoY, photoW, photoH, 12);
            ctx.clip();
            // Cover-fit the photo
            const imgRatio = img.width / img.height;
            const boxRatio = photoW / photoH;
            let sx = 0, sy = 0, sw = img.width, sh = img.height;
            if (imgRatio > boxRatio) {
              sw = img.height * boxRatio;
              sx = (img.width - sw) / 2;
            } else {
              sh = img.width / boxRatio;
              sy = (img.height - sh) / 2;
            }
            ctx.drawImage(img, sx, sy, sw, sh, photoX, photoY, photoW, photoH);
            ctx.restore();
            res();
          };
          img.onerror = () => res();
          img.src = fotoPreview;
        });
      };

      // ===== DRAW SIGNATURE =====
      const drawSig = (): Promise<void> => {
        if (!assinaturaPreview) return Promise.resolve();
        return new Promise((res) => {
          const img = new Image();
          img.onload = () => {
            // Fit signature inside box
            const imgRatio = img.width / img.height;
            let dw = sigW - 20;
            let dh = dw / imgRatio;
            if (dh > sigH - 10) { dh = sigH - 10; dw = dh * imgRatio; }
            const dx = sigX + (sigW - dw) / 2;
            const dy = sigY + (sigH - dh) / 2;
            ctx.drawImage(img, dx, dy, dw, dh);
            res();
          };
          img.onerror = () => res();
          img.src = assinaturaPreview;
        });
      };

      drawPhoto().then(() => drawSig()).then(() => {
        if (withWatermark) {
          ctx.save();
          ctx.translate(W / 2, H / 2);
          ctx.rotate(-Math.PI / 6);
          ctx.font = `bold ${W * 0.04}px Arial`;
          ctx.fillStyle = "rgba(255, 80, 80, 0.15)";
          ctx.textAlign = "center";
          for (let i = -3; i <= 3; i++) {
            ctx.fillText("BELLARUS NÃO COPIE", 0, i * H * 0.12);
          }
          ctx.restore();
        }
        resolve(canvas.toDataURL("image/png"));
      });
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
    // Landscape PDF matching card aspect ratio
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [120, 70] });
    pdf.addImage(cleanImage, "PNG", 0, 0, 120, 70);
    pdf.save(`CNH_${nomeCompleto.replace(/\s+/g, "_")}.pdf`);

    if (user) saveDocumentHistory(user.id, "CNH Digital", nomeCompleto || "Sem nome");
    toast.success(isAdmin ? "PDF gerado com sucesso! (Admin — sem débito)" : "PDF gerado com sucesso! 1 crédito debitado.");
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
            <Button variant="outline" size="sm" onClick={() => setShowPreview(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Editar</Button>
          </div>

          {previewImage && (
            <div className="rounded-2xl border-2 border-accent/30 overflow-hidden shadow-lg">
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

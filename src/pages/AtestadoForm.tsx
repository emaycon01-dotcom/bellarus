import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Shield, Users, Clock, Sparkles, Eye, Stethoscope, CheckCircle2, Shuffle, Search, Wand2, MapPin, Building2, Loader2, Download, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { saveDocumentHistory } from "@/lib/saveDocumentHistory";
import atestadoTemplate from "@/assets/atestado-template.png";
import jsPDF from "jspdf";
import QRCode from "react-qr-code";

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
const generateCNS = () => generateDigits(11);

function numberToWords(n: number): string {
  const units = ["", "UM", "DOIS", "TRÊS", "QUATRO", "CINCO", "SEIS", "SETE", "OITO", "NOVE", "DEZ",
    "ONZE", "DOZE", "TREZE", "QUATORZE", "QUINZE", "DEZESSEIS", "DEZESSETE", "DEZOITO", "DEZENOVE", "VINTE",
    "VINTE E UM", "VINTE E DOIS", "VINTE E TRÊS", "VINTE E QUATRO", "VINTE E CINCO", "VINTE E SEIS", "VINTE E SETE", "VINTE E OITO", "VINTE E NOVE", "TRINTA"];
  return units[n] || String(n);
}

function formatDateLong(dateStr: string): string {
  if (!dateStr) return "";
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const parts = dateStr.split("/");
  if (parts.length !== 3) return dateStr;
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const year = parts[2];
  return `${day} de ${months[month] || ""} de ${year}`;
}

const AtestadoForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const templateImgRef = useRef<HTMLImageElement | null>(null);

  const [nomePaciente, setNomePaciente] = useState("");
  const [cnsPaciente, setCnsPaciente] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cidSearch, setCidSearch] = useState("");
  const [cidSelecionado, setCidSelecionado] = useState<{ code: string; name: string } | null>(null);
  const [diasAfastamento, setDiasAfastamento] = useState("");
  const [dataAtestado, setDataAtestado] = useState("");
  const [horaAtendimento, setHoraAtendimento] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showCidResults, setShowCidResults] = useState(false);

  const [nomeUpa, setNomeUpa] = useState("");
  const [enderecoUpa, setEnderecoUpa] = useState("");
  const [cepUpa, setCepUpa] = useState("");

  const [nomeMedico, setNomeMedico] = useState("");
  const [crm, setCrm] = useState("");
  const [ufMedico, setUfMedico] = useState("");
  const [especialidade, setEspecialidade] = useState("");

  const [loadingCidAi, setLoadingCidAi] = useState(false);
  const [aiCidResults, setAiCidResults] = useState<{ code: string; name: string; days: number }[]>([]);
  const [loadingMedico, setLoadingMedico] = useState(false);
  const [loadingUpa, setLoadingUpa] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);

  // Load template image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = atestadoTemplate;
    img.onload = () => { templateImgRef.current = img; };
  }, []);

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
      const { data, error } = await supabase.functions.invoke("medical-ai", { body: { type: "cid", query: cidSearch } });
      if (error) throw error;
      if (data?.results) { setAiCidResults(data.results); setShowCidResults(true); }
    } catch { toast.error("Erro ao buscar CIDs com IA"); } finally { setLoadingCidAi(false); }
  };

  const generateMedicoAI = async () => {
    setLoadingMedico(true);
    try {
      const { data, error } = await supabase.functions.invoke("medical-ai", { body: { type: "medico", query: `Gere um médico ${especialidade || "clínico geral"} do estado ${ufMedico || "SP"}` } });
      if (error) throw error;
      if (data?.nome) {
        setNomeMedico(data.nome.toUpperCase());
        setCrm(data.crm);
        if (data.especialidade) setEspecialidade(data.especialidade.toUpperCase());
        toast.success("Dados do médico gerados pela IA!");
      }
    } catch { toast.error("Erro ao gerar médico com IA"); } finally { setLoadingMedico(false); }
  };

  const generateUpaAI = async () => {
    setLoadingUpa(true);
    try {
      const { data, error } = await supabase.functions.invoke("medical-ai", { body: { type: "upa", query: `Gere dados de uma UPA 24h no estado ${ufMedico || "SP"}` } });
      if (error) throw error;
      if (data?.nome) {
        setNomeUpa(data.nome.toUpperCase());
        setEnderecoUpa(data.endereco);
        setCepUpa(data.cnes?.slice(0, 5) + "000" || "08295005");
        toast.success("Dados da UPA gerados pela IA!");
      }
    } catch { toast.error("Erro ao gerar UPA com IA"); } finally { setLoadingUpa(false); }
  };

  const drawAtestado = useCallback((canvas: HTMLCanvasElement, withWatermark: boolean) => {
    const ctx = canvas.getContext("2d");
    if (!ctx || !templateImgRef.current) return;

    const img = templateImgRef.current;
    // Use original image dimensions
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Draw template
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Now overlay text at specific positions matching the template layout
    const W = canvas.width;
    const H = canvas.height;

    // Scale factor (image is roughly 828px wide based on typical phone screenshot)
    const s = W / 828;

    // --- Header: UPA name + address (top center area) ---
    ctx.fillStyle = "#000";
    ctx.font = `bold ${14 * s}px Arial`;
    // Address area (right of UPA logo, top)
    const headerX = W * 0.45;
    const headerY = H * 0.055;
    ctx.font = `${12 * s}px Arial`;
    ctx.fillText(enderecoUpa || "Av. Miguel Ignácio curi, 44 -", headerX, headerY);
    ctx.fillText(cepUpa ? `CEP: ${cepUpa}` : "CEP: 08295005", headerX, headerY + 16 * s);

    // --- "PARA:" name ---
    ctx.fillStyle = "#000";
    ctx.font = `bold ${16 * s}px Arial`;
    const nameY = H * 0.175;
    ctx.fillText(`PARA: ${nomePaciente || "NOME DO PACIENTE"}`, W * 0.06, nameY);

    // --- Body text ---
    ctx.font = `${14 * s}px Arial`;
    const bodyY = H * 0.225;
    const bodyX = W * 0.06;
    const maxW = W * 0.88;
    const cns = cnsPaciente || generateCNS();
    const upaName = nomeUpa || "UPA 24h ITAQUERA - Consultórios";
    const date = dataAtestado || "16/02/2026";
    const time = horaAtendimento || "09:19";
    const days = diasAfastamento || "7";
    const daysWord = numberToWords(parseInt(days) || 0);

    const bodyText = `Atesto para os devidos fins, que o(a), ${nomePaciente || "NOME DO PACIENTE"} CNS: ${cns} foi atendido(a) no(a), ${upaName} na data ${date} ás ${time} necessitando de ${days} (${daysWord}) dia de repouso por motivo de doença.`;

    // Word-wrap body text
    const words = bodyText.split(" ");
    let line = "";
    let lineY = bodyY;
    const lineHeight = 20 * s;
    for (const word of words) {
      const testLine = line + (line ? " " : "") + word;
      if (ctx.measureText(testLine).width > maxW) {
        ctx.fillText(line, bodyX, lineY);
        line = word;
        lineY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, bodyX, lineY);

    // --- CID ---
    ctx.font = `${16 * s}px Arial`;
    const cidY = lineY + lineHeight * 2;
    ctx.fillText(`CID: ${cidSelecionado?.code || "A90"}`, bodyX, cidY);

    // --- Location + date (center-right) ---
    ctx.font = `${14 * s}px Arial`;
    const locY = H * 0.56;
    const locText = `${upaName}, ${formatDateLong(date)}`;
    ctx.fillText(locText, W * 0.42, locY);

    // --- Footer: emitted date ---
    ctx.font = `${10 * s}px Arial`;
    ctx.fillText(`Emitido em: ${date} ${time}`, W * 0.04, H * 0.87);

    // --- Doctor info (bottom right) ---
    ctx.font = `${12 * s}px Arial`;
    const docX = W * 0.7;
    const docY = H * 0.90;
    ctx.fillText(nomeMedico || "Dr. Nome do Médico", docX, docY);
    ctx.fillText(crm ? `CRM ${crm}` : "CRM 000000", docX, docY + 16 * s);

    // --- Watermark ---
    if (withWatermark) {
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = "#ff0000";
      ctx.font = `bold ${60 * s}px Arial`;
      ctx.translate(W / 2, H / 2);
      ctx.rotate(-Math.PI / 4);
      const wmText = "BELLARUS NÃO COPIE";
      const wmWidth = ctx.measureText(wmText).width;
      // Draw multiple watermark lines
      for (let row = -3; row <= 3; row++) {
        for (let col = -2; col <= 2; col++) {
          ctx.fillText(wmText, col * (wmWidth + 40 * s), row * 120 * s);
        }
      }
      ctx.restore();
    }
  }, [nomePaciente, cnsPaciente, nomeUpa, enderecoUpa, cepUpa, dataAtestado, horaAtendimento, diasAfastamento, cidSelecionado, nomeMedico, crm]);

  // Render preview on canvas when showPreview changes or data changes
  useEffect(() => {
    if (showPreview && canvasRef.current && templateImgRef.current) {
      drawAtestado(canvasRef.current, true);
    }
  }, [showPreview, drawAtestado]);

  const fillTest = () => {
    const testData = [
      {
        nome: "DAIANI MANSANARI DOS SANTOS", cns: "40274054809", nasc: "12/05/1995",
        upa: "UPA 24H ITAQUERA - CONSULTÓRIOS", endereco: "Av. Miguel Ignácio Curi, 44 - Arthur Alvim, São Paulo - SP", cep: "08295005",
        medico: "DR. ABDO LAFIT FARES", crmVal: "163120", uf: "SP", esp: "CLÍNICO GERAL",
        cid: { code: "A90", name: "Dengue" }, dias: "7", data: "16/02/2026", hora: "09:19",
      },
      {
        nome: "CARLOS EDUARDO MENDES", cns: "70183926455", nasc: "23/08/1988",
        upa: "UPA 24H CAMPO LIMPO", endereco: "R. Carlos Lacerda, 678 - Campo Limpo, São Paulo - SP", cep: "05765000",
        medico: "DRA. MARIANA SILVA RIBEIRO", crmVal: "198432", uf: "SP", esp: "CLÍNICO GERAL",
        cid: { code: "J06.9", name: "Infecção aguda das vias aéreas superiores" }, dias: "3", data: "10/03/2026", hora: "14:35",
      },
      {
        nome: "FERNANDA OLIVEIRA COSTA", cns: "52839174600", nasc: "07/11/1992",
        upa: "UPA 24H MADUREIRA", endereco: "Estr. do Portela, 99 - Madureira, Rio de Janeiro - RJ", cep: "21351050",
        medico: "DR. HENRIQUE AUGUSTO NASCIMENTO", crmVal: "245781", uf: "RJ", esp: "CARDIOLOGISTA",
        cid: { code: "R51", name: "Cefaleia" }, dias: "2", data: "05/03/2026", hora: "07:42",
      },
      {
        nome: "RAFAEL SANTOS PEREIRA", cns: "31847529103", nasc: "30/01/2001",
        upa: "UPA 24H BOA VISTA", endereco: "Av. Recife, 1520 - Boa Vista, Recife - PE", cep: "50070070",
        medico: "DRA. CAROLINA BEZERRA LIMA", crmVal: "187654", uf: "PE", esp: "ORTOPEDISTA",
        cid: { code: "M54.5", name: "Dor lombar baixa (lombalgia)" }, dias: "5", data: "22/02/2026", hora: "11:08",
      },
      {
        nome: "ANA BEATRIZ RODRIGUES LIMA", cns: "68492015738", nasc: "15/06/1990",
        upa: "UPA 24H PAMPULHA", endereco: "Av. Portugal, 2480 - Jardim Atlântico, Belo Horizonte - MG", cep: "31550000",
        medico: "DR. JOÃO VICTOR ALMEIDA SOUZA", crmVal: "302198", uf: "MG", esp: "NEUROLOGISTA",
        cid: { code: "G43.9", name: "Enxaqueca não especificada" }, dias: "3", data: "28/02/2026", hora: "16:50",
      },
      {
        nome: "LUCAS GABRIEL FERREIRA", cns: "95120483762", nasc: "02/12/1997",
        upa: "UPA 24H MOACYR SCLIAR", endereco: "Av. Assis Brasil, 6615 - Sarandi, Porto Alegre - RS", cep: "91130001",
        medico: "DRA. PATRÍCIA MOURA TEIXEIRA", crmVal: "154320", uf: "RS", esp: "PSIQUIATRA",
        cid: { code: "F41.0", name: "Transtorno de pânico" }, dias: "10", data: "01/03/2026", hora: "20:15",
      },
    ];
    const t = testData[Math.floor(Math.random() * testData.length)];
    setNomePaciente(t.nome);
    setCnsPaciente(t.cns);
    setDataNascimento(t.nasc);
    setNomeUpa(t.upa);
    setEnderecoUpa(t.endereco);
    setCepUpa(t.cep);
    setNomeMedico(t.medico);
    setCrm(t.crmVal);
    setUfMedico(t.uf);
    setEspecialidade(t.esp);
    setCidSelecionado(t.cid);
    setCidSearch(`${t.cid.code} - ${t.cid.name}`);
    setDiasAfastamento(t.dias);
    setDataAtestado(t.data);
    setHoraAtendimento(t.hora);
    toast.success("Campos preenchidos com dados de teste!");
  };

  const clearAll = () => {
    setNomePaciente(""); setCnsPaciente(""); setDataNascimento(""); setNomeUpa(""); setEnderecoUpa(""); setCepUpa("");
    setNomeMedico(""); setCrm(""); setUfMedico(""); setEspecialidade("");
    setCidSelecionado(null); setCidSearch(""); setDiasAfastamento("");
    setDataAtestado(""); setHoraAtendimento(""); setVerificationId(null);
    toast.success("Campos limpos!");
  };

  const handlePreview = () => {
    if (!templateImgRef.current) {
      toast.error("Template ainda carregando, aguarde...");
      return;
    }
    setShowPreview(true);
    toast.success("Preview gerado com marca d'água!");
  };

  const handleConfirm = async () => {
    if (!user) { toast.error("Faça login para continuar."); return; }
    setGenerating(true);
    try {
      // Check and debit credits
      const { data: profile } = await supabase.from("profiles").select("credits").eq("id", user.id).single();
      if (!profile || profile.credits < 1) {
        toast.error("Créditos insuficientes! Recarregue sua conta.");
        setGenerating(false);
        return;
      }
      const { error: creditErr } = await supabase.from("profiles").update({ credits: profile.credits - 1 }).eq("id", user.id);
      if (creditErr) { toast.error("Erro ao debitar crédito."); setGenerating(false); return; }

      // Create verification record
      const docData = {
        nomePaciente, cnsPaciente, dataNascimento,
        cidCodigo: cidSelecionado?.code || "", cidNome: cidSelecionado?.name || "",
        diasAfastamento, dataAtestado, horaAtendimento,
        nomeUpa, enderecoUpa, cepUpa,
        nomeMedico, crm: crm ? `CRM/${ufMedico || "SP"} ${crm}` : "",
        especialidade, ufMedico,
      };
      const { data: inserted, error: vErr } = await supabase
        .from("document_verifications")
        .insert({
          user_id: user.id,
          document_type: "Atestado Médico",
          document_name: nomePaciente || "Sem nome",
          document_data: docData,
          photo_url: null,
          status: "valid",
        } as any)
        .select("id")
        .single();
      if (vErr) throw vErr;
      setVerificationId(inserted.id);

      // Wait for QR code to render with verification ID
      await new Promise(r => setTimeout(r, 500));

      // Generate clean image (no watermark)
      const offscreen = document.createElement("canvas");
      drawAtestado(offscreen, false);

      const imgData = offscreen.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [offscreen.width, offscreen.height] });
      pdf.addImage(imgData, "JPEG", 0, 0, offscreen.width, offscreen.height);
      pdf.save(`atestado-${nomePaciente || "documento"}.pdf`);

      if (user) saveDocumentHistory(user.id, "Atestado Médico", nomePaciente || "Sem nome");
      toast.success("PDF gerado com sucesso! 1 crédito debitado.");
    } catch (e) {
      toast.error("Erro ao gerar PDF.");
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

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
              <div><Label className="text-sm font-semibold text-primary">Nome Completo <span className="text-destructive">*</span></Label><Input placeholder="Ex: DAIANI MANSANARI DOS SANTOS" value={nomePaciente} onChange={(e) => setNomePaciente(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              <div><Label className="text-sm font-semibold text-primary">Data de Nascimento</Label><Input placeholder="DD/MM/AAAA" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              <div><Label className="text-sm font-semibold text-primary">CNS (Cartão Nacional de Saúde)</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input placeholder="00000000000" value={cnsPaciente} onChange={(e) => setCnsPaciente(e.target.value)} className="bg-secondary/50" />
                  <Button variant="outline" size="sm" className="shrink-0 gap-1 border-primary/50 text-primary" onClick={() => setCnsPaciente(generateCNS())}><Shuffle className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          </div>

          {/* Dados do Médico */}
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3"><Search className="w-5 h-5 text-primary" /><h3 className="text-lg font-display font-bold text-foreground">Dados do Médico</h3></div>
              <Button variant="outline" size="sm" className="gap-1.5 border-accent/50 text-accent" onClick={generateMedicoAI} disabled={loadingMedico}>
                {loadingMedico ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} Gerar com IA
              </Button>
            </div>
            <div className="space-y-4">
              <div><Label className="text-sm font-semibold text-primary">Nome do Médico <span className="text-destructive">*</span></Label><Input placeholder="Ex: DR. ABDO LAFIT FARES" value={nomeMedico} onChange={(e) => setNomeMedico(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-primary">UF <span className="text-destructive">*</span></Label>
                  <Select value={ufMedico} onValueChange={setUfMedico}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="UF" /></SelectTrigger><SelectContent>{UF_OPTIONS.map(u=><SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-primary">CRM <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input placeholder="163120" value={crm} onChange={(e) => setCrm(e.target.value)} className="bg-secondary/50" />
                    <Button variant="outline" size="sm" className="shrink-0 gap-1 border-primary/50 text-primary" onClick={() => setCrm(generateDigits(6))}><Shuffle className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-primary">Especialidade</Label>
                <Select value={especialidade} onValueChange={setEspecialidade}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{ESPECIALIDADES.map(e=><SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select>
              </div>
            </div>
          </div>

          {/* Dados da UPA */}
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3"><Building2 className="w-5 h-5 text-primary" /><h3 className="text-lg font-display font-bold text-foreground">UPA / Hospital</h3></div>
              <Button variant="outline" size="sm" className="gap-1.5 border-accent/50 text-accent" onClick={generateUpaAI} disabled={loadingUpa}>
                {loadingUpa ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} Gerar com IA
              </Button>
            </div>
            <div className="space-y-4">
              <div><Label className="text-sm font-semibold text-primary">Nome da UPA <span className="text-destructive">*</span></Label><Input placeholder="Ex: UPA 24H ITAQUERA" value={nomeUpa} onChange={(e) => setNomeUpa(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              <div><Label className="text-sm font-semibold text-primary">Endereço Completo <span className="text-destructive">*</span></Label>
                <div className="relative mt-1.5"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Av. Miguel Ignácio Curi, 44 - Arthur Alvim, São Paulo - SP" value={enderecoUpa} onChange={(e) => setEnderecoUpa(e.target.value)} className="pl-10 bg-secondary/50" /></div>
              </div>
              <div><Label className="text-sm font-semibold text-primary">CEP</Label><Input placeholder="08295005" value={cepUpa} onChange={(e) => setCepUpa(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
            </div>
          </div>

          {/* Diagnóstico */}
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Sparkles className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-display font-bold text-foreground">Diagnóstico <span className="text-xs text-accent font-normal ml-2">✦ IA</span></h3>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <Label className="text-sm font-semibold text-primary">Buscar CID <span className="text-destructive">*</span></Label>
                <div className="relative mt-1.5 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Digite sintomas ou doença..." value={cidSearch} onChange={(e) => { setCidSearch(e.target.value); setShowCidResults(true); }} onFocus={() => setShowCidResults(true)} className="pl-10 bg-secondary/50" />
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0 gap-1.5 border-accent/50 text-accent" onClick={searchCidWithAI} disabled={loadingCidAi || cidSearch.length < 2}>
                    {loadingCidAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} IA
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
                  <div className="mt-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 font-semibold">{cidSelecionado.code} - {cidSelecionado.name}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-semibold text-primary">Dias de Afastamento <span className="text-destructive">*</span></Label><Input placeholder="7" value={diasAfastamento} onChange={(e) => setDiasAfastamento(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
                <div><Label className="text-sm font-semibold text-primary">Data do Atestado</Label><Input placeholder="16/02/2026" value={dataAtestado} onChange={(e) => setDataAtestado(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              </div>
              <div><Label className="text-sm font-semibold text-primary">Hora do Atendimento</Label><Input placeholder="09:19" value={horaAtendimento} onChange={(e) => setHoraAtendimento(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Button size="lg" className="gap-2 bg-gradient-to-r from-destructive to-primary text-white" onClick={handlePreview}><Eye className="w-5 h-5" /> Gerar Preview</Button>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-destructive to-primary flex items-center justify-center"><Eye className="w-5 h-5 text-white" /></div>
                <div>
                  <h3 className="text-lg font-display font-bold text-foreground">Preview com Marca D'água</h3>
                  <p className="text-xs text-muted-foreground">Pague 1 crédito para obter o PDF limpo</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowPreview(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Editar</Button>
            </div>
            <div className="rounded-xl border-2 border-destructive/20 overflow-hidden bg-white">
              <canvas ref={canvasRef} className="w-full h-auto" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="lg" onClick={() => setShowPreview(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Editar</Button>
            <Button size="lg" className="gap-2 bg-gradient-to-r from-destructive to-primary text-white" onClick={handleConfirm} disabled={generating}>
              {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              Gerar PDF (1 Crédito)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AtestadoForm;

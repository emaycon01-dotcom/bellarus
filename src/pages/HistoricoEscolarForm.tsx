import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BookOpen, Sparkles, Eye, Download, Wand2, Trash2, Zap, Plus, X, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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

const NIVEIS = ["Ensino Fundamental", "Ensino Médio"];
const TURNOS = ["Matutino", "Vespertino", "Noturno", "Integral"];

const MATERIAS_FUNDAMENTAIS = [
  "Língua Portuguesa", "Matemática", "Ciências", "História", "Geografia",
  "Educação Física", "Arte", "Inglês", "Educação Religiosa"
];
const MATERIAS_MEDIO = [
  "Língua Portuguesa", "Matemática", "Física", "Química", "Biologia",
  "História", "Geografia", "Filosofia", "Sociologia", "Educação Física",
  "Arte", "Inglês", "Redação"
];

interface Materia {
  nome: string;
  nota1: string;
  nota2: string;
  nota3: string;
  nota4: string;
  media: string;
  faltas: string;
  resultado: string;
}

const calcMedia = (n1: string, n2: string, n3: string, n4: string): string => {
  const nums = [n1, n2, n3, n4].map(Number).filter(n => !isNaN(n) && n > 0);
  if (nums.length === 0) return "";
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
};

const HistoricoEscolarForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<"form" | "preview">("form");
  const [loading, setLoading] = useState(false);
  const [brasaoLoading, setBrasaoLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Student info
  const [nomeAluno, setNomeAluno] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [naturalidade, setNaturalidade] = useState("");
  const [nacionalidade, setNacionalidade] = useState("BRASILEIRA");
  const [nomePai, setNomePai] = useState("");
  const [nomeMae, setNomeMae] = useState("");
  const [rg, setRg] = useState("");
  const [ra, setRa] = useState("");

  // School info
  const [escola, setEscola] = useState("");
  const [enderecoEscola, setEnderecoEscola] = useState("");
  const [cidadeEscola, setCidadeEscola] = useState("");
  const [ufEscola, setUfEscola] = useState("");
  const [codigoINEP, setCodigoINEP] = useState("");
  const [nivel, setNivel] = useState("");
  const [turno, setTurno] = useState("");
  const [anoConclusao, setAnoConclusao] = useState("");
  const [diretor, setDiretor] = useState("");
  const [secretario, setSecretario] = useState("");
  const [dataEmissao, setDataEmissao] = useState("");

  // Subjects
  const [materias, setMaterias] = useState<Materia[]>([]);

  // Brasão
  const [brasaoUrl, setBrasaoUrl] = useState<string>("");

  // Canvas ref for preview
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addDefaultMaterias = () => {
    const list = nivel === "Ensino Médio" ? MATERIAS_MEDIO : MATERIAS_FUNDAMENTAIS;
    setMaterias(list.map(nome => ({
      nome,
      nota1: (Math.random() * 4 + 6).toFixed(1),
      nota2: (Math.random() * 4 + 6).toFixed(1),
      nota3: (Math.random() * 4 + 5).toFixed(1),
      nota4: (Math.random() * 4 + 6).toFixed(1),
      media: "",
      faltas: String(Math.floor(Math.random() * 15)),
      resultado: "Aprovado"
    })).map(m => ({ ...m, media: calcMedia(m.nota1, m.nota2, m.nota3, m.nota4) })));
  };

  const updateMateria = (index: number, field: keyof Materia, value: string) => {
    setMaterias(prev => prev.map((m, i) => {
      if (i !== index) return m;
      const updated = { ...m, [field]: value };
      if (["nota1", "nota2", "nota3", "nota4"].includes(field)) {
        updated.media = calcMedia(updated.nota1, updated.nota2, updated.nota3, updated.nota4);
        updated.resultado = Number(updated.media) >= 5 ? "Aprovado" : "Reprovado";
      }
      return updated;
    }));
  };

  const addMateria = () => {
    setMaterias(prev => [...prev, { nome: "", nota1: "", nota2: "", nota3: "", nota4: "", media: "", faltas: "", resultado: "" }]);
  };

  const removeMateria = (index: number) => {
    setMaterias(prev => prev.filter((_, i) => i !== index));
  };

  // Generate brasão via AI
  const handleGenerateBrasao = async () => {
    if (!ufEscola) { toast.error("Selecione o UF primeiro."); return; }
    setBrasaoLoading(true);
    try {
      const estadoNome = UF_EXTENSO[ufEscola] || ufEscola;
      const { data, error } = await supabase.functions.invoke("medical-ai", {
        body: { type: "brasao", query: estadoNome },
      });
      if (error) throw error;
      if (data?.image) {
        setBrasaoUrl(data.image);
        toast.success(`Brasão de ${estadoNome} gerado com IA!`);
      } else {
        toast.error("Não foi possível gerar o brasão.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar brasão.");
    }
    setBrasaoLoading(false);
  };

  // AI fill school data
  const handleAIFill = async () => {
    if (!cidadeEscola || !ufEscola) { toast.error("Preencha cidade e UF."); return; }
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke("medical-ai", {
        body: {
          type: "custom",
          prompt: `Gere dados fictícios realistas para uma escola pública em ${cidadeEscola}-${ufEscola}. JSON: {"escola":"nome completo da escola com E.E.","endereco":"endereço completo","diretor":"nome completo","secretario":"nome completo","codigoINEP":"8 dígitos","dataEmissao":"DD/MM/AAAA"}`
        },
      });
      if (data?.result) {
        try {
          const json = JSON.parse(data.result.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
          if (json.escola) setEscola(json.escola);
          if (json.endereco) setEnderecoEscola(json.endereco);
          if (json.diretor) setDiretor(json.diretor);
          if (json.secretario) setSecretario(json.secretario);
          if (json.codigoINEP) setCodigoINEP(json.codigoINEP);
          if (json.dataEmissao) setDataEmissao(json.dataEmissao);
          toast.success("Dados da escola gerados com IA!");
        } catch { toast.error("Erro ao processar dados."); }
      }
    } catch { toast.error("Erro ao conectar com IA."); }
    setLoading(false);
  };

  const fillTest = () => {
    setNomeAluno("LUCAS HENRIQUE SILVA SANTOS");
    setDataNascimento("15/03/2006");
    setNaturalidade("SÃO PAULO - SP");
    setNacionalidade("BRASILEIRA");
    setNomePai("MARCOS ANTÔNIO SILVA SANTOS");
    setNomeMae("ANA PAULA SILVA SANTOS");
    setRg("52.345.678-9");
    setRa("1234567890");
    setEscola("E.E. PROF. JOSÉ CARLOS DE OLIVEIRA");
    setEnderecoEscola("Rua das Flores, 456 - Jardim Primavera");
    setCidadeEscola("SÃO PAULO");
    setUfEscola("SP");
    setCodigoINEP("35123456");
    setNivel("Ensino Médio");
    setTurno("Matutino");
    setAnoConclusao("2023");
    setDiretor("PROF. MARIA HELENA COSTA");
    setSecretario("CLÁUDIA REGINA ALMEIDA");
    setDataEmissao("20/02/2024");
    // Add subjects
    const list = MATERIAS_MEDIO;
    setMaterias(list.map(nome => {
      const n1 = (Math.random() * 4 + 6).toFixed(1);
      const n2 = (Math.random() * 4 + 6).toFixed(1);
      const n3 = (Math.random() * 4 + 5).toFixed(1);
      const n4 = (Math.random() * 4 + 6).toFixed(1);
      const media = calcMedia(n1, n2, n3, n4);
      return { nome, nota1: n1, nota2: n2, nota3: n3, nota4: n4, media, faltas: String(Math.floor(Math.random() * 12)), resultado: Number(media) >= 5 ? "Aprovado" : "Reprovado" };
    }));
    toast.success("Campos preenchidos com dados de teste!");
  };

  const clearAll = () => {
    setNomeAluno(""); setDataNascimento(""); setNaturalidade(""); setNacionalidade("BRASILEIRA");
    setNomePai(""); setNomeMae(""); setRg(""); setRa("");
    setEscola(""); setEnderecoEscola(""); setCidadeEscola(""); setUfEscola("");
    setCodigoINEP(""); setNivel(""); setTurno(""); setAnoConclusao("");
    setDiretor(""); setSecretario(""); setDataEmissao("");
    setMaterias([]); setBrasaoUrl("");
    toast.success("Campos limpos!");
  };

  const handlePreview = () => {
    if (!nomeAluno || !escola || !nivel) { toast.error("Preencha nome, escola e nível."); return; }
    if (materias.length === 0) { toast.error("Adicione pelo menos uma matéria."); return; }
    setStep("preview");
  };

  const drawHistorico = useCallback((withWatermark: boolean): Promise<HTMLCanvasElement> => {
    return new Promise((resolve) => {
      const W = 842;
      const H = 1191;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);

      // Border
      ctx.strokeStyle = "#1a3a5c";
      ctx.lineWidth = 3;
      ctx.strokeRect(15, 15, W - 30, H - 30);
      ctx.strokeStyle = "#2d5f8a";
      ctx.lineWidth = 1;
      ctx.strokeRect(20, 20, W - 40, H - 40);

      const estadoNome = UF_EXTENSO[ufEscola] || ufEscola;

      // Header section
      ctx.fillStyle = "#1a3a5c";
      ctx.fillRect(25, 25, W - 50, 80);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`GOVERNO DO ESTADO DE ${estadoNome}`, W / 2, 50);
      ctx.font = "bold 12px Arial";
      ctx.fillText("SECRETARIA DE ESTADO DA EDUCAÇÃO", W / 2, 68);
      ctx.font = "11px Arial";
      ctx.fillText("HISTÓRICO ESCOLAR DO ENSINO " + (nivel === "Ensino Médio" ? "MÉDIO" : "FUNDAMENTAL"), W / 2, 85);

      // Draw brasão if available
      const drawContent = () => {
        let y = 120;

        // Title
        ctx.fillStyle = "#1a3a5c";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("HISTÓRICO ESCOLAR", W / 2, y);
        y += 25;

        // School info box
        ctx.strokeStyle = "#1a3a5c";
        ctx.lineWidth = 1;
        ctx.strokeRect(30, y, W - 60, 75);
        ctx.fillStyle = "#f0f4f8";
        ctx.fillRect(31, y + 1, W - 62, 73);

        ctx.fillStyle = "#333333";
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "left";
        ctx.fillText("ESTABELECIMENTO DE ENSINO:", 40, y + 16);
        ctx.font = "11px Arial";
        ctx.fillStyle = "#000000";
        ctx.fillText(escola, 200, y + 16);

        ctx.fillStyle = "#333333";
        ctx.font = "bold 10px Arial";
        ctx.fillText("ENDEREÇO:", 40, y + 32);
        ctx.font = "11px Arial";
        ctx.fillStyle = "#000000";
        ctx.fillText(enderecoEscola, 110, y + 32);

        ctx.fillStyle = "#333333";
        ctx.font = "bold 10px Arial";
        ctx.fillText("MUNICÍPIO:", 40, y + 48);
        ctx.font = "11px Arial";
        ctx.fillStyle = "#000000";
        ctx.fillText(`${cidadeEscola} - ${ufEscola}`, 115, y + 48);

        ctx.fillStyle = "#333333";
        ctx.font = "bold 10px Arial";
        ctx.fillText("CÓDIGO INEP:", 450, y + 48);
        ctx.font = "11px Arial";
        ctx.fillStyle = "#000000";
        ctx.fillText(codigoINEP, 540, y + 48);

        ctx.fillStyle = "#333333";
        ctx.font = "bold 10px Arial";
        ctx.fillText("TURNO:", 40, y + 64);
        ctx.font = "11px Arial";
        ctx.fillStyle = "#000000";
        ctx.fillText(turno, 85, y + 64);

        ctx.fillStyle = "#333333";
        ctx.font = "bold 10px Arial";
        ctx.fillText("ANO DE CONCLUSÃO:", 250, y + 64);
        ctx.font = "11px Arial";
        ctx.fillStyle = "#000000";
        ctx.fillText(anoConclusao, 390, y + 64);

        y += 90;

        // Student info box
        ctx.strokeStyle = "#1a3a5c";
        ctx.strokeRect(30, y, W - 60, 80);
        ctx.fillStyle = "#f0f4f8";
        ctx.fillRect(31, y + 1, W - 62, 78);

        ctx.fillStyle = "#1a3a5c";
        ctx.font = "bold 11px Arial";
        ctx.textAlign = "center";
        ctx.fillText("DADOS DO ALUNO", W / 2, y + 14);

        ctx.textAlign = "left";
        ctx.fillStyle = "#333333";
        ctx.font = "bold 10px Arial";
        ctx.fillText("NOME:", 40, y + 30);
        ctx.font = "11px Arial";
        ctx.fillStyle = "#000000";
        ctx.fillText(nomeAluno, 80, y + 30);

        ctx.fillStyle = "#333333";
        ctx.font = "bold 10px Arial";
        ctx.fillText("DATA NASC.:", 40, y + 46);
        ctx.font = "11px Arial";
        ctx.fillStyle = "#000000";
        ctx.fillText(dataNascimento, 115, y + 46);

        ctx.fillStyle = "#333333";
        ctx.font = "bold 10px Arial";
        ctx.fillText("NATURALIDADE:", 280, y + 46);
        ctx.font = "11px Arial";
        ctx.fillStyle = "#000000";
        ctx.fillText(naturalidade, 380, y + 46);

        ctx.fillStyle = "#333333";
        ctx.font = "bold 10px Arial";
        ctx.fillText("RG:", 600, y + 46);
        ctx.font = "11px Arial";
        ctx.fillStyle = "#000000";
        ctx.fillText(rg, 620, y + 46);

        ctx.fillStyle = "#333333";
        ctx.font = "bold 10px Arial";
        ctx.fillText("FILIAÇÃO:", 40, y + 62);
        ctx.font = "11px Arial";
        ctx.fillStyle = "#000000";
        ctx.fillText(`${nomePai} / ${nomeMae}`, 100, y + 62);

        ctx.fillStyle = "#333333";
        ctx.font = "bold 10px Arial";
        ctx.fillText("R.A.:", 40, y + 76);
        ctx.font = "11px Arial";
        ctx.fillStyle = "#000000";
        ctx.fillText(ra, 72, y + 76);

        y += 95;

        // Grades table header
        const colWidths = [220, 65, 65, 65, 65, 70, 55, 130];
        const headers = ["COMPONENTE CURRICULAR", "1º BIM", "2º BIM", "3º BIM", "4º BIM", "MÉDIA", "FALTAS", "RESULTADO"];
        const tableX = 30;
        const tableW = W - 60;

        // Header row
        ctx.fillStyle = "#1a3a5c";
        ctx.fillRect(tableX, y, tableW, 22);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px Arial";
        ctx.textAlign = "center";
        let cx = tableX;
        headers.forEach((h, i) => {
          ctx.fillText(h, cx + colWidths[i] / 2, y + 15);
          cx += colWidths[i];
        });
        y += 22;

        // Subject rows
        materias.forEach((m, idx) => {
          const rowH = 20;
          ctx.fillStyle = idx % 2 === 0 ? "#f8fafc" : "#eef2f7";
          ctx.fillRect(tableX, y, tableW, rowH);
          ctx.strokeStyle = "#d0d5dd";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(tableX, y, tableW, rowH);

          ctx.fillStyle = "#000000";
          ctx.font = "10px Arial";
          ctx.textAlign = "left";
          let xx = tableX;
          ctx.fillText(m.nome, xx + 6, y + 14);
          xx += colWidths[0];

          ctx.textAlign = "center";
          [m.nota1, m.nota2, m.nota3, m.nota4, m.media, m.faltas].forEach((val, vi) => {
            ctx.fillText(val, xx + colWidths[vi + 1] / 2, y + 14);
            xx += colWidths[vi + 1];
          });

          ctx.fillStyle = m.resultado === "Aprovado" ? "#16a34a" : "#dc2626";
          ctx.font = "bold 9px Arial";
          ctx.fillText(m.resultado, xx + colWidths[7] / 2, y + 14);

          y += rowH;
        });

        // Table border
        ctx.strokeStyle = "#1a3a5c";
        ctx.lineWidth = 1;
        ctx.strokeRect(tableX, y - (materias.length * 20) - 22, tableW, (materias.length * 20) + 22);

        // Column dividers
        cx = tableX;
        colWidths.forEach((w, i) => {
          if (i > 0) {
            ctx.beginPath();
            ctx.moveTo(cx, y - (materias.length * 20) - 22);
            ctx.lineTo(cx, y);
            ctx.strokeStyle = "#d0d5dd";
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
          cx += w;
        });

        y += 30;

        // Footer: signatures
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 0.5;

        // Director signature
        ctx.beginPath();
        ctx.moveTo(80, y + 40);
        ctx.lineTo(320, y + 40);
        ctx.stroke();
        ctx.fillStyle = "#000000";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(diretor, 200, y + 54);
        ctx.font = "bold 9px Arial";
        ctx.fillText("DIRETOR(A)", 200, y + 66);

        // Secretary signature
        ctx.beginPath();
        ctx.moveTo(500, y + 40);
        ctx.lineTo(740, y + 40);
        ctx.stroke();
        ctx.font = "10px Arial";
        ctx.fillText(secretario, 620, y + 54);
        ctx.font = "bold 9px Arial";
        ctx.fillText("SECRETÁRIO(A)", 620, y + 66);

        y += 85;

        // Date
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "#000000";
        ctx.fillText(`${cidadeEscola}, ${dataEmissao}`, W / 2, y);

        // Watermark
        if (withWatermark) {
          ctx.save();
          ctx.globalAlpha = 0.12;
          ctx.font = "bold 60px Arial";
          ctx.fillStyle = "#ff0000";
          ctx.textAlign = "center";
          ctx.translate(W / 2, H / 2);
          ctx.rotate(-Math.PI / 4);
          for (let i = -2; i <= 2; i++) {
            ctx.fillText("BELLARUS NÃO COPIE", 0, i * 120);
          }
          ctx.restore();
        }

        resolve(canvas);
      };

      // Draw brasão if available
      if (brasaoUrl) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const bSize = 50;
          ctx.drawImage(img, W / 2 - bSize / 2, 25 + 10, bSize, bSize);
          drawContent();
        };
        img.onerror = () => drawContent();
        img.src = brasaoUrl;
      } else {
        drawContent();
      }
    });
  }, [nomeAluno, dataNascimento, naturalidade, nacionalidade, nomePai, nomeMae, rg, ra, escola, enderecoEscola, cidadeEscola, ufEscola, codigoINEP, nivel, turno, anoConclusao, diretor, secretario, dataEmissao, materias, brasaoUrl]);

  const handleConfirm = async () => {
    if (!user) { toast.error("Faça login primeiro."); return; }
    setGenerating(true);
    try {
      const { data: profile } = await supabase.from("profiles").select("credits").eq("id", user.id).single();
      if (!profile || profile.credits < 1) { toast.error("Créditos insuficientes."); setGenerating(false); return; }

      await supabase.from("profiles").update({ credits: profile.credits - 1 }).eq("id", user.id);

      const canvas = await drawHistorico(false);
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
      pdf.save(`historico-escolar-${nomeAluno.replace(/\s+/g, "-").toLowerCase()}.pdf`);

      toast.success("Histórico Escolar gerado com sucesso! 1 crédito debitado.");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar PDF.");
    }
    setGenerating(false);
  };

  // Preview step
  if (step === "preview") {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <Button variant="outline" onClick={() => setStep("form")} className="gap-2"><ArrowLeft className="w-4 h-4" />Voltar ao Formulário</Button>
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-xl font-display font-bold text-primary text-center">Prévia — Histórico Escolar</h2>
          <p className="text-xs text-muted-foreground text-center">Prévia com marca d'água. Pague 1 crédito para gerar o PDF final.</p>
          <div className="bg-card border border-border rounded-xl overflow-hidden flex justify-center p-4">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto border border-border/50 shadow-lg"
              style={{ maxHeight: "75vh" }}
            />
          </div>
          <Button onClick={handleConfirm} disabled={generating} className="w-full navy-gradient text-primary-foreground font-semibold py-5 text-base">
            <Download className="w-5 h-5 mr-2" />
            {generating ? "Gerando..." : "Gerar PDF Final — 1 Crédito"}
          </Button>
        </div>
      </div>
    );
  }

  // Render preview canvas when entering preview
  if (step === "preview" && canvasRef.current) {
    drawHistorico(true).then(canvas => {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx && canvasRef.current) {
        canvasRef.current.width = canvas.width;
        canvasRef.current.height = canvas.height;
        ctx.drawImage(canvas, 0, 0);
      }
    });
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/dashboard/documents")} className="gap-2"><ArrowLeft className="w-4 h-4" />Voltar</Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 border-accent/50 text-accent text-xs h-8 px-3" onClick={fillTest}><Zap className="w-3.5 h-3.5" /> Teste</Button>
          <Button variant="outline" size="sm" className="gap-1.5 border-destructive/50 text-destructive text-xs h-8 px-3" onClick={clearAll}><Trash2 className="w-3.5 h-3.5" /> Excluir</Button>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary/20 text-primary"><Sparkles className="w-3 h-3" />1 crédito</span>
        </div>
      </div>

      {/* Title */}
      <div className="glass-card p-8 text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-display font-bold text-primary">Histórico Escolar</h2>
        <p className="text-xs text-muted-foreground">Preencha os dados para gerar o histórico escolar completo</p>
      </div>

      {/* Student Data */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-display font-bold text-primary flex items-center gap-2"><Shield className="w-4 h-4" /> Dados do Aluno</h3>
        <div><Label className="text-sm font-semibold text-primary">Nome Completo *</Label><Input value={nomeAluno} onChange={e => setNomeAluno(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Data de Nascimento</Label><Input value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} placeholder="DD/MM/AAAA" className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">Naturalidade</Label><Input value={naturalidade} onChange={e => setNaturalidade(e.target.value.toUpperCase())} placeholder="CIDADE - UF" className="mt-1.5 bg-secondary/50" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm font-semibold text-primary">RG</Label><Input value={rg} onChange={e => setRg(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">R.A. (Registro do Aluno)</Label><Input value={ra} onChange={e => setRa(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
        </div>
        <div><Label className="text-sm font-semibold text-primary">Nome do Pai</Label><Input value={nomePai} onChange={e => setNomePai(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
        <div><Label className="text-sm font-semibold text-primary">Nome da Mãe</Label><Input value={nomeMae} onChange={e => setNomeMae(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
      </div>

      {/* School Data */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-display font-bold text-primary flex items-center gap-2"><BookOpen className="w-4 h-4" /> Dados da Escola</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Cidade</Label><Input value={cidadeEscola} onChange={e => setCidadeEscola(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">UF</Label>
            <Select value={ufEscola} onValueChange={setUfEscola}>
              <SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="UF" /></SelectTrigger>
              <SelectContent>{UF_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div><Label className="text-sm font-semibold text-primary">Nome da Escola *</Label><Input value={escola} onChange={e => setEscola(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
        <div><Label className="text-sm font-semibold text-primary">Endereço da Escola</Label><Input value={enderecoEscola} onChange={e => setEnderecoEscola(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Nível *</Label>
            <Select value={nivel} onValueChange={setNivel}>
              <SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{NIVEIS.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-sm font-semibold text-primary">Turno</Label>
            <Select value={turno} onValueChange={setTurno}>
              <SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{TURNOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Código INEP</Label><Input value={codigoINEP} onChange={e => setCodigoINEP(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">Ano de Conclusão</Label><Input value={anoConclusao} onChange={e => setAnoConclusao(e.target.value)} placeholder="2024" className="mt-1.5 bg-secondary/50" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Diretor(a)</Label><Input value={diretor} onChange={e => setDiretor(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">Secretário(a)</Label><Input value={secretario} onChange={e => setSecretario(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
        </div>
        <div><Label className="text-sm font-semibold text-primary">Data de Emissão</Label><Input value={dataEmissao} onChange={e => setDataEmissao(e.target.value)} placeholder="DD/MM/AAAA" className="mt-1.5 bg-secondary/50" /></div>

        <Button variant="outline" onClick={handleAIFill} disabled={loading} className="w-full gap-2 border-accent/50 text-accent hover:bg-accent/10">
          <Wand2 className="w-4 h-4" />{loading ? "Gerando..." : "Preencher dados da escola com IA"}
        </Button>
      </div>

      {/* Brasão */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-display font-bold text-primary flex items-center gap-2"><Shield className="w-4 h-4" /> Brasão do Estado</h3>
        <p className="text-xs text-muted-foreground">Gere o brasão oficial do estado selecionado usando IA</p>
        {brasaoUrl && (
          <div className="flex justify-center">
            <img src={brasaoUrl} alt="Brasão" className="w-24 h-24 object-contain rounded-lg border border-border p-2 bg-card" />
          </div>
        )}
        <Button variant="outline" onClick={handleGenerateBrasao} disabled={brasaoLoading || !ufEscola} className="w-full gap-2 border-primary/50 text-primary hover:bg-primary/10">
          <Wand2 className="w-4 h-4" />{brasaoLoading ? "Gerando brasão..." : `Gerar Brasão${ufEscola ? ` de ${UF_EXTENSO[ufEscola] || ufEscola}` : ""} com IA`}
        </Button>
      </div>

      {/* Subjects / Grades */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-display font-bold text-primary flex items-center gap-2"><BookOpen className="w-4 h-4" /> Componentes Curriculares</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={addDefaultMaterias} disabled={!nivel}>
              <Wand2 className="w-3 h-3" /> Auto-preencher
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={addMateria}>
              <Plus className="w-3 h-3" /> Adicionar
            </Button>
          </div>
        </div>

        {materias.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Selecione o nível e clique em "Auto-preencher" ou adicione manualmente.</p>
        )}

        {materias.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-1 text-muted-foreground font-semibold">Matéria</th>
                  <th className="text-center py-2 px-1 text-muted-foreground font-semibold w-14">1º Bim</th>
                  <th className="text-center py-2 px-1 text-muted-foreground font-semibold w-14">2º Bim</th>
                  <th className="text-center py-2 px-1 text-muted-foreground font-semibold w-14">3º Bim</th>
                  <th className="text-center py-2 px-1 text-muted-foreground font-semibold w-14">4º Bim</th>
                  <th className="text-center py-2 px-1 text-muted-foreground font-semibold w-14">Média</th>
                  <th className="text-center py-2 px-1 text-muted-foreground font-semibold w-14">Faltas</th>
                  <th className="text-center py-2 px-1 text-muted-foreground font-semibold w-16">Result.</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {materias.map((m, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="py-1 px-1"><Input className="h-7 text-xs bg-secondary/50" value={m.nome} onChange={e => updateMateria(i, "nome", e.target.value)} /></td>
                    <td className="py-1 px-1"><Input className="h-7 text-xs text-center bg-secondary/50" value={m.nota1} onChange={e => updateMateria(i, "nota1", e.target.value)} /></td>
                    <td className="py-1 px-1"><Input className="h-7 text-xs text-center bg-secondary/50" value={m.nota2} onChange={e => updateMateria(i, "nota2", e.target.value)} /></td>
                    <td className="py-1 px-1"><Input className="h-7 text-xs text-center bg-secondary/50" value={m.nota3} onChange={e => updateMateria(i, "nota3", e.target.value)} /></td>
                    <td className="py-1 px-1"><Input className="h-7 text-xs text-center bg-secondary/50" value={m.nota4} onChange={e => updateMateria(i, "nota4", e.target.value)} /></td>
                    <td className="py-1 px-1 text-center font-bold text-foreground">{m.media}</td>
                    <td className="py-1 px-1"><Input className="h-7 text-xs text-center bg-secondary/50" value={m.faltas} onChange={e => updateMateria(i, "faltas", e.target.value)} /></td>
                    <td className="py-1 px-1 text-center">
                      <span className={`text-[10px] font-bold ${m.resultado === "Aprovado" ? "text-success" : "text-destructive"}`}>{m.resultado}</span>
                    </td>
                    <td className="py-1 px-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeMateria(i)}>
                        <X className="w-3 h-3 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview button */}
      <Button onClick={handlePreview} className="w-full navy-gradient text-primary-foreground font-semibold py-5 text-base">
        <Eye className="w-5 h-5 mr-2" />Visualizar Prévia
      </Button>
    </div>
  );
};

export default HistoricoEscolarForm;

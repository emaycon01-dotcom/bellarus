import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Shield, Users, Clock, Sparkles, Eye, TrendingUp, CheckCircle2, Shuffle } from "lucide-react";
import { toast } from "sonner";

const MESES = ["JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"];
const generateDigits = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");

const RendaForm = () => {
  const navigate = useNavigate();
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [cnpjEmpresa, setCnpjEmpresa] = useState("");
  const [nomeFuncionario, setNomeFuncionario] = useState("");
  const [cpfFuncionario, setCpfFuncionario] = useState("");
  const [cargo, setCargo] = useState("");
  const [dataAdmissao, setDataAdmissao] = useState("");
  const [mesReferencia, setMesReferencia] = useState("");
  const [anoReferencia, setAnoReferencia] = useState("2024");
  const [salarioBruto, setSalarioBruto] = useState("");
  const [inss, setInss] = useState("");
  const [irrf, setIrrf] = useState("");
  const [valeTransporte, setValeTransporte] = useState("");
  const [valeRefeicao, setValeRefeicao] = useState("");
  const [salarioLiquido, setSalarioLiquido] = useState("");
  const [matricula, setMatricula] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const handlePreview = () => { setShowPreview(true); toast.success("Preview gerado!"); };
  const handleConfirm = () => { toast.success("Documento confirmado! 1 crédito será debitado."); };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/dashboard/documents")} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary/20 text-primary"><Sparkles className="w-3 h-3" /> 1 Crédito</span>
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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success to-accent flex items-center justify-center mx-auto"><TrendingUp className="w-8 h-8 text-white" /></div>
        <h2 className="text-xl font-display font-bold text-primary">Comprovante de Renda</h2>
        <p className="text-sm text-muted-foreground">Recibo de pagamento de salário (Holerite)</p>
      </div>

      {!showPreview ? (
        <>
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-display font-bold text-foreground">Dados da Empresa</h3>
            </div>
            <div className="space-y-4">
              <div><Label className="text-sm font-semibold text-primary">Nome da Empresa <span className="text-destructive">*</span></Label><Input placeholder="Ex: EMPRESA LTDA" value={nomeEmpresa} onChange={(e) => setNomeEmpresa(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              <div><Label className="text-sm font-semibold text-primary">CNPJ <span className="text-destructive">*</span></Label><Input placeholder="00.000.000/0001-00" value={cnpjEmpresa} onChange={(e) => setCnpjEmpresa(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-display font-bold text-foreground">Dados do Funcionário</h3>
            </div>
            <div className="space-y-4">
              <div><Label className="text-sm font-semibold text-primary">Nome Completo <span className="text-destructive">*</span></Label><Input placeholder="Ex: PEDRO DA SILVA" value={nomeFuncionario} onChange={(e) => setNomeFuncionario(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              <div><Label className="text-sm font-semibold text-primary">CPF <span className="text-destructive">*</span></Label><Input placeholder="000.000.000-00" value={cpfFuncionario} onChange={(e) => setCpfFuncionario(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-semibold text-primary">Cargo <span className="text-destructive">*</span></Label><Input placeholder="Ex: ANALISTA DE SISTEMAS" value={cargo} onChange={(e) => setCargo(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
                <div>
                  <Label className="text-sm font-semibold text-primary">Matrícula</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input placeholder="000000" value={matricula} onChange={(e) => setMatricula(e.target.value)} className="bg-secondary/50" />
                    <Button variant="outline" size="sm" className="shrink-0 gap-1 border-primary/50 text-primary" onClick={() => setMatricula(generateDigits(6))}><Shuffle className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
              <div><Label className="text-sm font-semibold text-primary">Data de Admissão</Label><Input placeholder="DD/MM/AAAA" value={dataAdmissao} onChange={(e) => setDataAdmissao(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-display font-bold text-foreground">Valores</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-primary">Mês Referência <span className="text-destructive">*</span></Label>
                  <Select value={mesReferencia} onValueChange={setMesReferencia}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{MESES.map(m=><SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
                </div>
                <div><Label className="text-sm font-semibold text-primary">Ano</Label><Input placeholder="2024" value={anoReferencia} onChange={(e) => setAnoReferencia(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              </div>
              <div><Label className="text-sm font-semibold text-primary">Salário Bruto (R$) <span className="text-destructive">*</span></Label><Input placeholder="Ex: 5.000,00" value={salarioBruto} onChange={(e) => setSalarioBruto(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-semibold text-primary">INSS (R$)</Label><Input placeholder="Ex: 550,00" value={inss} onChange={(e) => setInss(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
                <div><Label className="text-sm font-semibold text-primary">IRRF (R$)</Label><Input placeholder="Ex: 200,00" value={irrf} onChange={(e) => setIrrf(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-semibold text-primary">Vale Transporte (R$)</Label><Input placeholder="Ex: 220,00" value={valeTransporte} onChange={(e) => setValeTransporte(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
                <div><Label className="text-sm font-semibold text-primary">Vale Refeição (R$)</Label><Input placeholder="Ex: 600,00" value={valeRefeicao} onChange={(e) => setValeRefeicao(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              </div>
              <div><Label className="text-sm font-semibold text-primary">Salário Líquido (R$) <span className="text-destructive">*</span></Label><Input placeholder="Ex: 4.250,00" value={salarioLiquido} onChange={(e) => setSalarioLiquido(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
            </div>
          </div>

          <div className="glass-card p-6 bg-muted/30 text-center">
            <Button size="lg" className="gap-2 bg-gradient-to-r from-success to-accent text-white" onClick={handlePreview}><Eye className="w-5 h-5" /> Gerar Preview</Button>
          </div>
        </>
      ) : (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-accent flex items-center justify-center"><Eye className="w-5 h-5 text-white" /></div>
              <h3 className="text-lg font-display font-bold text-foreground">Preview Holerite</h3>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowPreview(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Editar</Button>
          </div>
          <div className="rounded-2xl border-2 border-success/30 bg-gradient-to-br from-card via-card to-success/5 p-6 space-y-5 relative overflow-hidden">
            <div className="text-center space-y-1 border-b border-border pb-4">
              <h3 className="text-lg font-display font-bold text-foreground">{nomeEmpresa || "EMPRESA"}</h3>
              <p className="text-xs font-mono text-muted-foreground">CNPJ: {cnpjEmpresa || "---"}</p>
              <p className="text-sm font-bold text-primary">RECIBO DE PAGAMENTO - {mesReferencia}/{anoReferencia}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Funcionário</p><p className="text-sm font-bold text-foreground">{nomeFuncionario || "---"}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">CPF</p><p className="text-sm font-mono text-foreground">{cpfFuncionario || "---"}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Cargo</p><p className="text-sm text-foreground">{cargo || "---"}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Matrícula</p><p className="text-sm font-mono text-foreground">{matricula || "---"}</p></div>
            </div>
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Salário Bruto</span><span className="font-bold text-foreground">R$ {salarioBruto || "0,00"}</span></div>
              {valeRefeicao && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Vale Refeição</span><span className="text-success">+ R$ {valeRefeicao}</span></div>}
              {valeTransporte && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Vale Transporte</span><span className="text-success">+ R$ {valeTransporte}</span></div>}
              {inss && <div className="flex justify-between text-sm"><span className="text-muted-foreground">INSS</span><span className="text-destructive">- R$ {inss}</span></div>}
              {irrf && <div className="flex justify-between text-sm"><span className="text-muted-foreground">IRRF</span><span className="text-destructive">- R$ {irrf}</span></div>}
              <div className="flex justify-between text-sm font-bold border-t border-border pt-2 mt-2"><span>Salário Líquido</span><span className="text-success text-lg">R$ {salarioLiquido || "0,00"}</span></div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="lg" onClick={() => setShowPreview(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Editar</Button>
            <Button size="lg" className="gap-2 bg-gradient-to-r from-success to-accent text-white" onClick={handleConfirm}><CheckCircle2 className="w-5 h-5" /> Confirmar (1 Crédito)</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RendaForm;

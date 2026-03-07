import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Home, Sparkles, Eye, Download, Wand2, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const UF_OPTIONS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const TIPO_OPTIONS = ["Conta de Energia", "Conta de Água", "Conta de Gás", "Conta de Telefone/Internet"];

const ResidenciaForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "preview">("form");
  const [loading, setLoading] = useState(false);

  const [tipoComprovante, setTipoComprovante] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpf, setCpf] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [cep, setCep] = useState("");
  const [mesReferencia, setMesReferencia] = useState("");
  const [valor, setValor] = useState("");
  const [codigoCliente, setCodigoCliente] = useState("");
  const [empresa, setEmpresa] = useState("");

  const formatCPF = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  const formatCEP = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 8);
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)}-${d.slice(5)}`;
  };

  const handleAIFill = async () => {
    if (!tipoComprovante || !cidade || !uf) { toast.error("Preencha tipo, cidade e UF primeiro."); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("medical-ai", {
        body: {
          type: "custom",
          prompt: `Gere dados fictícios realistas para um comprovante de residência do tipo "${tipoComprovante}" na cidade de ${cidade}-${uf}. Retorne APENAS um JSON: {"empresa":"nome da empresa fornecedora","codigoCliente":"código numérico de 10 dígitos","mesReferencia":"mês/ano","valor":"valor em reais com centavos","bairro":"nome do bairro realista","rua":"nome de rua realista","cep":"CEP formatado"}`,
        },
      });
      if (data?.result) {
        try {
          const json = JSON.parse(data.result.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
          if (json.empresa) setEmpresa(json.empresa);
          if (json.codigoCliente) setCodigoCliente(json.codigoCliente);
          if (json.mesReferencia) setMesReferencia(json.mesReferencia);
          if (json.valor) setValor(json.valor);
          if (json.bairro && !bairro) setBairro(json.bairro);
          if (json.rua && !rua) setRua(json.rua);
          if (json.cep && !cep) setCep(json.cep);
          toast.success("Dados preenchidos com IA!");
        } catch { toast.error("Erro ao processar resposta da IA."); }
      }
    } catch { toast.error("Erro ao conectar com IA."); }
    setLoading(false);
  };

  const fillTest = () => {
    setTipoComprovante("Conta de Energia"); setNomeCompleto("PATRICIA SOUZA LIMA"); setCpf("123.456.789-00");
    setRua("RUA DAS ACÁCIAS"); setNumero("456"); setComplemento("APTO 12"); setBairro("JARDIM PAULISTA");
    setCidade("SÃO PAULO"); setUf("SP"); setCep("01310-100"); setMesReferencia("MARÇO/2026");
    setValor("R$ 185,50"); setCodigoCliente(generateDigits(10)); setEmpresa("ENEL DISTRIBUIÇÃO SÃO PAULO");
    toast.success("Campos preenchidos com dados de teste!");
  };
  const clearAll = () => {
    setTipoComprovante(""); setNomeCompleto(""); setCpf(""); setRua(""); setNumero(""); setComplemento("");
    setBairro(""); setCidade(""); setUf(""); setCep(""); setMesReferencia(""); setValor("");
    setCodigoCliente(""); setEmpresa("");
    toast.success("Campos limpos!");
  };
  const handlePreview = () => {
    if (!nomeCompleto || !rua || !numero || !cidade || !uf) { toast.error("Preencha os campos obrigatórios."); return; }
    setStep("preview");
  };

  const handleConcluir = () => { toast.success("Comprovante de Residência gerado com sucesso!"); };

  if (step === "preview") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto pb-12">
        <Button variant="outline" onClick={() => setStep("form")} className="gap-2"><ArrowLeft className="w-4 h-4" />Voltar</Button>
        <div className="glass-card p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-display font-bold text-primary">Prévia — Comprovante de Residência</h2>
          </div>
          <div className="border border-border rounded-xl p-6 space-y-3 bg-card/50">
            {empresa && <div className="text-center pb-3 border-b border-border"><p className="font-bold text-foreground text-lg">{empresa}</p><p className="text-xs text-muted-foreground">{tipoComprovante}</p></div>}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground text-xs">Titular</span><p className="font-semibold text-foreground">{nomeCompleto}</p></div>
              <div><span className="text-muted-foreground text-xs">CPF</span><p className="font-semibold text-foreground">{cpf}</p></div>
              <div className="col-span-2"><span className="text-muted-foreground text-xs">Endereço</span><p className="font-semibold text-foreground">{rua}, {numero}{complemento ? `, ${complemento}` : ""}</p><p className="text-foreground">{bairro} — {cidade}/{uf} — CEP: {cep}</p></div>
              <div><span className="text-muted-foreground text-xs">Mês Referência</span><p className="font-semibold text-foreground">{mesReferencia}</p></div>
              <div><span className="text-muted-foreground text-xs">Valor</span><p className="font-semibold text-foreground">{valor}</p></div>
              <div><span className="text-muted-foreground text-xs">Código Cliente</span><p className="font-semibold text-foreground">{codigoCliente}</p></div>
            </div>
          </div>
          <Button onClick={handleConcluir} className="w-full navy-gradient text-primary-foreground font-semibold py-5 text-base"><Download className="w-5 h-5 mr-2" />Concluir e Gerar PDF — 1 Crédito</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/dashboard/documents")} className="gap-2"><ArrowLeft className="w-4 h-4" />Voltar</Button>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary/20 text-primary"><Sparkles className="w-3 h-3" />1 crédito</span>
      </div>

      <div className="glass-card p-8 text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl navy-gradient flex items-center justify-center mx-auto"><Home className="w-8 h-8 text-primary-foreground" /></div>
        <h2 className="text-xl font-display font-bold text-primary">Comprovante de Residência</h2>
        <p className="text-sm text-muted-foreground">Preencha os dados do endereço para gerar o comprovante</p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div><Label className="text-sm font-semibold text-primary">Tipo de Comprovante *</Label>
          <Select value={tipoComprovante} onValueChange={setTipoComprovante}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{TIPO_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
        </div>
        <div><Label className="text-sm font-semibold text-primary">Nome Completo (Titular) *</Label><Input value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value.toUpperCase())} placeholder="NOME COMPLETO" className="mt-1.5 bg-secondary/50" /></div>
        <div><Label className="text-sm font-semibold text-primary">CPF</Label><Input value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} placeholder="000.000.000-00" className="mt-1.5 bg-secondary/50" maxLength={14} /></div>

        <div className="border-t border-border pt-4"><h3 className="text-sm font-bold text-foreground mb-3">Endereço</h3></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2"><Label className="text-sm font-semibold text-primary">Rua / Logradouro *</Label><Input value={rua} onChange={(e) => setRua(e.target.value.toUpperCase())} placeholder="RUA EXEMPLO" className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">Número *</Label><Input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="123" className="mt-1.5 bg-secondary/50" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Complemento</Label><Input value={complemento} onChange={(e) => setComplemento(e.target.value.toUpperCase())} placeholder="APTO 101" className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">Bairro *</Label><Input value={bairro} onChange={(e) => setBairro(e.target.value.toUpperCase())} placeholder="BAIRRO" className="mt-1.5 bg-secondary/50" /></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Cidade *</Label><Input value={cidade} onChange={(e) => setCidade(e.target.value.toUpperCase())} placeholder="CIDADE" className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">UF *</Label>
            <Select value={uf} onValueChange={setUf}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="UF" /></SelectTrigger><SelectContent>{UF_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select>
          </div>
          <div><Label className="text-sm font-semibold text-primary">CEP</Label><Input value={cep} onChange={(e) => setCep(formatCEP(e.target.value))} placeholder="00000-000" className="mt-1.5 bg-secondary/50" maxLength={9} /></div>
        </div>

        <div className="border-t border-border pt-4"><h3 className="text-sm font-bold text-foreground mb-3">Dados da Conta</h3></div>
        <div><Label className="text-sm font-semibold text-primary">Empresa Fornecedora</Label><Input value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Nome da empresa" className="mt-1.5 bg-secondary/50" /></div>
        <div className="grid grid-cols-3 gap-4">
          <div><Label className="text-sm font-semibold text-primary">Mês Referência</Label><Input value={mesReferencia} onChange={(e) => setMesReferencia(e.target.value)} placeholder="01/2025" className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">Valor</Label><Input value={valor} onChange={(e) => setValor(e.target.value)} placeholder="R$ 150,00" className="mt-1.5 bg-secondary/50" /></div>
          <div><Label className="text-sm font-semibold text-primary">Cód. Cliente</Label><Input value={codigoCliente} onChange={(e) => setCodigoCliente(e.target.value)} placeholder="0000000000" className="mt-1.5 bg-secondary/50" /></div>
        </div>

        <Button variant="outline" onClick={handleAIFill} disabled={loading} className="w-full gap-2 border-accent/50 text-accent hover:bg-accent/10">
          <Wand2 className="w-4 h-4" />{loading ? "Gerando com IA..." : "Preencher dados com IA"}
        </Button>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="gap-2 border-accent/50 text-accent flex-1" onClick={fillTest}><Zap className="w-5 h-5" /> Teste</Button>
        <Button onClick={handlePreview} className="flex-[2] navy-gradient text-primary-foreground font-semibold py-5 text-base"><Eye className="w-5 h-5 mr-2" />Visualizar Prévia</Button>
        <Button variant="outline" className="gap-2 border-destructive/50 text-destructive flex-1" onClick={clearAll}><Trash2 className="w-5 h-5" /> Excluir</Button>
      </div>
    </div>
  );
};

export default ResidenciaForm;

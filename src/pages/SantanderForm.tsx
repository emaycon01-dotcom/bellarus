import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Shield, Users, Clock, Sparkles, Eye, Landmark, CheckCircle2, Shuffle, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { saveDocumentHistory } from "@/lib/saveDocumentHistory";

const TIPO_OPERACAO = ["PIX ENVIADO", "PIX RECEBIDO", "TRANSFERÊNCIA", "TED", "DOC", "PAGAMENTO DE BOLETO"];
const generateDigits = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");

const SantanderForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [nomeRemetente, setNomeRemetente] = useState("");
  const [cpfRemetente, setCpfRemetente] = useState("");
  const [agenciaRemetente, setAgenciaRemetente] = useState("");
  const [contaRemetente, setContaRemetente] = useState("");
  const [nomeDestinatario, setNomeDestinatario] = useState("");
  const [cpfDestinatario, setCpfDestinatario] = useState("");
  const [bancoDestinatario, setBancoDestinatario] = useState("");
  const [tipoOperacao, setTipoOperacao] = useState("");
  const [valor, setValor] = useState("");
  const [dataOperacao, setDataOperacao] = useState("");
  const [horaOperacao, setHoraOperacao] = useState("");
  const [codigoAutenticacao, setCodigoAutenticacao] = useState("");
  const [descricao, setDescricao] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const fillTest = () => {
    setNomeRemetente("JOÃO SILVA OLIVEIRA"); setCpfRemetente("567.890.123-45");
    setAgenciaRemetente("3456"); setContaRemetente("01098765-0");
    setNomeDestinatario("MARIANA COSTA FERREIRA"); setCpfDestinatario("678.901.234-56");
    setBancoDestinatario("BANCO DO BRASIL"); setTipoOperacao("PIX ENVIADO");
    setValor("R$ 1.250,00"); setDataOperacao("15/03/2026"); setHoraOperacao("14:32");
    setCodigoAutenticacao(generateDigits(20)); setDescricao("Pagamento de serviços");
    toast.success("Campos preenchidos com dados de teste!");
  };
  const clearAll = () => {
    setNomeRemetente(""); setCpfRemetente(""); setAgenciaRemetente(""); setContaRemetente("");
    setNomeDestinatario(""); setCpfDestinatario(""); setBancoDestinatario(""); setTipoOperacao("");
    setValor(""); setDataOperacao(""); setHoraOperacao(""); setCodigoAutenticacao(""); setDescricao("");
    toast.success("Campos limpos!");
  };
  const handlePreview = () => { setShowPreview(true); toast.success("Preview gerado!"); };
  const handleConfirm = () => { if (user) saveDocumentHistory(user.id, "Comprovante Santander", nomeRemetente || "Sem nome"); toast.success("Documento confirmado! 1 crédito será debitado."); };

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
        {[{ icon: Shield, label: "Documento Seguro", desc: "Autenticação oficial" },{ icon: Users, label: "Processo Rápido", desc: "Conclua em minutos" },{ icon: Clock, label: "Validade 45 Dias", desc: "Tempo garantido" }].map((f) => (
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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-destructive to-warning flex items-center justify-center mx-auto"><Landmark className="w-8 h-8 text-white" /></div>
        <h2 className="text-xl font-display font-bold text-primary">Comprovante Santander</h2>
        <p className="text-sm text-muted-foreground">Comprovante bancário do Banco Santander</p>
      </div>

      {!showPreview ? (
        <>
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Landmark className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-display font-bold text-foreground">Dados do Remetente</h3>
            </div>
            <div className="space-y-4">
              <div><Label className="text-sm font-semibold text-primary">Nome Completo <span className="text-destructive">*</span></Label><Input placeholder="Ex: PEDRO DA SILVA" value={nomeRemetente} onChange={(e) => setNomeRemetente(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              <div><Label className="text-sm font-semibold text-primary">CPF <span className="text-destructive">*</span></Label><Input placeholder="000.000.000-00" value={cpfRemetente} onChange={(e) => setCpfRemetente(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-semibold text-primary">Agência</Label><Input placeholder="0001" value={agenciaRemetente} onChange={(e) => setAgenciaRemetente(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
                <div><Label className="text-sm font-semibold text-primary">Conta</Label><Input placeholder="00000000-0" value={contaRemetente} onChange={(e) => setContaRemetente(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-display font-bold text-foreground">Dados do Destinatário</h3>
            </div>
            <div className="space-y-4">
              <div><Label className="text-sm font-semibold text-primary">Nome <span className="text-destructive">*</span></Label><Input placeholder="Ex: MARIA DA SILVA" value={nomeDestinatario} onChange={(e) => setNomeDestinatario(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
              <div><Label className="text-sm font-semibold text-primary">CPF/CNPJ</Label><Input placeholder="000.000.000-00" value={cpfDestinatario} onChange={(e) => setCpfDestinatario(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              <div><Label className="text-sm font-semibold text-primary">Banco Destinatário</Label><Input placeholder="Ex: NUBANK, ITAÚ, BRADESCO" value={bancoDestinatario} onChange={(e) => setBancoDestinatario(e.target.value.toUpperCase())} className="mt-1.5 bg-secondary/50" /></div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-display font-bold text-foreground">Dados da Operação</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-primary">Tipo de Operação <span className="text-destructive">*</span></Label>
                <Select value={tipoOperacao} onValueChange={setTipoOperacao}><SelectTrigger className="mt-1.5 bg-secondary/50"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{TIPO_OPERACAO.map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
              </div>
              <div><Label className="text-sm font-semibold text-primary">Valor (R$) <span className="text-destructive">*</span></Label><Input placeholder="Ex: 1.500,00" value={valor} onChange={(e) => setValor(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-semibold text-primary">Data</Label><Input placeholder="DD/MM/AAAA" value={dataOperacao} onChange={(e) => setDataOperacao(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
                <div><Label className="text-sm font-semibold text-primary">Hora</Label><Input placeholder="HH:MM" value={horaOperacao} onChange={(e) => setHoraOperacao(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-primary">Código de Autenticação</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input placeholder="E2B..." value={codigoAutenticacao} onChange={(e) => setCodigoAutenticacao(e.target.value)} className="bg-secondary/50" />
                  <Button variant="outline" size="sm" className="shrink-0 gap-1 border-primary/50 text-primary" onClick={() => setCodigoAutenticacao(`E2B${generateDigits(20)}`)}><Shuffle className="w-4 h-4" /></Button>
                </div>
              </div>
              <div><Label className="text-sm font-semibold text-foreground">Descrição</Label><Input placeholder="Ex: Pagamento de serviço" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="mt-1.5 bg-secondary/50" /></div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Button size="lg" className="gap-2 bg-gradient-to-r from-destructive to-warning text-white" onClick={handlePreview}><Eye className="w-5 h-5" /> Gerar Preview</Button>
          </div>
        </>
      ) : (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-destructive to-warning flex items-center justify-center"><Eye className="w-5 h-5 text-white" /></div>
              <h3 className="text-lg font-display font-bold text-foreground">Preview Comprovante</h3>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowPreview(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Editar</Button>
          </div>
          <div className="rounded-2xl border-2 border-destructive/30 bg-gradient-to-br from-card via-card to-destructive/5 p-6 space-y-5 relative overflow-hidden">
            <div className="text-center space-y-1 border-b border-border pb-4">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-destructive">SANTANDER</p>
              <h3 className="text-lg font-display font-bold text-foreground">COMPROVANTE DE {tipoOperacao || "OPERAÇÃO"}</h3>
              <p className="text-xs text-muted-foreground">{dataOperacao} às {horaOperacao}</p>
            </div>
            <div className="space-y-4 relative">
              <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-center">
                <p className="text-xs text-muted-foreground uppercase">Valor</p>
                <p className="text-2xl font-bold text-success">R$ {valor || "0,00"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground">De</p>
                  <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Nome</p><p className="text-sm font-bold text-foreground">{nomeRemetente || "---"}</p></div>
                  <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">CPF</p><p className="text-sm font-mono text-foreground">{cpfRemetente || "---"}</p></div>
                  <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ag/Conta</p><p className="text-sm font-mono text-foreground">{agenciaRemetente}/{contaRemetente || "---"}</p></div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Para</p>
                  <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Nome</p><p className="text-sm font-bold text-foreground">{nomeDestinatario || "---"}</p></div>
                  <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">CPF/CNPJ</p><p className="text-sm font-mono text-foreground">{cpfDestinatario || "---"}</p></div>
                  <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Banco</p><p className="text-sm text-foreground">{bancoDestinatario || "---"}</p></div>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Autenticação</p>
                <p className="text-xs font-mono text-primary break-all">{codigoAutenticacao || "---"}</p>
              </div>
              {descricao && <div className="border-t border-border pt-4"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Descrição</p><p className="text-sm text-foreground">{descricao}</p></div>}
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="lg" onClick={() => setShowPreview(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Editar</Button>
            <Button size="lg" className="gap-2 bg-gradient-to-r from-destructive to-warning text-white" onClick={handleConfirm}><CheckCircle2 className="w-5 h-5" /> Confirmar (1 Crédito)</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SantanderForm;

import { useSearchParams, useNavigate } from "react-router-dom";
import { Copy, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const PIX_KEY = "de70d50c-ce31-4ef1-bff5-5cfaccb26a7a";
const WHATSAPP_LINK = "https://wa.me/message/W3POEZOTHB2AK1";

const ResellerPayment = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") || "Revendedor";
  const price = searchParams.get("price") || "R$ 50";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Pagamento do Plano</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Finalize a compra do plano <span className="font-semibold text-foreground">{plan}</span>
        </p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-sm">Plano selecionado</span>
          <span className="font-display font-bold text-foreground">{plan}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-sm">Valor</span>
          <span className="text-2xl font-bold text-foreground">{price}</span>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="font-display font-semibold text-foreground">Pague via PIX</h3>
        <p className="text-xs text-muted-foreground">
          Copie a chave PIX abaixo e realize o pagamento pelo seu banco
        </p>
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3 border border-border">
          <code className="text-xs text-foreground flex-1 break-all select-all">{PIX_KEY}</code>
          <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        {copied && (
          <p className="text-xs text-green-500 font-medium">Chave copiada!</p>
        )}
      </div>

      <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
        <Button className="w-full navy-gradient text-primary-foreground font-semibold py-5 text-base">
          <MessageCircle className="w-5 h-5 mr-2" />
          Concluir Pagamento — Falar no WhatsApp
        </Button>
      </a>
    </div>
  );
};

export default ResellerPayment;

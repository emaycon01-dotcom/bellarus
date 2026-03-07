import { useState, useMemo } from "react";
import { Crown, Star, Shield, Zap, Sparkles, Lock, QrCode, Clock, MessageCircle, Copy, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import { generatePixPayload, PIX_KEY } from "@/lib/pix";
import bellarusGlobe from "@/assets/bellarus-globe.png";

const plans = [
  {
    title: "Dealer",
    price: 120,
    icon: Star,
    benefit: "35% de desconto em todos os documentos",
    color: "from-cyan-500 to-blue-600",
    shadow: "shadow-cyan-500/20",
  },
  {
    title: "Master",
    price: 300,
    icon: Shield,
    benefit: "50% de desconto em todos os documentos",
    color: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-500/20",
    popular: true,
  },
  {
    title: "Diamont",
    price: 500,
    icon: Crown,
    benefit: "Documentos gratuitos — custo zero!",
    color: "from-amber-400 to-yellow-500",
    shadow: "shadow-amber-400/20",
  },
];

const WHATSAPP_LINK = "https://wa.me/message/W3POEZOTHB2AK1";

const Resellers = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [copied, setCopied] = useState(false);

  const activePlan = plans.find((p) => p.title === selectedPlan);

  const pixPayload = useMemo(() => {
    if (!showQR || !activePlan) return "";
    const txId = `BELPLAN${activePlan.title.toUpperCase().slice(0, 4)}${Date.now().toString(36).toUpperCase()}`;
    return generatePixPayload(activePlan.price, txId);
  }, [showQR, activePlan]);

  const handleSelectPlan = (title: string) => {
    setSelectedPlan(title);
    setShowQR(false);
    setCopied(false);
  };

  const handleGenerateQR = () => {
    if (cooldown || !activePlan) return;
    setShowQR(true);
    setCooldown(true);
    setTimeout(() => setCooldown(false), 120000);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
      {/* Background globe */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <motion.img
          src={bellarusGlobe}
          alt=""
          className="w-[500px] h-[500px] object-contain opacity-[0.07] dark:opacity-[0.12]"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none select-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-widest">
            <Lock className="w-3 h-3" />
            Pacotes Exclusivos do Painel
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Planos de Revendedor</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Desbloqueie descontos exclusivos e maximize seus lucros com nossos planos premium
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
            >
              <div
                onClick={() => handleSelectPlan(plan.title)}
                className={`glass-card p-6 space-y-5 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                  plan.popular ? "ring-2 ring-accent" : ""
                } ${selectedPlan === plan.title ? "ring-2 ring-primary shadow-xl" : ""} ${plan.shadow}`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${plan.color}`} />

                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-accent text-accent-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Popular
                  </span>
                )}

                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg`}>
                  <plan.icon className="w-7 h-7 text-white" />
                </div>

                <div>
                  <h3 className="text-xl font-display font-bold text-foreground">{plan.title}</h3>
                  <p className="text-3xl font-bold text-foreground mt-2">R$ {plan.price.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">pagamento único</p>
                </div>

                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>{plan.benefit}</span>
                </div>

                <Button
                  onClick={(e) => { e.stopPropagation(); handleSelectPlan(plan.title); }}
                  className={`w-full font-semibold bg-gradient-to-r ${plan.color} text-white hover:opacity-90 transition-opacity`}
                >
                  {selectedPlan === plan.title ? "✓ Selecionado" : "Selecionar Plano"}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Payment Section */}
        {selectedPlan && activePlan && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-xl p-5 flex items-center justify-between" style={{ background: "linear-gradient(135deg, hsl(152 60% 45%), hsl(152 60% 35%))" }}>
              <div>
                <p className="text-xs text-white/80">Plano selecionado</p>
                <p className="text-2xl font-display font-bold text-white">{activePlan.title}</p>
                <p className="text-xs text-white/70">{activePlan.benefit}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/80">Total</p>
                <p className="text-3xl font-display font-bold text-white">R$ {activePlan.price.toFixed(2)}</p>
              </div>
            </div>

            <Button onClick={handleGenerateQR} disabled={cooldown && showQR} className="w-full navy-gradient text-primary-foreground px-8 py-5 font-semibold text-base">
              <QrCode className="w-5 h-5 mr-2" />
              {cooldown && showQR ? "Aguarde 2 minutos para gerar outro" : `Gerar QR Code PIX — R$ ${activePlan.price.toFixed(2)}`}
            </Button>

            {showQR && (
              <div className="glass-card p-6 space-y-5 max-w-sm mx-auto">
                <p className="text-center text-sm font-semibold text-foreground">Escaneie o QR Code para pagar</p>
                <p className="text-center text-xs text-muted-foreground">Plano {activePlan.title} — R$ {activePlan.price.toFixed(2)}</p>

                <div className="flex justify-center">
                  <div className="p-4 rounded-2xl bg-white">
                    <QRCode value={pixPayload} size={200} level="M" bgColor="transparent" fgColor="#000000" />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground text-center">Ou copie o código PIX:</p>
                  <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3 border border-border">
                    <code className="text-[10px] text-foreground flex-1 break-all select-all leading-relaxed">{pixPayload}</code>
                    <Button variant="outline" size="icon" onClick={handleCopyPix} className="shrink-0">
                      {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  {copied && <p className="text-xs text-success font-medium text-center">Código copiado!</p>}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Após o pagamento, seu plano será ativado automaticamente</span>
                </div>

                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full navy-gradient text-primary-foreground font-semibold mt-2">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Confirmar Pagamento — WhatsApp
                  </Button>
                </a>
              </div>
            )}
          </motion.div>
        )}

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center text-xs text-muted-foreground">
          Todos os planos são de pagamento único • Acesso imediato após confirmação
        </motion.p>
      </div>
    </div>
  );
};

export default Resellers;

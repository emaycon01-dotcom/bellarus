import { Crown, Star, Shield, Zap, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import bellarusGlobe from "@/assets/bellarus-globe.png";

const plans = [
  {
    title: "Dealer",
    price: "R$ 50",
    icon: Star,
    benefit: "35% de desconto em todos os documentos",
    color: "from-cyan-500 to-blue-600",
    shadow: "shadow-cyan-500/20",
  },
  {
    title: "Master",
    price: "R$ 150",
    icon: Shield,
    benefit: "50% de desconto em todos os documentos",
    color: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-500/20",
    popular: true,
  },
  {
    title: "Diamont",
    price: "R$ 400",
    icon: Crown,
    benefit: "Documentos gratuitos — custo zero!",
    color: "from-amber-400 to-yellow-500",
    shadow: "shadow-amber-400/20",
  },
];

const Resellers = () => {
  const navigate = useNavigate();
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

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-widest">
            <Lock className="w-3 h-3" />
            Pacotes Exclusivos do Painel
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Planos de Revendedor
          </h1>
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
              className={`relative group`}
            >
              <div className={`glass-card p-6 space-y-5 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${plan.popular ? "ring-2 ring-accent" : ""} ${plan.shadow}`}>
                {/* Gradient glow top */}
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
                  <p className="text-3xl font-bold text-foreground mt-2">{plan.price}</p>
                  <p className="text-xs text-muted-foreground mt-1">pagamento único</p>
                </div>

                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>{plan.benefit}</span>
                </div>

                <Button
                  onClick={() => navigate(`/dashboard/resellers/payment?plan=${encodeURIComponent(plan.title)}&price=${encodeURIComponent(plan.price)}`)}
                  className={`w-full font-semibold bg-gradient-to-r ${plan.color} text-white hover:opacity-90 transition-opacity`}
                >
                  Adquirir Plano
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-muted-foreground"
        >
          Todos os planos são de pagamento único • Acesso imediato após confirmação
        </motion.p>
      </div>
    </div>
  );
};

export default Resellers;

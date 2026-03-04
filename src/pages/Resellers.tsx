import { Crown, Star, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    title: "Revendedor",
    price: "R$ 50",
    icon: Star,
    benefit: "35% de desconto em todos os documentos",
    color: "navy-gradient",
  },
  {
    title: "Sub Gerente",
    price: "R$ 150",
    icon: Shield,
    benefit: "50% de desconto em todos os documentos",
    color: "navy-gradient",
    popular: true,
  },
  {
    title: "Gerente",
    price: "R$ 400",
    icon: Crown,
    benefit: "Documentos gratuitos — custo zero!",
    color: "gold-gradient",
  },
];

const Resellers = () => {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Revendedores & Planos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Torne-se revendedor e ganhe descontos exclusivos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.title}
            className={`glass-card p-6 space-y-5 relative ${plan.popular ? "ring-2 ring-accent" : ""}`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-accent text-accent-foreground">
                Popular
              </span>
            )}
            <div className={`w-14 h-14 ${plan.color} rounded-2xl flex items-center justify-center`}>
              <plan.icon className="w-7 h-7 text-primary-foreground" />
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
            <Button className="w-full navy-gradient text-primary-foreground font-semibold">
              Adquirir Plano
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Resellers;

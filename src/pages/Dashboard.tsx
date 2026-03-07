import { useState, useEffect } from "react";
import { CreditCard, FileText, Crown, User } from "lucide-react";
import { motion } from "framer-motion";
import bellarusGlobe from "@/assets/bellarus-globe.png";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ name: string; credits: number; plan: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("name, credits, plan").eq("id", user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user]);

  const infoCards = [
    { label: "Usuário", value: profile?.name || user?.email || "—", icon: User, gradient: "from-blue-500 to-indigo-600" },
    { label: "Créditos Disponíveis", value: String(profile?.credits ?? 0), icon: CreditCard, gradient: "from-emerald-500 to-teal-600" },
    { label: "Plano Atual", value: profile?.plan || "Cliente", icon: Crown, gradient: "from-amber-400 to-yellow-500" },
    { label: "Documentos Criados", value: "0", icon: FileText, gradient: "from-violet-500 to-purple-600" },
  ];

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <motion.img src={bellarusGlobe} alt="" className="w-[500px] h-[500px] object-contain opacity-[0.06] dark:opacity-[0.10]" animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} />
      </div>
      <div className="absolute inset-0 pointer-events-none select-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
      <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <h1 className="text-2xl font-display font-bold text-foreground">Painel Principal</h1>
          <p className="text-sm text-muted-foreground">Bem-vindo ao BELLARUS SISTEMAS</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {infoCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6 space-y-4 relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`} />
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</p>
                  <p className="text-xl font-display font-bold text-foreground mt-0.5">{card.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

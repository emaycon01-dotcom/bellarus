import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Shield, FileText, Zap, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const features = [
  { icon: FileText, title: "Documentos Digitais", desc: "Crie documentos com qualidade profissional em segundos." },
  { icon: Shield, title: "Segurança Avançada", desc: "Proteção de dados com criptografia de ponta a ponta." },
  { icon: Zap, title: "Automação Total", desc: "Processos automatizados para máxima eficiência." },
  { icon: Lock, title: "Controle de Acesso", desc: "Gerencie permissões e níveis de acesso facilmente." },
];

const Particle = ({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) => (
  <motion.div
    className="absolute rounded-sm bg-primary/30"
    style={{ width: size, height: size, left: `${x}%`, top: `${y}%` }}
    animate={{ y: [0, -40, 0], x: [0, 15, -10, 0], opacity: [0, 0.8, 0.4, 0], scale: [0.5, 1.2, 0.8, 0.5] }}
    transition={{ duration: 6, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [activeFeature, setActiveFeature] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => setActiveFeature((prev) => (prev + 1) % features.length), 3500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Preencha todos os campos."); return; }
    setSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { toast.error(error.message); setSubmitting(false); return; }
        toast.success("Login realizado com sucesso!");
        navigate("/dashboard");
      } else {
        if (!name) { toast.error("Preencha seu nome."); setSubmitting(false); return; }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) { toast.error(error.message); setSubmitting(false); return; }
        toast.success("Conta criada! Verifique seu e-mail para confirmar.");
      }
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
    }
    setSubmitting(false);
  };

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i, delay: Math.random() * 6, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 6 + 2,
  }));

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        {particles.map((p) => <Particle key={p.id} delay={p.delay} x={p.x} y={p.y} size={p.size} />)}
        <div className="absolute top-6 left-0 right-0 overflow-hidden">
          <motion.div className="flex gap-8 whitespace-nowrap" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
            {Array.from({ length: 10 }).map((_, i) => <span key={i} className="text-xs font-mono uppercase tracking-[0.3em] text-primary/20 select-none">BELLARUS SISTEMAS • DOCUMENTOS DIGITAIS • SEGURANÇA •</span>)}
          </motion.div>
        </div>
        <div className="absolute bottom-6 left-0 right-0 overflow-hidden">
          <motion.div className="flex gap-8 whitespace-nowrap" animate={{ x: ["-50%", "0%"] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}>
            {Array.from({ length: 10 }).map((_, i) => <span key={i} className="text-xs font-mono uppercase tracking-[0.3em] text-primary/15 select-none">AUTOMAÇÃO • CONTROLE • QUALIDADE • INOVAÇÃO •</span>)}
          </motion.div>
        </div>
        <div className="relative z-10 max-w-lg space-y-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-4">
            <div className="flex items-center gap-4">
              <motion.div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-primary/30 relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(220 80% 15%), hsl(200 80% 35%))" }} animate={{ boxShadow: ["0 0 20px hsl(200 80% 55% / 0.2)", "0 0 40px hsl(200 80% 55% / 0.4)", "0 0 20px hsl(200 80% 55% / 0.2)"] }} transition={{ duration: 3, repeat: Infinity }}>
                <span className="font-display font-bold text-3xl text-accent-foreground">B</span>
              </motion.div>
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">BELLARUS</h1>
                <p className="text-xs font-mono tracking-[0.25em] text-muted-foreground">SISTEMAS</p>
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-primary/40 via-primary/10 to-transparent" />
          </motion.div>
          <div className="relative h-40">
            <AnimatePresence mode="wait">
              <motion.div key={activeFeature} initial={{ opacity: 0, x: 60, filter: "blur(8px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} exit={{ opacity: 0, x: -60, filter: "blur(8px)" }} transition={{ duration: 0.5 }} className="absolute inset-0">
                <div className="glass-card p-6 space-y-4 border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      {(() => { const Icon = features[activeFeature].icon; return <Icon className="w-5 h-5 text-primary" />; })()}
                    </div>
                    <h3 className="font-display font-semibold text-foreground text-lg">{features[activeFeature].title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{features[activeFeature].desc}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex gap-2 justify-center">
            {features.map((_, i) => <motion.div key={i} className="h-1 rounded-full" animate={{ width: i === activeFeature ? 32 : 8, backgroundColor: i === activeFeature ? "hsl(200 80% 55%)" : "hsl(220 40% 28%)" }} transition={{ duration: 0.3 }} />)}
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }} className="grid grid-cols-3 gap-4">
            {[{ value: "10K+", label: "Documentos" }, { value: "99.9%", label: "Uptime" }, { value: "256bit", label: "Criptografia" }].map((stat) => (
              <div key={stat.label} className="text-center p-3 rounded-xl bg-secondary/50 border border-border/50">
                <p className="text-lg font-display font-bold text-primary">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute top-4 right-4 grid grid-cols-3 gap-1 opacity-20">
          {Array.from({ length: 9 }).map((_, i) => <motion.div key={i} className="w-1.5 h-1.5 rounded-sm bg-primary" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }} />)}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex flex-col items-center gap-3 mb-4">
            <motion.div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-primary/30" style={{ background: "linear-gradient(135deg, hsl(220 80% 15%), hsl(200 80% 35%))" }} animate={{ boxShadow: ["0 0 15px hsl(200 80% 55% / 0.2)", "0 0 30px hsl(200 80% 55% / 0.4)", "0 0 15px hsl(200 80% 55% / 0.2)"] }} transition={{ duration: 3, repeat: Infinity }}>
              <span className="font-display font-bold text-2xl text-accent-foreground">B</span>
            </motion.div>
            <p className="text-xs font-mono tracking-[0.3em] text-muted-foreground">BELLARUS SISTEMAS</p>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-display font-bold text-foreground">{isLogin ? "Bem-vindo de volta" : "Crie sua conta"}</h1>
            <p className="text-sm text-muted-foreground">{isLogin ? "Acesse sua conta para continuar" : "Preencha os dados para começar"}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div key="name-field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="space-y-2 overflow-hidden">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary/50 border-border/50 focus:border-primary/50 transition-colors" />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary/50 border-border/50 focus:border-primary/50 transition-colors" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input id="password" type={showPass ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary/50 border-border/50 focus:border-primary/50 transition-colors pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {isLogin && <div className="flex justify-end"><button type="button" className="text-xs text-primary hover:underline">Esqueceu a senha?</button></div>}
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button type="submit" disabled={submitting} className="w-full py-5 font-semibold text-sm relative overflow-hidden group" style={{ background: "linear-gradient(135deg, hsl(220 80% 15%), hsl(200 80% 35%))" }}>
                <span className="relative z-10">{submitting ? "Aguarde..." : isLogin ? "Entrar" : "Criar Conta"}</span>
                <motion.div className="absolute inset-0 bg-primary/20" initial={{ x: "-100%" }} whileHover={{ x: "0%" }} transition={{ duration: 0.3 }} />
              </Button>
            </motion.div>
          </form>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-semibold hover:underline">{isLogin ? "Criar agora" : "Entrar"}</button>
          </p>
          <p className="text-center text-[10px] text-muted-foreground/50 pt-4">© 2026 Bellarus Sistemas. Todos os direitos reservados.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

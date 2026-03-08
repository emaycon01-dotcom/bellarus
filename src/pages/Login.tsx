import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import bellarusRobot from "@/assets/bellarus-robot.png";

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
  }, [navigate]);

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

  return (
    <div className="min-h-screen flex bg-black relative overflow-hidden">
      {/* Ambient effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/8 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/8 blur-[100px]" />
      </div>

      {/* Left panel - Robot */}
      <div className="hidden lg:flex lg:w-[50%] relative items-center justify-center">
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10"
        >
          <motion.img
            src={bellarusRobot}
            alt="Bellarus Robot"
            className="w-[420px] h-[420px] object-contain drop-shadow-[0_0_60px_rgba(100,140,255,0.3)]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          />
        </motion.div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center gap-3 mb-4">
            <motion.img
              src={bellarusRobot}
              alt="Bellarus"
              className="w-24 h-24 object-contain"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <p className="text-xs font-mono tracking-[0.3em] text-white/40">BELLARUS SISTEMAS</p>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-display font-bold text-white">{isLogin ? "Bem-vindo de volta" : "Crie sua conta"}</h1>
            <p className="text-sm text-white/50">{isLogin ? "Acesse sua conta para continuar" : "Preencha os dados para começar"}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div key="name-field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="space-y-2 overflow-hidden">
                  <Label htmlFor="name" className="text-white/70">Nome completo</Label>
                  <Input id="name" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50" />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/70">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/70">Senha</Label>
              <div className="relative">
                <Input id="password" type={showPass ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {isLogin && <div className="flex justify-end"><button type="button" className="text-xs text-blue-400 hover:underline">Esqueceu a senha?</button></div>}
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button type="submit" disabled={submitting} className="w-full py-5 font-semibold text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/20">
                {submitting ? "Aguarde..." : isLogin ? "Entrar" : "Criar Conta"}
              </Button>
            </motion.div>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <p className="text-center text-sm text-white/50">
            {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-blue-400 font-semibold hover:underline">{isLogin ? "Criar agora" : "Entrar"}</button>
          </p>

          <p className="text-center text-[10px] text-white/20 pt-4">© 2026 Bellarus Sistemas. Todos os direitos reservados.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

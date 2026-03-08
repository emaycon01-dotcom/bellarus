import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import bellarusRobot from "@/assets/bellarus-robot.png";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-black relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[150px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src={bellarusRobot} alt="Bellarus" className="w-10 h-10 object-contain" />
          <span className="font-display font-bold text-xl text-white tracking-tight">BELLARUS</span>
        </div>
        <Button onClick={() => navigate("/login")} variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
          Entrar
        </Button>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-8">
          {/* Robot image with floating animation */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <motion.img
              src={bellarusRobot}
              alt="Bellarus Robot"
              className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain drop-shadow-[0_0_40px_rgba(100,140,255,0.3)]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight">
              Documentos com{" "}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                qualidade
              </span>{" "}
              e segurança
            </h1>

            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
              Crie CNH digital, RG digital, atestados, receitas com QR Code, certidões e
              documentos físicos com rapidez e eficiência.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-6 text-base font-semibold shadow-xl shadow-blue-500/20 hover:shadow-2xl transition-all hover:scale-105"
            >
              Começar Agora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/login")}
              className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-base"
            >
              Já tenho conta
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-6 text-center text-xs text-white/30 border-t border-white/10">
        © 2026 BELLARUS SISTEMAS. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default Landing;

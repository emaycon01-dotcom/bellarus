import { useNavigate } from "react-router-dom";
import BellarusLogo from "@/components/BellarusLogo";
import { Button } from "@/components/ui/button";
import { FileText, Shield, Zap, ArrowRight } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <BellarusLogo size="md" />
        <Button onClick={() => navigate("/login")} variant="default" size="sm">
          Entrar
        </Button>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Zap className="w-3.5 h-3.5" />
            Plataforma de Documentos Digitais
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-tight">
            Documentos com{" "}
            <span className="text-gradient-gold">qualidade</span>{" "}
            e segurança
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Crie CNH digital, RG digital, atestados, receitas com QR Code, certidões e
            documentos físicos com rapidez e eficiência.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="navy-gradient text-primary-foreground px-8 py-6 text-base font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              Começar Agora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/login")}
              className="px-8 py-6 text-base"
            >
              Já tenho conta
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-20 bg-muted/50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              icon: FileText,
              title: "Documentos Digitais",
              desc: "CNH, RG, Atestados, Receitas e Certidões com tecnologia QR Code.",
            },
            {
              icon: Shield,
              title: "Segurança Total",
              desc: "Seus documentos protegidos com criptografia e controle de acesso.",
            },
            {
              icon: Zap,
              title: "Rápido e Eficiente",
              desc: "Crie documentos em segundos com módulos editáveis e intuitivos.",
            },
          ].map((f) => (
            <div key={f.title} className="glass-card p-6 space-y-4 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-xl navy-gradient flex items-center justify-center">
                <f.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 text-center text-xs text-muted-foreground border-t border-border/50">
        © 2026 BELLARUS SISTEMAS. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default Landing;

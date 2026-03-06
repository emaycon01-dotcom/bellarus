import { HeadphonesIcon, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const Support = () => {
  const whatsappLink = "https://wa.me/message/W3POEZOTHB2AK1";

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Suporte</h1>
        <p className="text-sm text-muted-foreground mt-1">Entre em contato com nossa equipe</p>
      </div>

      <div className="glass-card p-8 text-center space-y-6">
        <div className="w-20 h-20 mx-auto navy-gradient rounded-2xl flex items-center justify-center">
          <HeadphonesIcon className="w-10 h-10 text-primary-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-display font-bold text-foreground">SOUZA7</h2>
          <p className="text-xs font-medium" style={{ color: "hsl(50, 90%, 55%)" }}>CEO & DEV</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Precisa de ajuda? Clique no botão abaixo para abrir o WhatsApp e tirar suas dúvidas diretamente.
          </p>
        </div>
        <Button
          asChild
          className="navy-gradient text-primary-foreground px-8 py-5 font-semibold"
        >
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-4 h-4 mr-2" />
            Abrir WhatsApp
            <ExternalLink className="w-3.5 h-3.5 ml-2" />
          </a>
        </Button>
      </div>
    </div>
  );
};

export default Support;

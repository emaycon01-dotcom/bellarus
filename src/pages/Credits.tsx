import { useState } from "react";
import { CreditCard, QrCode, Package, Minus, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const packages = [
  { credits: 1, discount: 0, label: "1 Crédito", price: 20 },
  { credits: 5, discount: 15, label: "5 Créditos", price: 85, badge: "15% OFF" },
  { credits: 10, discount: 35, label: "10 Créditos", price: 130, badge: "35% OFF", popular: true },
];

const Credits = () => {
  const [customCredits, setCustomCredits] = useState(1);
  const [selectedPkg, setSelectedPkg] = useState<number | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const customPrice = customCredits * 20;

  const handleGenerateQR = () => {
    if (cooldown) return;
    setShowQR(true);
    setCooldown(true);
    setTimeout(() => setCooldown(false), 120000); // 2 min cooldown
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Recargas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cada crédito custa R$ 20,00. Compre pacotes com desconto!
        </p>
      </div>

      {/* Packages */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <div
            key={pkg.credits}
            onClick={() => { setSelectedPkg(pkg.credits); setShowQR(false); }}
            className={`glass-card p-5 cursor-pointer transition-all hover:shadow-xl relative ${
              selectedPkg === pkg.credits ? "ring-2 ring-accent border-accent/50" : ""
            } ${pkg.popular ? "ring-1 ring-gold/30" : ""}`}
          >
            {pkg.badge && (
              <span className="absolute -top-2 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full gold-gradient text-gold-foreground">
                {pkg.badge}
              </span>
            )}
            <div className="space-y-3">
              <Package className="w-8 h-8 text-primary" />
              <div>
                <p className="font-display font-bold text-lg text-foreground">{pkg.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-foreground">R$ {pkg.price}</span>
                  {pkg.discount > 0 && (
                    <span className="text-xs text-muted-foreground line-through">
                      R$ {pkg.credits * 20}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom amount */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-display font-semibold text-foreground">Quantidade personalizada</h3>
        <p className="text-xs text-muted-foreground">Escolha de 1 até 50 créditos</p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => { setCustomCredits(Math.max(1, customCredits - 1)); setSelectedPkg(null); setShowQR(false); }}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Input
            type="number"
            min={1}
            max={50}
            value={customCredits}
            onChange={(e) => {
              const v = Math.min(50, Math.max(1, parseInt(e.target.value) || 1));
              setCustomCredits(v);
              setSelectedPkg(null);
              setShowQR(false);
            }}
            className="w-20 text-center font-bold text-lg"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => { setCustomCredits(Math.min(50, customCredits + 1)); setSelectedPkg(null); setShowQR(false); }}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <span className="text-lg font-bold text-foreground ml-4">R$ {customPrice},00</span>
        </div>
      </div>

      {/* Generate QR */}
      <div className="space-y-4">
        <Button
          onClick={handleGenerateQR}
          disabled={cooldown && showQR}
          className="navy-gradient text-primary-foreground px-8 py-5 font-semibold"
        >
          <QrCode className="w-4 h-4 mr-2" />
          {cooldown && showQR ? "Aguarde 2 minutos" : "Gerar Chave PIX"}
        </Button>

        {showQR && (
          <div className="glass-card p-6 space-y-4 max-w-sm">
            <div className="w-48 h-48 mx-auto bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border">
              <div className="text-center space-y-2">
                <QrCode className="w-16 h-16 mx-auto text-primary" />
                <p className="text-xs text-muted-foreground">QR Code PIX</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>Você só poderá gerar outro QR Code em 2 minutos</span>
            </div>
            <a
              href="https://wa.me/message/W3POEZOTHB2AK1"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full navy-gradient text-primary-foreground font-semibold mt-2">
                ✅ Concluir Recarga — Falar no WhatsApp
              </Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Credits;

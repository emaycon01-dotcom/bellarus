import { useState } from "react";
import { Tag, Star, TrendingUp, Box, Diamond, QrCode, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const allPackages = [
  // Populares
  { credits: 5, pricePerUnit: 14.0, total: 70, discount: 0, category: "popular" },
  { credits: 10, pricePerUnit: 14.0, total: 140, discount: 0, category: "popular" },
  { credits: 25, pricePerUnit: 13.5, total: 337.5, discount: 4, category: "popular" },
  { credits: 50, pricePerUnit: 13.0, total: 650, discount: 7, category: "popular" },
  // Intermediários
  { credits: 75, pricePerUnit: 12.5, total: 937.5, discount: 11, category: "intermediary" },
  { credits: 100, pricePerUnit: 12.0, total: 1200, discount: 14, category: "intermediary" },
  { credits: 150, pricePerUnit: 11.5, total: 1725, discount: 18, category: "intermediary" },
  { credits: 200, pricePerUnit: 11.0, total: 2200, discount: 21, category: "intermediary" },
  // Grandes Volumes
  { credits: 250, pricePerUnit: 10.5, total: 2625, discount: 25, category: "large" },
  { credits: 300, pricePerUnit: 10.2, total: 3060, discount: 27, category: "large" },
  { credits: 400, pricePerUnit: 9.8, total: 3920, discount: 30, category: "large" },
  { credits: 500, pricePerUnit: 9.65, total: 4825, discount: 31, category: "large" },
  { credits: 1000, pricePerUnit: 9.0, total: 9000, discount: 36, category: "large", premium: true },
];

const sliderSteps = [5, 10, 25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 1000];

const formatPrice = (v: number) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Credits = () => {
  const [selectedCredits, setSelectedCredits] = useState(5);
  const [showQR, setShowQR] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const selectedPkg = allPackages.find((p) => p.credits === selectedCredits) || allPackages[0];

  const sliderIndex = sliderSteps.indexOf(selectedCredits);

  const handleSlider = (val: number[]) => {
    const idx = Math.round(val[0]);
    setSelectedCredits(sliderSteps[idx]);
    setShowQR(false);
  };

  const handleSelect = (credits: number) => {
    setSelectedCredits(credits);
    setShowQR(false);
  };

  const handleGenerateQR = () => {
    if (cooldown) return;
    setShowQR(true);
    setCooldown(true);
    setTimeout(() => setCooldown(false), 120000);
  };

  const popular = allPackages.filter((p) => p.category === "popular");
  const intermediary = allPackages.filter((p) => p.category === "intermediary");
  const large = allPackages.filter((p) => p.category === "large");

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Tag className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Pacotes de Créditos</h1>
          <p className="text-sm text-muted-foreground">Selecione um pacote para recarregar</p>
        </div>
      </div>

      {/* Pacotes Populares */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Star className="w-5 h-5 text-warning" />
          <h2 className="font-display font-semibold text-foreground text-lg">Pacotes Populares</h2>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
            Mais vendidos
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {popular.map((pkg) => (
            <PackageCard key={pkg.credits} pkg={pkg} selected={selectedCredits === pkg.credits} onSelect={handleSelect} />
          ))}
        </div>
      </section>

      {/* Pacotes Intermediários */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground text-lg">Pacotes Intermediários</h2>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-success/20 text-success">
            Melhor custo-benefício
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {intermediary.map((pkg) => (
            <PackageCard key={pkg.credits} pkg={pkg} selected={selectedCredits === pkg.credits} onSelect={handleSelect} />
          ))}
        </div>
      </section>

      {/* Grandes Volumes */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Box className="w-5 h-5 text-warning" />
          <h2 className="font-display font-semibold text-foreground text-lg">Grandes Volumes</h2>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-warning/20 text-warning">
            Máximo desconto
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {large.map((pkg) => (
            <PackageCard key={pkg.credits} pkg={pkg} selected={selectedCredits === pkg.credits} onSelect={handleSelect} />
          ))}
        </div>
      </section>

      {/* Slider */}
      <div className="glass-card p-6 space-y-4">
        <p className="text-sm text-muted-foreground">Ou arraste para selecionar:</p>
        <Slider
          value={[sliderIndex >= 0 ? sliderIndex : 0]}
          min={0}
          max={sliderSteps.length - 1}
          step={1}
          onValueChange={handleSlider}
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          {sliderSteps.map((s) => (
            <span key={s} className={s === selectedCredits ? "text-primary font-bold" : ""}>{s}</span>
          ))}
        </div>
      </div>

      {/* Summary Bar */}
      <div className="rounded-xl p-5 flex items-center justify-between" style={{ background: "linear-gradient(135deg, hsl(152 60% 45%), hsl(152 60% 35%))" }}>
        <div>
          <p className="text-xs text-white/80">Pacote selecionado</p>
          <p className="text-2xl font-display font-bold text-white">{selectedPkg.credits} créditos</p>
          <p className="text-xs text-white/70">R$ {formatPrice(selectedPkg.pricePerUnit)} por unidade</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/80">Total</p>
          <p className="text-3xl font-display font-bold text-white">R$ {formatPrice(selectedPkg.total)}</p>
        </div>
      </div>

      {/* Generate QR / Payment */}
      <div className="space-y-4">
        <Button
          onClick={handleGenerateQR}
          disabled={cooldown && showQR}
          className="w-full navy-gradient text-primary-foreground px-8 py-5 font-semibold text-base"
        >
          <QrCode className="w-5 h-5 mr-2" />
          {cooldown && showQR ? "Aguarde 2 minutos" : "Gerar Chave PIX"}
        </Button>

        {showQR && (
          <div className="glass-card p-6 space-y-4 max-w-sm mx-auto">
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
            <a href="https://wa.me/message/W3POEZOTHB2AK1" target="_blank" rel="noopener noreferrer">
              <Button className="w-full navy-gradient text-primary-foreground font-semibold mt-2">
                <MessageCircle className="w-4 h-4 mr-2" />
                Concluir Recarga — Falar no WhatsApp
              </Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

interface PackageCardProps {
  pkg: (typeof allPackages)[number];
  selected: boolean;
  onSelect: (credits: number) => void;
}

const PackageCard = ({ pkg, selected, onSelect }: PackageCardProps) => (
  <div
    onClick={() => onSelect(pkg.credits)}
    className={`glass-card p-4 cursor-pointer transition-all hover:shadow-xl relative ${
      selected ? "ring-2 ring-primary border-primary/50" : ""
    } ${pkg.premium ? "ring-1 ring-warning/40" : ""}`}
  >
    {pkg.discount > 0 && (
      <span className="absolute -top-2.5 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-success text-success-foreground">
        -{pkg.discount}%
      </span>
    )}
    {pkg.premium && (
      <span className="absolute -top-2.5 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full gold-gradient text-gold-foreground flex items-center gap-1">
        <Diamond className="w-3 h-3" /> PREMIUM
      </span>
    )}
    <div className="space-y-2">
      <div>
        <p className="text-2xl font-display font-bold text-foreground">{pkg.credits}</p>
        <p className="text-xs text-muted-foreground">créditos</p>
      </div>
      <span className="inline-block text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
        R$ {formatPrice(pkg.pricePerUnit)}/un
      </span>
      <p className="text-sm font-bold text-success">R$ {formatPrice(pkg.total)}</p>
    </div>
  </div>
);

export default Credits;

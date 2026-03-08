import { useState, useMemo, useRef, useEffect } from "react";
import { Tag, Star, TrendingUp, Box, Diamond, QrCode, Clock, MessageCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import QRCode from "react-qr-code";
import { generatePixPayload, PIX_KEY } from "@/lib/pix";

const allPackages = [
  { credits: 1, pricePerUnit: 20.0, total: 20, discount: 0, category: "popular" },
  { credits: 2, pricePerUnit: 20.0, total: 40, discount: 0, category: "popular" },
  { credits: 3, pricePerUnit: 20.0, total: 60, discount: 0, category: "popular" },
  { credits: 5, pricePerUnit: 19.0, total: 95, discount: 5, category: "popular" },
  { credits: 10, pricePerUnit: 18.0, total: 180, discount: 10, category: "popular" },
  { credits: 25, pricePerUnit: 17.0, total: 425, discount: 15, category: "popular" },
  { credits: 50, pricePerUnit: 16.0, total: 800, discount: 20, category: "popular" },
  { credits: 75, pricePerUnit: 15.0, total: 1125, discount: 25, category: "intermediary" },
  { credits: 100, pricePerUnit: 14.5, total: 1450, discount: 28, category: "intermediary" },
  { credits: 150, pricePerUnit: 14.0, total: 2100, discount: 30, category: "intermediary" },
  { credits: 200, pricePerUnit: 13.5, total: 2700, discount: 33, category: "intermediary" },
  { credits: 250, pricePerUnit: 13.0, total: 3250, discount: 35, category: "large" },
  { credits: 300, pricePerUnit: 12.5, total: 3750, discount: 38, category: "large" },
  { credits: 400, pricePerUnit: 12.0, total: 4800, discount: 40, category: "large" },
  { credits: 500, pricePerUnit: 11.5, total: 5750, discount: 43, category: "large" },
  { credits: 1000, pricePerUnit: 10.0, total: 10000, discount: 50, category: "large", premium: true },
];

const sliderSteps = [1, 2, 3, 5, 10, 25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 1000];

const formatPrice = (v: number) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Credits = () => {
  const [selectedCredits, setSelectedCredits] = useState(5);
  const [showQR, setShowQR] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const selectedPkg = allPackages.find((p) => p.credits === selectedCredits) || allPackages[0];
  const sliderIndex = sliderSteps.indexOf(selectedCredits);

  const pixPayload = useMemo(() => {
    if (!showQR) return "";
    const txId = `BEL${selectedPkg.credits}C${Date.now().toString(36).toUpperCase()}`;
    return generatePixPayload(selectedPkg.total, txId);
  }, [showQR, selectedPkg]);

  const handleSlider = (val: number[]) => {
    setSelectedCredits(sliderSteps[Math.round(val[0])]);
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

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const popular = allPackages.filter((p) => p.category === "popular");
  const intermediary = allPackages.filter((p) => p.category === "intermediary");
  const large = allPackages.filter((p) => p.category === "large");

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-3">
        <Tag className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Pacotes de Créditos</h1>
          <p className="text-sm text-muted-foreground">Selecione um pacote para recarregar</p>
        </div>
      </div>

      <PackageSection title="Pacotes Populares" icon={<Star className="w-5 h-5 text-warning" />} badge="Mais vendidos" badgeClass="bg-muted text-muted-foreground" packages={popular} selected={selectedCredits} onSelect={handleSelect} />
      <PackageSection title="Pacotes Intermediários" icon={<TrendingUp className="w-5 h-5 text-primary" />} badge="Melhor custo-benefício" badgeClass="bg-success/20 text-success" packages={intermediary} selected={selectedCredits} onSelect={handleSelect} />
      <PackageSection title="Grandes Volumes" icon={<Box className="w-5 h-5 text-warning" />} badge="Máximo desconto" badgeClass="bg-warning/20 text-warning" packages={large} selected={selectedCredits} onSelect={handleSelect} cols={3} />

      {/* Slider */}
      <div className="glass-card p-6 space-y-4">
        <p className="text-sm text-muted-foreground">Ou arraste para selecionar:</p>
        <Slider value={[sliderIndex >= 0 ? sliderIndex : 0]} min={0} max={sliderSteps.length - 1} step={1} onValueChange={handleSlider} />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          {sliderSteps.map((s) => (
            <span key={s} className={s === selectedCredits ? "text-primary font-bold" : ""}>{s}</span>
          ))}
        </div>
      </div>

      {/* Summary */}
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
        <Button onClick={handleGenerateQR} disabled={cooldown && showQR} className="w-full navy-gradient text-primary-foreground px-8 py-5 font-semibold text-base">
          <QrCode className="w-5 h-5 mr-2" />
          {cooldown && showQR ? "Aguarde 2 minutos para gerar outro" : `Gerar QR Code PIX — R$ ${formatPrice(selectedPkg.total)}`}
        </Button>

        {showQR && (
          <div className="glass-card p-6 space-y-5 max-w-sm mx-auto">
            <p className="text-center text-sm font-semibold text-foreground">
              Escaneie o QR Code para pagar
            </p>
            <p className="text-center text-xs text-muted-foreground">
              {selectedPkg.credits} crédito{selectedPkg.credits > 1 ? "s" : ""} — R$ {formatPrice(selectedPkg.total)}
            </p>

            {/* QR Code with transparent background */}
            <div className="flex justify-center">
              <div className="p-4 rounded-2xl bg-white">
                <QRCode
                  value={pixPayload}
                  size={200}
                  level="M"
                  bgColor="transparent"
                  fgColor="#000000"
                />
              </div>
            </div>

            {/* PIX Copia e Cola */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">Ou copie o código PIX:</p>
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3 border border-border">
                <code className="text-[10px] text-foreground flex-1 break-all select-all leading-relaxed">
                  {pixPayload}
                </code>
                <Button variant="outline" size="icon" onClick={handleCopyPix} className="shrink-0">
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              {copied && <p className="text-xs text-success font-medium text-center">Código copiado!</p>}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>Após o pagamento, os créditos serão adicionados automaticamente</span>
            </div>

            <a href="https://wa.me/message/W3POEZOTHB2AK1" target="_blank" rel="noopener noreferrer">
              <Button className="w-full navy-gradient text-primary-foreground font-semibold mt-2">
                <MessageCircle className="w-4 h-4 mr-2" />
                Confirmar Pagamento — WhatsApp
              </Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

/* Extracted sub-components */

interface PackageSectionProps {
  title: string;
  icon: React.ReactNode;
  badge: string;
  badgeClass: string;
  packages: typeof allPackages;
  selected: number;
  onSelect: (c: number) => void;
  cols?: number;
}

const PackageSection = ({ title, icon, badge, badgeClass, packages, selected, onSelect, cols = 4 }: PackageSectionProps) => (
  <section className="space-y-4">
    <div className="flex items-center gap-3">
      {icon}
      <h2 className="font-display font-semibold text-foreground text-lg">{title}</h2>
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${badgeClass}`}>{badge}</span>
    </div>
    <div className={`grid grid-cols-2 sm:grid-cols-${cols} gap-3`}>
      {packages.map((pkg) => (
        <PackageCard key={pkg.credits} pkg={pkg} selected={selected === pkg.credits} onSelect={onSelect} />
      ))}
    </div>
  </section>
);

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

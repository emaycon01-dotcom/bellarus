import bellarusRobot from "@/assets/bellarus-robot.png";

const BellarusLogo = ({ size = "md", showText = true }: { size?: "sm" | "md" | "lg"; showText?: boolean }) => {
  const sizes = {
    sm: { icon: "w-8 h-8", text: "text-lg" },
    md: { icon: "w-12 h-12", text: "text-2xl" },
    lg: { icon: "w-20 h-20", text: "text-4xl" },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <img src={bellarusRobot} alt="Bellarus" className={`${s.icon} object-contain`} />
      {showText && (
        <div className="flex flex-col">
          <span className={`font-display font-bold ${s.text} text-foreground tracking-tight leading-none`}>
            BELLARUS
          </span>
          <span className="text-xs font-medium text-muted-foreground tracking-[0.2em] uppercase">
            Sistemas
          </span>
        </div>
      )}
    </div>
  );
};

export default BellarusLogo;

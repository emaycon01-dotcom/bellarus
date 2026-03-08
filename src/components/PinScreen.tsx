import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import bellarusLogo from "@/assets/bellarus-logo.png";

interface PinScreenProps {
  mode: "setup" | "verify";
  onSuccess: () => void;
}

const PinScreen = ({ mode, onSuccess }: PinScreenProps) => {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (step === "confirm") {
      setTimeout(() => confirmRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const handleChange = (index: number, value: string, isConfirm = false) => {
    if (!/^\d?$/.test(value)) return;
    setError("");
    const setter = isConfirm ? setConfirmPin : setPin;
    const refs = isConfirm ? confirmRefs : inputRefs;

    setter(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

    if (value && index < 3) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent, isConfirm = false) => {
    const refs = isConfirm ? confirmRefs : inputRefs;
    const currentPin = isConfirm ? confirmPin : pin;
    if (e.key === "Backspace" && !currentPin[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent, isConfirm = false) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length === 4) {
      const digits = pasted.split("");
      if (isConfirm) {
        setConfirmPin(digits);
      } else {
        setPin(digits);
      }
    }
  };

  const handleSubmit = async () => {
    const pinCode = pin.join("");
    if (pinCode.length !== 4) { setError("Digite 4 dígitos."); return; }

    if (mode === "setup") {
      if (step === "enter") {
        setStep("confirm");
        return;
      }
      const confirmCode = confirmPin.join("");
      if (pinCode !== confirmCode) {
        setError("Os PINs não coincidem. Tente novamente.");
        setConfirmPin(["", "", "", ""]);
        confirmRefs.current[0]?.focus();
        return;
      }

      setSubmitting(true);
      try {
        const { data, error: fnError } = await supabase.rpc("set_user_pin", { pin_code: pinCode });
        if (fnError) throw fnError;
        if (data) {
          toast.success("PIN criado com sucesso! 🔐");
          onSuccess();
        } else {
          setError("Erro ao criar PIN. Tente novamente.");
        }
      } catch (e: any) {
        setError(e.message || "Erro ao criar PIN.");
      }
      setSubmitting(false);
    } else {
      setSubmitting(true);
      try {
        const { data, error: fnError } = await supabase.rpc("verify_user_pin", { pin_code: pinCode });
        if (fnError) throw fnError;
        if (data) {
          toast.success("PIN verificado! ✅");
          onSuccess();
        } else {
          setError("PIN incorreto. Tente novamente.");
          setPin(["", "", "", ""]);
          inputRefs.current[0]?.focus();
        }
      } catch (e: any) {
        setError(e.message || "Erro ao verificar PIN.");
      }
      setSubmitting(false);
    }
  };

  // Auto-submit when all digits filled
  useEffect(() => {
    if (mode === "verify" && pin.every(d => d !== "")) {
      handleSubmit();
    }
  }, [pin]);

  useEffect(() => {
    if (mode === "setup" && step === "confirm" && confirmPin.every(d => d !== "")) {
      handleSubmit();
    }
  }, [confirmPin]);

  const renderPinInputs = (values: string[], refs: React.MutableRefObject<(HTMLInputElement | null)[]>, isConfirm = false) => (
    <div className="flex gap-3 justify-center">
      {values.map((digit, i) => (
        <motion.input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(i, e.target.value, isConfirm)}
          onKeyDown={e => handleKeyDown(i, e, isConfirm)}
          onPaste={e => handlePaste(e, isConfirm)}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.08 }}
          className={`w-16 h-20 text-center text-3xl font-bold rounded-2xl border-2 transition-all duration-200 bg-white/5 text-white outline-none
            ${digit ? "border-purple-500 shadow-lg shadow-purple-500/20" : "border-white/15"}
            ${error ? "border-red-500/60 shake" : ""}
            focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/30`}
        />
      ))}
    </div>
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(230,35%,8%)] relative overflow-hidden">
      {/* Ambient effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/8 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-800/10 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-sm mx-auto px-6 space-y-8"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <motion.img
            src={bellarusLogo}
            alt="Bellarus"
            className="w-20 h-20 object-contain rounded-xl"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            {mode === "setup" ? <Shield className="w-7 h-7 text-white" /> : <Lock className="w-7 h-7 text-white" />}
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-display font-bold text-white">
            {mode === "setup"
              ? (step === "enter" ? "Crie seu PIN" : "Confirme seu PIN")
              : "Digite seu PIN"}
          </h1>
          <p className="text-sm text-white/50">
            {mode === "setup"
              ? (step === "enter" ? "Crie um PIN de 4 dígitos para proteger sua conta" : "Digite o PIN novamente para confirmar")
              : "Insira seu PIN de 4 dígitos para acessar o painel"}
          </p>
        </div>

        {/* PIN inputs */}
        {step === "enter" && renderPinInputs(pin, inputRefs)}
        {step === "confirm" && renderPinInputs(confirmPin, confirmRefs, true)}

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-red-400 font-medium"
          >
            {error}
          </motion.p>
        )}

        {/* Submit button */}
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-5 font-semibold text-sm bg-gradient-to-r from-purple-700 to-blue-700 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/20"
          >
            {submitting ? "Verificando..." : mode === "setup" ? (step === "enter" ? "Continuar" : "Confirmar PIN") : "Acessar"}
          </Button>
        </motion.div>

        {/* Back to enter step */}
        {mode === "setup" && step === "confirm" && (
          <button
            onClick={() => { setStep("enter"); setConfirmPin(["", "", "", ""]); setError(""); }}
            className="block mx-auto text-xs text-purple-400 hover:underline"
          >
            Voltar e alterar PIN
          </button>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="block mx-auto text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          Sair da conta
        </button>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <Shield className="w-3.5 h-3.5 text-purple-400/50" />
          <span className="text-[10px] text-white/25">PIN criptografado com bcrypt</span>
        </div>
      </motion.div>
    </div>
  );
};

export default PinScreen;

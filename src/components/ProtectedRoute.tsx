import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import PinScreen from "@/components/PinScreen";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [pinStatus, setPinStatus] = useState<"loading" | "needs_setup" | "needs_verify" | "verified">("loading");

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  // Check PIN status when user is authenticated
  useEffect(() => {
    if (!user) return;

    // Check if PIN was already verified this session
    const sessionKey = `pin_verified_${user.id}`;
    if (sessionStorage.getItem(sessionKey) === "true") {
      setPinStatus("verified");
      return;
    }

    // Check if user has a PIN set
    const checkPin = async () => {
      try {
        const { data, error } = await supabase.rpc("has_user_pin");
        if (error) throw error;
        setPinStatus(data ? "needs_verify" : "needs_setup");
      } catch (e) {
        console.error("Error checking PIN:", e);
        // If error, allow access (don't block)
        setPinStatus("verified");
      }
    };
    checkPin();
  }, [user]);

  if (loading || pinStatus === "loading") return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );

  if (!user) return null;

  // Show PIN setup screen
  if (pinStatus === "needs_setup") {
    return (
      <PinScreen
        mode="setup"
        onSuccess={() => {
          sessionStorage.setItem(`pin_verified_${user.id}`, "true");
          setPinStatus("verified");
        }}
      />
    );
  }

  // Show PIN verification screen
  if (pinStatus === "needs_verify") {
    return (
      <PinScreen
        mode="verify"
        onSuccess={() => {
          sessionStorage.setItem(`pin_verified_${user.id}`, "true");
          setPinStatus("verified");
        }}
      />
    );
  }

  return <>{children}</>;
}

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, CheckCircle2, XCircle, FileText, User, Calendar, MapPin, CreditCard, Car } from "lucide-react";


interface VerificationData {
  id: string;
  document_type: string;
  document_name: string;
  document_data: Record<string, any>;
  photo_url: string | null;
  created_at: string;
  status: string;
}

const DocumentVerification = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) { setNotFound(true); setLoading(false); return; }
      const { data: doc, error } = await supabase
        .from("document_verifications")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !doc) { setNotFound(true); } else { setData(doc as VerificationData); }
      setLoading(false);
    };
    fetchDocument();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(230,35%,10%)] to-[hsl(230,35%,18%)] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-[hsl(265,60%,55%)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(230,35%,10%)] to-[hsl(230,35%,18%)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[hsl(230,30%,16%)] rounded-3xl p-8 text-center border border-[hsl(230,30%,24%)] shadow-2xl">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Documento Não Encontrado</h1>
          <p className="text-[hsl(210,20%,65%)]">O documento solicitado não foi encontrado ou o link é inválido.</p>
        </div>
      </div>
    );
  }

  const d = data.document_data;
  const isValid = data.status === "valid";
  const createdDate = new Date(data.created_at).toLocaleDateString("pt-BR");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(230,35%,10%)] to-[hsl(230,35%,18%)] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        {/* Header */}
        <div className="bg-[hsl(230,30%,16%)] rounded-3xl p-6 border border-[hsl(230,30%,24%)] shadow-2xl text-center">
          <img src={bellarusLogo} alt="Bellarus" className="h-10 mx-auto mb-4" />
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${isValid ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
            {isValid ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {isValid ? "DOCUMENTO VÁLIDO" : "DOCUMENTO INVÁLIDO"}
          </div>
        </div>

        {/* Photo + Name */}
        <div className="bg-[hsl(230,30%,16%)] rounded-3xl p-6 border border-[hsl(230,30%,24%)] shadow-2xl">
          <div className="flex items-center gap-4">
            {data.photo_url ? (
              <img src={data.photo_url} alt="Foto" className="w-20 h-26 rounded-xl object-cover border-2 border-[hsl(265,60%,55%)]" style={{ aspectRatio: "3/4" }} />
            ) : (
              <div className="w-20 h-26 rounded-xl bg-[hsl(230,30%,24%)] flex items-center justify-center" style={{ aspectRatio: "3/4" }}>
                <User className="w-8 h-8 text-[hsl(210,20%,65%)]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[hsl(210,20%,65%)] uppercase tracking-wider mb-1">Nome</p>
              <p className="text-lg font-bold text-white truncate">{data.document_name}</p>
              <p className="text-xs text-[hsl(265,60%,55%)] mt-1">{data.document_type}</p>
            </div>
          </div>
        </div>

        {/* Document Details */}
        <div className="bg-[hsl(230,30%,16%)] rounded-3xl p-6 border border-[hsl(230,30%,24%)] shadow-2xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[hsl(230,30%,24%)]">
            <FileText className="w-5 h-5 text-[hsl(265,60%,55%)]" />
            <h2 className="text-base font-bold text-white">Dados do Documento</h2>
          </div>

          {d.cpf && (
            <InfoRow icon={CreditCard} label="CPF" value={d.cpf} />
          )}
          {d.registro && (
            <InfoRow icon={Shield} label="Nº Registro" value={d.registro} />
          )}
          {d.categoria && (
            <InfoRow icon={Car} label="Categoria" value={d.categoria} />
          )}
          {d.dataNascimento && (
            <InfoRow icon={Calendar} label="Nascimento" value={d.dataNascimento} />
          )}
          {d.dataEmissao && (
            <InfoRow icon={Calendar} label="Emissão" value={d.dataEmissao} />
          )}
          {d.dataValidade && (
            <InfoRow icon={Calendar} label="Validade" value={d.dataValidade} />
          )}
          {d.cidadeEstado && (
            <InfoRow icon={MapPin} label="Local" value={d.cidadeEstado} />
          )}
          {d.rg && (
            <InfoRow icon={CreditCard} label="RG" value={d.rg} />
          )}
          {d.nacionalidade && (
            <InfoRow icon={User} label="Nacionalidade" value={d.nacionalidade} />
          )}
        </div>

        {/* Footer */}
        <div className="bg-[hsl(230,30%,16%)] rounded-3xl p-4 border border-[hsl(230,30%,24%)] shadow-2xl text-center">
          <p className="text-xs text-[hsl(210,20%,65%)]">Verificado em {createdDate}</p>
          <p className="text-xs text-[hsl(210,20%,65%)] mt-1">ID: {data.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-[hsl(265,60%,55%)]/10 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-[hsl(265,60%,55%)]" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-[hsl(210,20%,65%)]">{label}</p>
      <p className="text-sm font-semibold text-white truncate">{value}</p>
    </div>
  </div>
);

export default DocumentVerification;

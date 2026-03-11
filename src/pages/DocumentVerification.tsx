import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, CheckCircle2, XCircle } from "lucide-react";

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
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#1a73e8] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-lg">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Documento Não Encontrado</h1>
          <p className="text-gray-500">O documento solicitado não foi encontrado ou o link é inválido.</p>
        </div>
      </div>
    );
  }

  const d = data.document_data;
  const isValid = data.status === "valid";
  const createdDate = new Date(data.created_at).toLocaleDateString("pt-BR");

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      {/* Top Header Bar */}
      <div className="bg-[#1351b4] w-full">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Shield className="w-6 h-6 text-white" />
          <div>
            <p className="text-white text-sm font-bold tracking-wide">carteira-digital-transito-vio.info</p>
            <p className="text-blue-200 text-[10px]">Consulta de Autenticidade</p>
          </div>
        </div>
      </div>

      {/* Green/Red Status Banner */}
      <div className={`w-full ${isValid ? "bg-[#168821]" : "bg-[#e52207]"}`}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-center gap-2">
          {isValid ? <CheckCircle2 className="w-5 h-5 text-white" /> : <XCircle className="w-5 h-5 text-white" />}
          <span className="text-white font-bold text-sm tracking-wider">
            {isValid ? "DOCUMENTO VÁLIDO" : "DOCUMENTO INVÁLIDO"}
          </span>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Photo + Name Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-[#1351b4] px-4 py-2">
            <p className="text-white text-xs font-semibold tracking-wider uppercase">Identificação do Titular</p>
          </div>
          <div className="p-4 flex items-start gap-4">
            {data.photo_url ? (
              <img
                src={data.photo_url}
                alt="Foto do Titular"
                className="w-24 h-32 rounded-lg object-cover border-2 border-[#1351b4] shadow-sm"
                style={{ aspectRatio: "3/4" }}
              />
            ) : (
              <div className="w-24 h-32 rounded-lg bg-gray-200 flex items-center justify-center border-2 border-gray-300" style={{ aspectRatio: "3/4" }}>
                <span className="text-gray-400 text-xs">Sem foto</span>
              </div>
            )}
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Nome Completo</p>
              <p className="text-base font-bold text-gray-900 leading-tight">{data.document_name}</p>
              <div className="mt-2 inline-flex items-center gap-1 bg-[#1351b4]/10 text-[#1351b4] text-[11px] font-semibold px-2 py-1 rounded-md">
                <Shield className="w-3 h-3" />
                {data.document_type}
              </div>
            </div>
          </div>
        </div>

        {/* Document Data Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-[#1351b4] px-4 py-2">
            <p className="text-white text-xs font-semibold tracking-wider uppercase">Dados do Documento</p>
          </div>
          <div className="divide-y divide-gray-100">
            {d.cpf && <DataRow label="CPF" value={d.cpf} />}
            {d.registro && <DataRow label="Nº Registro" value={d.registro} />}
            {d.categoria && <DataRow label="Categoria" value={d.categoria} />}
            {d.rg && <DataRow label="Identidade / RG" value={d.rg} />}
            {d.nacionalidade && <DataRow label="Nacionalidade" value={d.nacionalidade} />}
            {d.genero && <DataRow label="Sexo" value={d.genero === "Masculino" ? "M" : "F"} />}
            {d.dataNascimento && <DataRow label="Data de Nascimento" value={d.dataNascimento} />}
            {d.nomePai && <DataRow label="Filiação (Pai)" value={d.nomePai} />}
            {d.nomeMae && <DataRow label="Filiação (Mãe)" value={d.nomeMae} />}
          </div>
        </div>

        {/* Validity Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-[#1351b4] px-4 py-2">
            <p className="text-white text-xs font-semibold tracking-wider uppercase">Validade e Emissão</p>
          </div>
          <div className="divide-y divide-gray-100">
            {d.dataEmissao && <DataRow label="Data de Emissão" value={d.dataEmissao} />}
            {d.dataValidade && <DataRow label="Data de Validade" value={d.dataValidade} />}
            {d.cidadeEstado && <DataRow label="Local de Emissão" value={d.cidadeEstado} />}
            {d.renach && <DataRow label="Nº RENACH" value={d.renach} />}
            {d.espelho && <DataRow label="Nº Espelho" value={d.espelho} />}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-xl shadow-md p-4 text-center space-y-1">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Verificação realizada em</p>
          <p className="text-sm font-semibold text-gray-700">{createdDate}</p>
          <p className="text-[10px] text-gray-400 mt-2">ID: {data.id.slice(0, 8).toUpperCase()}</p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-[10px] text-gray-400">carteira-digital-transito-vio.info</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DataRow = ({ label, value }: { label: string; value: string }) => (
  <div className="px-4 py-3 flex justify-between items-center">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-sm font-semibold text-gray-900 text-right">{value}</span>
  </div>
);

export default DocumentVerification;

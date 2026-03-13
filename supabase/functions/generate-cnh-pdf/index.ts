import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const API_KEY = Deno.env.get("PDF_GENERATOR_API_KEY");
    const API_SECRET = Deno.env.get("PDF_GENERATOR_API_SECRET");
    const TEMPLATE_ID = Deno.env.get("PDF_GENERATOR_TEMPLATE_ID");

    if (!API_KEY || !API_SECRET || !TEMPLATE_ID) {
      throw new Error("PDF Generator API credentials not configured");
    }

    const body = await req.json();

    const {
      nome_completo,
      cpf,
      data_nascimento,
      rg,
      data_emissao,
      data_validade,
      codigo_seguranca,
      renach,
      numero_espelho,
      data_primeira_hab,
      cidade_estado,
      estado_extenso,
      registro,
      categoria,
      nome_pai,
      nome_mae,
      nacionalidade,
      genero,
      observacoes,
      foto_base64,
      assinatura_base64,
      watermark,
      verification_url,
    } = body;

    const templateData: Record<string, string> = {
      nome_completo: nome_completo || "",
      cpf: cpf || "",
      data_nascimento: data_nascimento || "",
      rg: rg || "",
      categoria: categoria || "",
      renach: renach || "",
      numero_espelho: numero_espelho || "",
      data_emissao: data_emissao || "",
      data_validade: data_validade || "",
      data_primeira_hab: data_primeira_hab || "",
      cidade_estado: cidade_estado || "",
      estado_extenso: estado_extenso || "",
      nome_pai: nome_pai || "",
      nome_mae: nome_mae || "",
      codigo_seguranca: codigo_seguranca || "",
      registro: registro || "",
      nacionalidade: nacionalidade || "",
      genero: genero || "",
      observacoes: observacoes || "",
      verification_url: verification_url || "",
    };

    if (foto_base64) templateData.foto_3x4 = foto_base64;
    if (assinatura_base64) templateData.assinatura = assinatura_base64;
    if (watermark) templateData.watermark = "BELLARUS - PREVIEW";

    const regClean = (registro || "").replace(/\D/g, "");
    const nascParts = (data_nascimento || "").split(",")[0]?.split("/") || [];
    const nascYYMMDD = nascParts.length >= 3
      ? `${nascParts[2]?.slice(-2) || "00"}${nascParts[1] || "00"}${nascParts[0] || "00"}`
      : "000000";
    const valParts = (data_validade || "").split("/") || [];
    const valYYMMDD = valParts.length >= 3
      ? `${valParts[2]?.slice(-2) || "00"}${valParts[1] || "00"}${valParts[0] || "00"}`
      : "000000";
    const gChar = genero === "Feminino" ? "F" : "M";
    const nameMRZ = (nome_completo || "").replace(/\s+/g, "<").toUpperCase();

    templateData.mrz_line1 = `I<BRA${regClean.padEnd(15, "<")}`;
    templateData.mrz_line2 = `${nascYYMMDD}${gChar}${valYYMMDD}BRA${"<".repeat(12)}4`;
    templateData.mrz_line3 = `${nameMRZ}${"<".repeat(Math.max(0, 30 - nameMRZ.length))}`;
    templateData.nacionalidade_formatada = nacionalidade === "BRASILEIRA"
      ? "BRASILEIRO(A)"
      : nacionalidade === "ESTRANGEIRA"
        ? "ESTRANGEIRO(A)"
        : "";

    const pdfGenUrl = "https://us1.pdfgeneratorapi.com/api/v4/documents/generate";
    const requestPayload = {
      template: {
        id: Number(TEMPLATE_ID),
        output: "pdf",
      },
      data: templateData,
    };

    const pdfResponse = await fetch(pdfGenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Auth-Key": API_KEY,
        "X-Auth-Secret": API_SECRET,
      },
      body: JSON.stringify(requestPayload),
    });

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text();
      console.error("PDF Generator API error:", pdfResponse.status, errorText);
      throw new Error(`PDF Generator API error [${pdfResponse.status}]: ${errorText}`);
    }

    const pdfResult = await pdfResponse.json();

    if (pdfResult.response) {
      const pdfBase64 = pdfResult.response;
      const binaryString = atob(pdfBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return new Response(bytes, {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="CNH_${(nome_completo || "documento").replace(/\s+/g, "_")}.pdf"`,
        },
      });
    }

    if (pdfResult.response_url || pdfResult.url) {
      const pdfUrl = pdfResult.response_url || pdfResult.url;
      const pdfDownload = await fetch(pdfUrl);
      if (!pdfDownload.ok) {
        throw new Error("Failed to download generated PDF");
      }
      const pdfBytes = new Uint8Array(await pdfDownload.arrayBuffer());

      return new Response(pdfBytes, {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="CNH_${(nome_completo || "documento").replace(/\s+/g, "_")}.pdf"`,
        },
      });
    }

    throw new Error("Unexpected PDF Generator API response format");
  } catch (e) {
    console.error("generate-cnh-pdf error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { decode as base64Decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
      qr_code_base64,
      watermark,
      verification_url,
    } = await req.json();

    // Load the template PDF from the deployed project's public folder
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    
    // The template is stored in Supabase Storage or we embed it
    // For now, we'll load it from the public URL
    const templateUrl = `${SUPABASE_URL}/storage/v1/object/public/templates/template_cnh.pdf`;
    
    // Try loading from storage first, fall back to creating from scratch
    let pdfDoc: any;
    let page: any;
    let usedTemplate = false;
    
    try {
      const templateResp = await fetch(templateUrl);
      if (templateResp.ok) {
        const templateBytes = new Uint8Array(await templateResp.arrayBuffer());
        pdfDoc = await PDFDocument.load(templateBytes);
        page = pdfDoc.getPages()[0];
        usedTemplate = true;
      } else {
        throw new Error("Template not in storage");
      }
    } catch {
      // If storage fails, try embedded template approach
      // Create document and load background image
      pdfDoc = await PDFDocument.create();
      page = pdfDoc.addPage([595.28, 841.89]);
    }

    const { width: pageW, height: pageH } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const mrzFont = await pdfDoc.embedFont(StandardFonts.Courier);

    if (usedTemplate) {
      // Layout fixo por coordenadas (sem substituição de placeholders)
      // 1) Limpa quaisquer placeholders de campos de formulário (AcroForm)
      // 2) Oculta placeholders textuais com "máscara" nas áreas dos campos
      // 3) Desenha dados finais com drawText/drawImage
      try {
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        for (const field of fields) {
          const f = field as any;
          if (typeof f.setText === "function") f.setText("");
          if (typeof f.uncheck === "function") f.uncheck();
        }
        form.flatten();
      } catch (e) {
        console.warn("Template sem AcroForm para limpar:", e);
      }

      // Template canvas: 1653x2339 pixels mapped to PDF points
      const TW = 1653;
      const TH = 2339;
      const scaleX = pageW / TW;
      const scaleY = pageH / TH;

      const clearField = (
        fx: number,
        fy: number,
        fw: number,
        fh: number,
        bg?: { r: number; g: number; b: number },
      ) => {
        const pdfX = fx * scaleX;
        const pdfY = pageH - (fy + fh) * scaleY;
        const color = bg ? rgb(bg.r, bg.g, bg.b) : rgb(0.84, 0.91, 0.88);
        page.drawRectangle({
          x: pdfX,
          y: pdfY,
          width: fw * scaleX,
          height: fh * scaleY,
          color,
        });
      };

      const drawField = (
        text: string,
        fx: number,
        fy: number,
        fw: number,
        fh: number,
        fontSize: number,
        options?: { bold?: boolean; color?: { r: number; g: number; b: number }; font?: any },
      ) => {
        if (!text) return;
        const pdfX = fx * scaleX;
        const pdfY = pageH - (fy + fh) * scaleY;
        const scaledSize = Math.min(fontSize * scaleY * 1.1, 14);
        const usedFont = options?.font || (options?.bold !== false ? fontBold : font);
        const color = options?.color ? rgb(options.color.r, options.color.g, options.color.b) : rgb(0, 0, 0);

        page.drawText(text, {
          x: pdfX,
          y: pdfY + 2 * scaleY,
          size: scaledSize,
          font: usedFont,
          color,
          maxWidth: fw * scaleX,
        });
      };

      // Limpa áreas dos placeholders para o PDF final sair limpo
      [
        [302, 220, 510, 28],   // nome
        [830, 220, 195, 28],   // primeira habilitação
        [302, 278, 575, 24],   // nascimento/local
        [302, 330, 172, 24],   // emissão
        [500, 330, 172, 24],   // validade
        [302, 378, 520, 24],   // rg
        [302, 428, 210, 24],   // cpf
        [538, 428, 185, 24],   // registro
        [758, 428, 85, 24],    // categoria
        [302, 475, 380, 24],   // nacionalidade
        [302, 520, 520, 24],   // pai
        [302, 548, 520, 24],   // mae
        [142, 910, 395, 115],  // observacoes
        [112, 1172, 330, 22],  // cidade_estado
        [455, 1172, 330, 22],  // codigo seguranca
        [455, 1198, 330, 22],  // renach
        [112, 1235, 480, 42],  // estado extenso
      ].forEach(([x, y, w, h]) => clearField(x, y, w, h));

      // Dados principais
      drawField(nome_completo, 302, 220, 510, 28, 17);
      drawField(data_primeira_hab, 830, 220, 195, 28, 15);
      drawField(data_nascimento, 302, 278, 575, 24, 13, { bold: false });
      drawField(data_emissao, 302, 330, 172, 24, 13, { bold: false });
      drawField(data_validade, 500, 330, 172, 24, 13, { bold: false });
      drawField(rg, 302, 378, 520, 24, 13, { bold: false });
      drawField(cpf, 302, 428, 210, 24, 13, { bold: false });
      drawField(registro, 538, 428, 185, 24, 13, { color: { r: 0.8, g: 0, b: 0 } });
      drawField(categoria, 758, 428, 85, 24, 13, { bold: false });

      const nacText = nacionalidade === "BRASILEIRA" ? "BRASILEIRO(A)" : nacionalidade === "ESTRANGEIRA" ? "ESTRANGEIRO(A)" : "";
      drawField(nacText, 302, 475, 380, 24, 13, { bold: false });
      drawField(nome_pai, 302, 520, 520, 24, 13, { bold: false });
      drawField(nome_mae, 302, 548, 520, 24, 13, { bold: false });
      drawField(observacoes || "", 142, 910, 395, 115, 12, { bold: false });
      drawField("Documento assinado com certificado digital", 225, 1095, 430, 24, 12, { bold: false });
      drawField("DEPARTAMENTO ESTADUAL DE TRÂNSITO", 165, 1120, 500, 22, 11, { bold: false });
      drawField(cidade_estado, 112, 1172, 330, 22, 12, { bold: false });
      drawField(codigo_seguranca, 455, 1172, 330, 22, 12, { bold: false });
      drawField(renach, 455, 1198, 330, 22, 12, { bold: false });
      drawField(estado_extenso, 112, 1235, 480, 42, 26, { bold: true });

      // Espelho vertical
      if (numero_espelho) {
        const espFS = 8 * scaleY;
        const chars = numero_espelho.split("");
        const drawVert = (startX: number, startY: number) => {
          chars.forEach((ch: string, i: number) => {
            page.drawText(ch, {
              x: startX * scaleX,
              y: pageH - (startY + i * 14) * scaleY,
              size: espFS,
              font: fontBold,
              color: rgb(0, 0, 0),
            });
          });
        };
        drawVert(52, 255);
        drawVert(52, 620);
      }

      // MRZ
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

      const mrzLines = [
        `I<BRA${regClean.padEnd(15, "<")}`,
        `${nascYYMMDD}${gChar}${valYYMMDD}BRA${"<".repeat(12)}4`,
        `${nameMRZ}${"<".repeat(Math.max(0, 30 - nameMRZ.length))}`,
      ];

      const mrzFS = 9;
      const mrzX = 78 * scaleX;
      const mrzBaseY = pageH - 1710 * scaleY;
      mrzLines.forEach((line, i) => {
        page.drawText(line, {
          x: mrzX,
          y: mrzBaseY - i * (mrzFS + 4) * scaleY,
          size: mrzFS,
          font: mrzFont,
          color: rgb(0, 0, 0),
        });
      });

      // Embed photo
      if (foto_base64) {
        try {
          const photoData = foto_base64.includes(",") ? foto_base64.split(",")[1] : foto_base64;
          const photoBytes = base64Decode(photoData);
          const isPng = foto_base64.includes("image/png");
          const photoImg = isPng
            ? await pdfDoc.embedPng(photoBytes)
            : await pdfDoc.embedJpg(photoBytes);
          page.drawImage(photoImg, {
            x: 80 * scaleX,
            y: pageH - (250 + 275) * scaleY,
            width: 198 * scaleX,
            height: 275 * scaleY,
          });
        } catch (e) {
          console.error("Error embedding photo:", e);
        }
      }

      // Embed signature
      if (assinatura_base64) {
        try {
          const sigData = assinatura_base64.includes(",") ? assinatura_base64.split(",")[1] : assinatura_base64;
          const sigBytes = base64Decode(sigData);
          const isPng = assinatura_base64.includes("image/png");
          const sigImg = isPng
            ? await pdfDoc.embedPng(sigBytes)
            : await pdfDoc.embedJpg(sigBytes);
          page.drawImage(sigImg, {
            x: 82 * scaleX,
            y: pageH - (568 + 48) * scaleY,
            width: 194 * scaleX,
            height: 48 * scaleY,
          });
        } catch (e) {
          console.error("Error embedding signature:", e);
        }
      }

      // Embed QR Code (quando enviado pelo frontend)
      if (qr_code_base64) {
        try {
          const qrData = qr_code_base64.includes(",") ? qr_code_base64.split(",")[1] : qr_code_base64;
          const qrBytes = base64Decode(qrData);
          const isPng = qr_code_base64.includes("image/png");
          const qrImg = isPng
            ? await pdfDoc.embedPng(qrBytes)
            : await pdfDoc.embedJpg(qrBytes);
          page.drawImage(qrImg, {
            x: 905 * scaleX,
            y: pageH - (108 + 500) * scaleY,
            width: 500 * scaleX,
            height: 500 * scaleY,
          });
        } catch (e) {
          console.error("Error embedding QR code:", e);
        }
      }
    }

    // Watermark
    if (watermark) {
      const TW = 1653;
      const TH = 2339;
      const scaleY = pageH / TH;
      const scaleX = pageW / TW;
      const wmFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      [260, 700, 1140, 1580, 2020].forEach((topPos: number) => {
        page.drawText("BELLARUS NÃO COPIE", {
          x: 120 * scaleX,
          y: pageH - topPos * scaleY,
          size: 72 * scaleY,
          font: wmFont,
          color: rgb(1, 0, 0),
          opacity: 0.15,
        });
      });
    }

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="CNH_${(nome_completo || "documento").replace(/\s+/g, "_")}.pdf"`,
      },
    });
  } catch (e) {
    console.error("generate-cnh-pdf error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

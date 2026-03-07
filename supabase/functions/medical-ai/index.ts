import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, query } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let toolDef: any = null;
    let toolChoice: any = undefined;

    if (type === "cid") {
      systemPrompt = "Você é um assistente médico. O usuário vai descrever sintomas ou pedir um CID. Retorne os CIDs mais relevantes usando a ferramenta fornecida. Sempre retorne entre 3 e 8 resultados relevantes. Responda apenas com a ferramenta.";
      toolDef = {
        type: "function",
        function: {
          name: "suggest_cids",
          description: "Retorna CIDs relevantes para os sintomas descritos",
          parameters: {
            type: "object",
            properties: {
              results: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    code: { type: "string", description: "Código CID-10" },
                    name: { type: "string", description: "Nome da doença/condição" },
                    days: { type: "number", description: "Dias sugeridos de afastamento" }
                  },
                  required: ["code", "name", "days"],
                  additionalProperties: false
                }
              }
            },
            required: ["results"],
            additionalProperties: false
          }
        }
      };
      toolChoice = { type: "function", function: { name: "suggest_cids" } };
    } else if (type === "medicamento") {
      systemPrompt = "Você é um assistente farmacêutico. O usuário vai descrever sintomas ou pedir medicamentos. Retorne medicamentos relevantes com doses usando a ferramenta fornecida. Sempre retorne entre 3 e 8 resultados. Responda apenas com a ferramenta.";
      toolDef = {
        type: "function",
        function: {
          name: "suggest_medicamentos",
          description: "Retorna medicamentos relevantes",
          parameters: {
            type: "object",
            properties: {
              results: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    nome: { type: "string", description: "Nome do medicamento com dosagem" },
                    tipo: { type: "string", description: "Tipo/classe do medicamento" },
                    dose: { type: "string", description: "Posologia sugerida" }
                  },
                  required: ["nome", "tipo", "dose"],
                  additionalProperties: false
                }
              }
            },
            required: ["results"],
            additionalProperties: false
          }
        }
      };
      toolChoice = { type: "function", function: { name: "suggest_medicamentos" } };
    } else if (type === "medico") {
      systemPrompt = "Você é um assistente médico. Gere dados fictícios de médico para preenchimento de formulário usando a ferramenta. O nome deve ser brasileiro, o CRM deve ter 6 dígitos. Gere 1 resultado.";
      toolDef = {
        type: "function",
        function: {
          name: "suggest_medico",
          description: "Retorna dados de médico para preenchimento",
          parameters: {
            type: "object",
            properties: {
              nome: { type: "string", description: "Nome do médico com DR./DRA." },
              crm: { type: "string", description: "Número CRM com 6 dígitos" },
              especialidade: { type: "string", description: "Especialidade médica" }
            },
            required: ["nome", "crm", "especialidade"],
            additionalProperties: false
          }
        }
      };
      toolChoice = { type: "function", function: { name: "suggest_medico" } };
    } else if (type === "upa") {
      systemPrompt = "Você é um assistente. Gere dados fictícios de uma UPA/hospital/clínica brasileira para preenchimento de formulário usando a ferramenta. O endereço deve ser brasileiro realista. CNES com 7 dígitos. Gere 1 resultado.";
      toolDef = {
        type: "function",
        function: {
          name: "suggest_upa",
          description: "Retorna dados de UPA/Hospital/Clínica",
          parameters: {
            type: "object",
            properties: {
              nome: { type: "string", description: "Nome da UPA/Hospital" },
              endereco: { type: "string", description: "Endereço completo" },
              telefone: { type: "string", description: "Telefone com DDD" },
              cnes: { type: "string", description: "Código CNES com 7 dígitos" }
            },
            required: ["nome", "endereco", "telefone", "cnes"],
            additionalProperties: false
          }
        }
      };
      toolChoice = { type: "function", function: { name: "suggest_upa" } };
    } else {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: any = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query || "Gere dados" }
      ],
      tools: [toolDef],
      tool_choice: toolChoice,
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes para IA." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "No results" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("medical-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

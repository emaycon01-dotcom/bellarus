import { supabase } from "@/integrations/supabase/client";

export async function saveDocumentHistory(
  userId: string,
  documentType: string,
  documentName: string
) {
  const { error } = await supabase.from("document_history").insert({
    user_id: userId,
    document_type: documentType,
    document_name: documentName,
  });

  if (error) {
    console.error("Erro ao salvar histórico:", error);
  }
}

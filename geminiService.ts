import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateChatResponse = async (
  message: string, 
  subject: string,
  history: { role: 'user' | 'model'; text: string }[]
) => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Construct a context-aware prompt based on the "Knowledge Base" simulation
    const systemInstruction = `You are Smart Doc, an intelligent assistant for the company. 
    The user is asking questions about the subject: "${subject}". 
    Assume you have access to a vast knowledge base about this topic.
    Answer professionally, concisely, and use Markdown formatting.
    If the question is about specific internal documents, pretend you found relevant info.`;

    const contents = history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }));

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Sorry, I encountered an error accessing the knowledge base.";
  }
};

export const analyzeDocument = async (fileName: string, fileType: string, company: string, docType: string) => {
  try {
    // In a real app, we would upload the file bytes. 
    // Here we simulate analysis based on metadata for the mockup.
    
    const prompt = `
      Atue como um analista de documentos sênior e especialista jurídico.
      Acabei de fazer upload de um documento com os seguintes detalhes:
      - Nome do Arquivo: ${fileName}
      - Formato: ${fileType}
      - Contexto da Empresa: ${company}
      - Tipo de Documento: ${docType}

      Por favor, forneça uma análise simulada e detalhada do que este documento provavelmente contém.
      Estruture sua resposta estritamente em Markdown (pt-BR) com as seguintes seções:
      1. **Resumo Executivo**: Uma visão geral breve e direta do propósito do documento.
      2. **Cláusulas e Pontos Chave**: Detalhes importantes extraídos que são tipicamente críticos em um ${docType}.
      3. **Análise de Risco**: Riscos potenciais encontrados (Alto/Médio/Baixo) e pontos de atenção.
      4. **Recomendações**: Ações sugeridas para a empresa.
      
      Mantenha o tom profissional, corporativo e realista, preenchendo com dados fictícios plausíveis para este tipo de documento.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Não foi possível analisar o documento neste momento.";
  }
};
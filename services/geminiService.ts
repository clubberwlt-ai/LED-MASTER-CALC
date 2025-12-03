import { GoogleGenAI } from "@google/genai";
import { WallStats, Cabinet } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTechnicalAdvice = async (
  stats: WallStats, 
  cabinet: Cabinet, 
  userQuery: string
): Promise<string> => {
  try {
    const prompt = `
      Você é um Engenheiro Especialista em Painéis de LED (Audio Visual).
      Analise a seguinte configuração de painel de LED e responda à pergunta do usuário em Português do Brasil.
      
      Detalhes da Configuração:
      - Modelo do Gabinete: ${cabinet.brand} ${cabinet.model} (Pitch: P${cabinet.pitch})
      - Dimensões Totais: ${(stats.totalWidthMm / 1000).toFixed(2)}m (L) x ${(stats.totalHeightMm / 1000).toFixed(2)}m (A)
      - Resolução: ${stats.totalPixelsW}px x ${stats.totalPixelsH}px
      - Total de Pixels: ${stats.totalPixels.toLocaleString()}
      - Proporção (Aspect Ratio): ${stats.aspectRatio.toFixed(2)}:1
      - Peso Estimado: ${stats.totalWeightKg} kg
      - Carga Máxima de Energia: ${(stats.totalMaxPowerW / 1000).toFixed(2)} kW
      
      Pergunta do Usuário: "${userQuery}"
      
      Forneça uma resposta técnica, concisa e útil, adequada para um técnico de eventos ou gerente de projetos.
      Se a resolução não for padrão (não for 16:9), mencione as implicações de escalonamento (scaling).
      Se a potência for alta, mencione requisitos de distribuição de energia (trifásico, etc).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Nenhum conselho gerado.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Não foi possível obter o conselho da IA no momento. Verifique a configuração da sua chave de API.";
  }
};
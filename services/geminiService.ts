import { WallStats, Cabinet } from '../types';

// Serviço desativado temporariamente pois a dependência @google/genai foi removida.
// Mantemos a estrutura da função para não quebrar importações legadas se houverem.

export const getTechnicalAdvice = async (
  stats: WallStats, 
  cabinet: Cabinet, 
  userQuery: string
): Promise<string> => {
  return "O assistente de IA foi desativado nesta versão.";
};

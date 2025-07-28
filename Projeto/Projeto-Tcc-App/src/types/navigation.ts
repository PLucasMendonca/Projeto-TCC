import type { SearchResult, AppDetails } from './types';
import type { DeviceSpecs } from './DeviceSpecs';
// Importamos o tipo de ambos os serviços para compatibilidade
import type { CompatibilityResult as CompatibilityCheckerResult } from '../services/compatibility-checker';

// Mantendo o tipo para compatibilidade com outros componentes
export type CompatibilityResult = CompatibilityCheckerResult;

export type RootStackParamList = {
  TelaIntroducao: undefined;
  TelaLogin: undefined;
  TelaCadastro: undefined;
  TelaInicial: undefined;
  TelaPerfil: undefined;
  TelaHistorico: undefined;
  TelaFeedback: undefined;
  TelaDetalhesJogo: { appId: string, app: SearchResult };
  TelaResultadosBusca: { searchQuery: string };
  ResetSenha: { oobCode?: string };
  TelaCarregamentoComparacao: {
    appId: string;
    appName: string;
    appIcon?: string;
  };
  // TelaComparacao foi removida pois não é mais utilizada
};

import { IBankingProvider, IBankingData } from '../../domain/entities/IBankingProvider';

export class BrazilBankAdapter implements IBankingProvider {
  /**
   * Simula la consulta a un Bureau de Crédito brasileño.
   * Normaliza la respuesta para que el Worker siempre reciba score y totalDebt.
   */
  async getFinancialData(docNumber: string): Promise<IBankingData> {
    // Simula que la API de Brasil solo devuelve el score.
    // Inicializamos totalDebt en 0 para cumplir con el contrato de la interfaz.
    return { 
      score: 750, 
      totalDebt: 0,
      isStable: true 
    }; 
  }
}
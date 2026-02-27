import { IBankingProvider, IBankingData } from '../../domain/entities/IBankingProvider';

export class SpainBankAdapter implements IBankingProvider {
  async getFinancialData(docNumber: string): Promise<IBankingData> {
    return {
      isStable: true,
      totalDebt: 0,
      score: 500 
    };
  }
}
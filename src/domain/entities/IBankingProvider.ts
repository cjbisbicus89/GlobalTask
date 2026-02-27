export interface IBankingData {
  score: number;      // Sin '?', obligatorio
  totalDebt: number;  // Sin '?', obligatorio
  isStable?: boolean; // Este sí puede ser opcional
}

export interface IBankingProvider {
  getFinancialData(docNumber: string): Promise<IBankingData>;
}
import { PrismaClient } from '@prisma/client';

export class ConfigRepository {
  
  constructor(private prisma: any) {}

  //validar las reglas de España o México 
  async getActiveRules(country: string) {
    return await this.prisma.countryRule.findMany({
      where: { 
        countryCode: country, 
        isActive: true 
      },
      orderBy: {
        priority: 'asc' 
      }
    });
  }

  // Banco externo conectar según el país
  async getBankProvider(country: string) {
    return await this.prisma.bankProvider.findFirst({
      where: { countryCode: country }
    });
  }
}
import { SpainBankAdapter } from './spain-bank';
import { BrazilBankAdapter } from './brazil-bank';


export class BankingFactory {
  static getProvider(countryCode: string) {
    switch (countryCode) {
      case 'ES':
      case 'PT':
      case 'IT':
        return new SpainBankAdapter();
      case 'BR':
        return new BrazilBankAdapter();
      case 'MX':
      case 'CO':
        
        return new SpainBankAdapter(); 
      default:
        throw new Error("País no soportado por proveedores bancarios");
    }
  }
}
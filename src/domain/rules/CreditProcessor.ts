import { CreditRepository } from '../../infrastructure/repositories/CreditRepository';
import { ConfigRepository } from '../../infrastructure/repositories/ConfigRepository';
import { SharedRepository } from '../../infrastructure/repositories/SharedRepository';
import { randomUUID } from 'crypto';

export class CreditProcessor {
  // Mapa de transiciones permitidas según el catálogo de 8 estados
  private readonly STATUS_FLOW: Record<number, number[]> = {
    1: [2],       // received -> verifying_id
    2: [3, 8],    // verifying_id -> fetching_data o rejected
    3: [4, 8],    // fetching_data -> evaluating_risk o rejected
    4: [5, 6, 8], // evaluating_risk -> waiting_webhook, pending_signature o rejected
    5: [4, 6,7, 8], // waiting_webhook -> evaluating_risk, pending_signature o rejected
    6: [7, 8],    // pending_signature -> approved o rejected
    7: [],        // Estado final: approved
    8: []         // Estado final: rejected
  };

  constructor(
    private creditRepo: CreditRepository,
    private configRepo: ConfigRepository,
    private sharedRepo: SharedRepository
  ) {}

  /* Valida si una transición de estado es permitida por el negocio */
  validateTransition(currentStatusId: number, nextStatusId: number): void {
    // Validar existencia en el catálogo
    if (nextStatusId < 1 || nextStatusId > 8) {
      throw new Error(`INVALID_STATUS: El estado ${nextStatusId} no existe en el catálogo.`);
    }

    const allowed = this.STATUS_FLOW[currentStatusId] || [];
    if (!allowed.includes(nextStatusId)) {
      throw new Error(`No es posible pasar del estado ${currentStatusId} al ${nextStatusId}.`);
    }
  }

  /**
   * Procesa la creación de una nueva solicitud 
   */
  async execute(data: any) {
    //Cargar reglas desde la DB 
    const rules = await this.configRepo.getActiveRules(data.countryCode);
    data.currentStatusId = 1; // ID 1: 'received' [cite: 39]

    for (const rule of rules) {
      //Formato de Identidad (DNI, CC, CPF, etc.)
      if (rule.operator === 'REGEX' && rule.validationRegex) {
        const regex = new RegExp(rule.validationRegex, 'i');
        if (!regex.test(data.docNumber)) {
          throw new Error(`FORMAT_ERROR: ${rule.description}`);
        }
      }
      
      if (rule.ruleValue && rule.operator !== 'REGEX') {
        const isInvalid = this.evaluateFinancialRule(rule, data);
        if (isInvalid) {
          // Excepción específica para España (Numeral 3.2 - ES) [cite: 48]
          if (data.countryCode === 'ES' && rule.ruleName === 'MAX_AMOUNT') {
            data.currentStatusId = 4; // ID 4: 'evaluating_risk'
          } else {
            throw new Error(`POLICY_REJECTION: ${rule.description}`);
          }
        }
      }
    }

    //Persistencia y Cifrado PII 
    const application = await this.creditRepo.saveFullApplication({
      ...data,
      correlationId: randomUUID()
    });

    // Auditoría e Inicio de Proceso Asíncrono
    await this.sharedRepo.writeAudit(application.id, 'CREATE_APPLICATION', data.ipAddress || '127.0.0.1');
    
    // Encolamiento 
    await this.sharedRepo.queueBackgroundJob(application.id, 'INITIAL_RISK_ASSESSMENT');

    return {
      success: true,
      applicationId: application.id,
      status: data.currentStatusId === 4 ? 'evaluating_risk' : 'received',
      trackingId: application.correlationId
    };
  }

  /**
   * Evalúa reglas de ratios y montos financieros 
   */
  private evaluateFinancialRule(rule: any, data: any): boolean {
    const limit = Number(rule.ruleValue);
    // Lógica para ratios (deuda/ingreso) solicitada para países como Colombia o México 
    let valueToCompare = (rule.ruleName.includes('RATIO') || rule.ruleName.includes('DEBT'))
      ? Number(data.amount) / Number(data.monthlyIncome)
      : Number(data[rule.ruleName.toLowerCase()]) || Number(data.amount);
    
    switch (rule.operator) {
      case '<=': return valueToCompare > limit;
      case '>=': return valueToCompare < limit;
      case '<':  return valueToCompare >= limit;
      case '>':  return valueToCompare <= limit;
      default:   return false;
    }
  }
}
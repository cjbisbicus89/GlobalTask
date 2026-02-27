import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando carga de datos maestros...');

  // 1. CARGA DE CATÁLOGO DE ESTADOS
  const statuses = [
    { id: 1, name: 'received', userDescription: 'Hemos recibido tus datos y estamos iniciando el proceso.', nameUser: 'Solicitud Recibida'},
    { id: 2, name: 'verifying_id', userDescription: 'Estamos confirmando la validez de tu documento oficial.', nameUser: 'validacion de identidad' },
    { id: 3, name: 'fetching_data', userDescription: 'Conectando con tu banco para agilizar la aprobación.', nameUser: 'Analizando Perfil Financiero' },
    { id: 4, name: 'evaluating_risk', userDescription: 'Nuestro sistema está evaluando las mejores condiciones para ti.', nameUser: 'En Revisión de Crédito' },
    { id: 5, name: 'waiting_webhook', userDescription: 'Estamos verificando un último detalle con un aliado externo.', nameUser: 'pendiente aprobacion' },
    { id: 6, name: 'pending_signature', userDescription: '¡Casi listo! Por favor, firma el pagaré para continuar.', nameUser: 'Pendiente Firma Pagaré' },
    { id: 7, name: 'approved', userDescription: '¡Felicidades! Tu crédito ha sido aprobado con éxito.', nameUser: 'Crédito Aprobado' },
    { id: 8, name: 'rejected', userDescription: 'Lo sentimos, en este momento no podemos procesar tu solicitud.', nameUser: 'No Aprobado' }
  ]

  for (const status of statuses) {
    await prisma.statusCatalog.upsert({
      where: { id: status.id },
      update: { userDescription: status.userDescription, name: status.name },
      create: status,
    })
  }

  // 2. CARGA DE REGLAS POR PAÍS (ES, MX, PT, IT, CO, BR)
  const rules = [
    // ESPAÑA (ES) [cite: 45]
    { countryCode: 'ES', ruleName: 'DOC_FORMAT', description: 'Formato DNI España', ruleValue: null, operator: 'REGEX', validationRegex: '^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$', priority: 1 },
    { countryCode: 'ES', ruleName: 'MAX_AMOUNT', description: 'Monto máximo automático', ruleValue: 10000, operator: '<=', validationRegex: null, priority: 2 },

    // MÉXICO (MX) [cite: 59]
    { countryCode: 'MX', ruleName: 'DOC_FORMAT', description: 'Formato CURP México', ruleValue: null, operator: 'REGEX', validationRegex: '^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9][0-9]$', priority: 1 },
    { countryCode: 'MX', ruleName: 'INCOME_RATIO', description: 'Relación ingreso/monto solicitado', ruleValue: 0.4, operator: '<=', validationRegex: null, priority: 2 },

    // PORTUGAL (PT) [cite: 51]
    { countryCode: 'PT', ruleName: 'DOC_FORMAT', description: 'Formato NIF Portugal', ruleValue: null, operator: 'REGEX', validationRegex: '^[0-9]{9}$', priority: 1 },
    { countryCode: 'PT', ruleName: 'INCOME_RATIO', description: 'Ratio ingreso/monto solicitado', ruleValue: 0.35, operator: '<=', validationRegex: null, priority: 2 },

    // ITALIA (IT) [cite: 55]
    { countryCode: 'IT', ruleName: 'DOC_FORMAT', description: 'Formato Codice Fiscale Italia', ruleValue: null, operator: 'REGEX', validationRegex: '^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$', priority: 1 },
    { countryCode: 'IT', ruleName: 'MIN_INCOME', description: 'Ingreso mínimo para estabilidad financiera', ruleValue: 1500, operator: '>=', validationRegex: null, priority: 2 },

    // COLOMBIA (CO) [cite: 63]
    { countryCode: 'CO', ruleName: 'DOC_FORMAT', description: 'Formato Cédula Ciudadanía', ruleValue: null, operator: 'REGEX', validationRegex: '^[0-9]{5,10}$', priority: 1 },
    { countryCode: 'CO', ruleName: 'TOTAL_DEBT', description: 'Ratio deuda total vs ingreso mensual', ruleValue: 0.5, operator: '<=', validationRegex: null, priority: 2 },

    // BRASIL (BR) [cite: 66]
    { countryCode: 'BR', ruleName: 'DOC_FORMAT', description: 'Formato CPF Brasil', ruleValue: null, operator: 'REGEX', validationRegex: '^[0-9]{11}$', priority: 1 },
    { countryCode: 'BR', ruleName: 'MIN_SCORE', description: 'Puntaje de score bancario mínimo', ruleValue: 600, operator: '>=', validationRegex: null, priority: 2 }
  ]

  for (const rule of rules) {
    await prisma.countryRule.upsert({
      where: { idRule: rules.indexOf(rule) + 1 },
      update: rule,
      create: rule,
    })
  }


  const providers = [
    { idProvider: 1, countryCode: 'ES', providerName: 'TransUnion España', apiConfig: { url: 'https://api.transunion.es', timeout: 5000 } },
    { idProvider: 2, countryCode: 'PT', providerName: 'Banco de Portugal', apiConfig: { url: 'https://api.bportugal.pt', timeout: 5000 } },
    { idProvider: 3, countryCode: 'IT', providerName: 'CRIF Italia', apiConfig: { url: 'https://api.crif.it', timeout: 5000 } },
    { idProvider: 4, countryCode: 'MX', providerName: 'Círculo de Crédito', apiConfig: { url: 'https://api.circulodecredito.com.mx', timeout: 5000 } },
    { idProvider: 5, countryCode: 'CO', providerName: 'Datacrédito Colombia', apiConfig: { url: 'https://api.datacredito.com.co', timeout: 5000 } },
    { idProvider: 6, countryCode: 'BR', providerName: 'Serasa Brasil', apiConfig: { url: 'https://api.serasa.com.br', timeout: 5000 } }
  ]

  for (const provider of providers) {
    await prisma.bankProvider.upsert({
      where: { idProvider: provider.idProvider },
      update: provider,
      create: provider,
    })
  }

 
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
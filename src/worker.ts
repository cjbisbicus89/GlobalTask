import { PrismaClient } from '@prisma/client';
import axios from 'axios'; 
import { BankingFactory } from './infrastructure/adapters/BankingFactory';
import { ConfigRepository } from './infrastructure/repositories/ConfigRepository';
import { CreditRepository } from './infrastructure/repositories/CreditRepository';
import { io } from './infrastructure/realtime/socket';

const prisma = new PrismaClient();
const configRepo = new ConfigRepository(prisma);
const creditRepo = new CreditRepository(prisma);


const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

async function runWorker() {
 
  while (true) {
    const job = await prisma.backgroundJob.findFirst({
      where: { status: 'PENDING' },
      include: { creditRequest: { include: { piiData: true, status: true } } }
    });

    if (!job || !job.creditRequest) {
      await wait(3000);
      continue;
    }

    const { id } = job.creditRequest;

    try {
      await prisma.backgroundJob.update({ 
        where: { idJob: job.idJob }, 
        data: { status: 'PROCESSING', lockedAt: new Date() } 
      });

      // Selección de lógica por tipo de Job
      if (job.jobType === 'CREDIT_ANALYSIS') {
        await processCreditAnalysis(job);
      } 
      else if (job.jobType === 'PROCESS_WEBHOOK_DATA') {
        await processIncomingWebhook(job);
      }
      else if (job.jobType === 'SEND_STATUS_NOTIFICATION') {
        await processStatusNotification(job);
      }

      await prisma.backgroundJob.update({ 
        where: { idJob: job.idJob }, 
        data: { status: 'COMPLETED' } 
      });

    } catch (err) {
      console.error(`Error en Job ${job.idJob} (Solicitud ${id}):`, err);
      await prisma.backgroundJob.update({ 
        where: { idJob: job.idJob }, 
        data: { status: 'FAILED', attempts: { increment: 1 } } 
      });
    }
  }
}

/**
 * Lógica de análisis de riesgo inicial, Procesamiento asíncrono
 */
async function processCreditAnalysis(job: any) {
  const { id, countryCode, piiData } = job.creditRequest;
  
  await creditRepo.updateStatus(id, 2, "Validando formato de identificación");
  await wait(500);
  await creditRepo.updateStatus(id, 3, "Obteniendo reporte del proveedor bancario");
  
  const provider = BankingFactory.getProvider(countryCode);
  const bankInfo = await provider.getFinancialData(piiData?.docNumberHash || '');

  
  if (countryCode === 'CO') {
    await creditRepo.updateStatus(id, 5, "Esperando validación asíncrona de aliado externo (Webhook)");
    console.log(`[ASYNC_PAUSE] Solicitud ${id} pausada. Esperando señal externa.`);
    return; 
  }

  await executeRiskEngine(id, countryCode, bankInfo);
}

/**
 * Lógica para procesar la señal recibida 
 */
async function processIncomingWebhook(job: any) {
  const { id, countryCode, piiData } = job.creditRequest;
  
  console.log(`[WEBHOOK] Reanudando procesamiento para solicitud ${id}`);

  const provider = BankingFactory.getProvider(countryCode);
  const bankInfo = await provider.getFinancialData(piiData?.docNumberHash || '');
  
  // Ejecutamos el motor de reglas 
  const isApproved = await executeRiskEngine(id, countryCode, bankInfo);

  // Si aprueba riesgo, el flujo indica que el siguiente paso lógico es la firma 
  if (isApproved) {
    await wait(1000);
    await creditRepo.updateStatus(id, 6, "Evaluación exitosa. Pendiente firma de pagaré.");
  }

  await prisma.webhookInbox.updateMany({
    where: { payload: { path: ['applicationId'], equals: id }, processedAt: null },
    data: { processedAt: new Date() }
  });
}

/**
 * Motor de reglas - Centraliza la validación según reglas por país 
 */
async function executeRiskEngine(id: string, countryCode: string, bankInfo: any): Promise<boolean> {
 
  await creditRepo.updateStatus(id, 4, "Ejecutando motor de reglas de riesgo");
  await wait(1000); 

  const rules = await configRepo.getActiveRules(countryCode);
  let finalStatusId = 7; // Approved inicial

  for (const rule of rules) {
    const ruleVal = Number(rule.ruleValue);
    // Validación de score y deuda requerida por la prueba
    if (rule.ruleName === 'MIN_SCORE' && Number(bankInfo.score) < ruleVal) finalStatusId = 8;
    if (rule.ruleName === 'MAX_DEBT' && Number(bankInfo.totalDebt) > ruleVal) finalStatusId = 8;
  }

  const finalMsg = finalStatusId === 7 ? "Aprobado por política de riesgo" : "Rechazado por política de riesgo";
  await creditRepo.updateStatus(id, finalStatusId, finalMsg);
  
  return finalStatusId === 7;
}

/**
 * Notificaciones en tiempo real 
 */
async function processStatusNotification(job: any) {
  const { id, currentStatusId } = job.creditRequest;
  const statusName = job.creditRequest.status?.name || 'Desconocido';

  if (io) {
    io.to(`credit_${id}`).emit('status_updated', {
      applicationId: id,
      newStatusId: currentStatusId,
      statusName: statusName,
      message: `Cambio de estado: ${statusName}`
    });
  }

  try {
    const EXTERNAL_WEBHOOK = process.env.WEBHOOK_URL || 'https://webhook.site/simulated-fintech-endpoint';
    await axios.post(EXTERNAL_WEBHOOK, {
      event: 'status.changed',
      data: { applicationId: id, status: statusName, statusId: currentStatusId }
    });
  } catch (error) {
    console.error(`[NOTIFY_ERROR] No se pudo notificar al sistema externo: ${id}`);
  }
}

runWorker();
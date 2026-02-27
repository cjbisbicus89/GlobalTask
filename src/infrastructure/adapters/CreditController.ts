import { CreditProcessor } from '../../domain/rules/CreditProcessor';
import { CreditRepository } from '../repositories/CreditRepository';
import { ConfigRepository } from '../repositories/ConfigRepository';
import { SharedRepository } from '../repositories/SharedRepository';
import { EncryptionService } from '../security/EncryptionService';
import { CreditService } from '../../services/CreditService'; 
import prisma from '../database/prisma'; 
import { redisClient } from '../database/redis';

export class CreditController {
  private processor: CreditProcessor;
  private creditRepo: CreditRepository;
  private creditService: CreditService;

  constructor() {
    this.creditRepo = new CreditRepository(prisma); 
    const configRepo = new ConfigRepository(prisma);
    const sharedRepo = new SharedRepository(prisma);
    this.processor = new CreditProcessor(this.creditRepo, configRepo, sharedRepo);
    this.creditService = new CreditService(this.creditRepo, this.processor);
  }

  /**
   *  Recepción de información externa (Webhook)
   *  Recibe señal de un banco externo para sacar la solicitud   
   */
  receiveExternalWebhook = async (req: any, res: any) => {
    try {
      const { applicationId, externalStatus, secret, transactionId } = req.body;

      // Validación de seguridad 
      if (secret !== process.env.WEBHOOK_SECRET) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      // Se registra en tab_webhook_inbox y se genera el Job en tab_background_jobs
      const eventId = transactionId || `webhook_${applicationId}_${new Date().getTime()}`;
      await this.creditRepo.saveWebhook(eventId, req.body);

     
      const result = await this.creditRepo.updateStatus(
        applicationId, 
        5, 
        `Confirmación externa recibida: ${externalStatus}`
      );

      return res.status(200).json({
        success: true,
        message: "Señal externa procesada, flujo actualizado y trabajo encolado",
        data: result
      });
    } catch (error: any) {
      // si el evento ya existe, respondemos éxito pero no duplicamos proceso
      if (error.code === 'P2002') {
        return res.status(200).json({ success: true, message: "Event already processed" });
      }
      console.error(`[WEBHOOK_ERROR] ${error.message}`);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // cambio de estado manual
  updateStatus = async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { nextStatusId } = req.body;
      const ipAddress = req.ip || 'unknown';

      const result = await this.creditService.updateStatus(id, Number(nextStatusId), ipAddress);

      return res.status(200).json({
        success: true,
        message: "Estado actualizado y notificaciones enviadas",
        data: result
      });
    } catch (error: any) {
      console.error(`[ERROR_UPDATE_STATUS] ${error.message}`);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // Consultar y listar solicitud individual
  getById = async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const cacheKey = `credit:detail:${id}`;

      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return res.status(200).json({ success: true, data: JSON.parse(cachedData), source: 'cache' });
      }

      const credit = await this.creditRepo.getById(id);
      if (!credit) return res.status(404).json({ success: false, message: "No encontrado" });

      if (credit.piiData) {
        credit.piiData.fullName = EncryptionService.decrypt(credit.piiData.fullNameEnc);
        credit.piiData.docNumber = EncryptionService.decrypt(credit.piiData.docNumberEnc);
        credit.piiData.email = EncryptionService.decrypt(credit.piiData.email);
        credit.piiData.phone = EncryptionService.decrypt(credit.piiData.phone);
      }

      await redisClient.setEx(cacheKey, 600, JSON.stringify(credit));
      return res.status(200).json({ success: true, data: credit, source: 'database' });

    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  create = async (req: any, res: any) => {
    try {
      const result = await this.processor.execute(req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  list = async (req: any, res: any) => {
    try {
      const { country, status, start, end, page = 1, limit = 10 } = req.query;
      const result = await this.creditRepo.getPaginatedCredits({
        country: country as string,
        statusId: status ? Number(status) : undefined,
        startDate: start as string,
        endDate: end as string,
        page: Number(page),
        limit: Number(limit)
      });
      return res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: "Error interno" });
    }
  }
}
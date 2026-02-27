import { CreditRepository } from '../infrastructure/repositories/CreditRepository';
import { CreditProcessor } from '../domain/rules/CreditProcessor';
import prisma from '../infrastructure/database/prisma';
import { redisClient } from '../infrastructure/database/redis';
import { io } from '@/infrastructure/realtime/socket';
import { creditQueue } from '@/infrastructure/queue/bullConfig'; // Paso 4: Jobs

export class CreditService {
  constructor(
    private creditRepo: CreditRepository,
    private processor: CreditProcessor
  ) {}

  /**   
   * Orquestación completa de cambio de estado, caché, tiempo real y jobs.
   */
  async updateStatus(id: string, nextStatusId: number, ipAddress: string) {
   

    // consulta la solicitud
    const currentCredit = await this.creditRepo.getById(id);
    if (!currentCredit) {
      throw new Error(`NOT_FOUND: Solicitud ${id} no existe.`);
    }

    // valida la transicion de la solicitud
    this.processor.validateTransition(currentCredit.currentStatusId, nextStatusId);

    //Motor de reglas 
    if (nextStatusId === 4) {
      const isInvalid = this.processor['evaluateFinancialRule'](
        { ruleName: 'DEBT_RATIO', ruleValue: '0.5', operator: '<=' }, 
        currentCredit
      );
      
      if (isInvalid) {
        throw new Error("POLICY_REJECTION: El riesgo financiero no permite esta transición.");
      }
    }
    
    const updated = await this.creditRepo.updateStatus(
      id, 
      nextStatusId, 
      "Actualización de estado automática por flujo de negocio"
    );

    // logs
    await prisma.auditLog.create({
      data: {
        userId: '00000000-0000-0000-0000-000000000000',
        action: `PATCH_STATUS_CHANGE_${id}_TO_${nextStatusId}`,
        ipAddress: ipAddress
      }
    });

    
    // borramos redis
    try {
      await redisClient.del(`credit:detail:${id}`);
    } catch (error) {
      console.error(`[REDIS_ERROR] Fallo al invalidar caché para ${id}:`, error);
    }

    // EMITIR POR SOCKET.IO 
    if (io) {
      io.to(`credit_${id}`).emit('STATUS_UPDATED', {
        creditId: id,
        statusId: nextStatusId,
        message: "Tu solicitud ha cambiado de estado."
      });
    }

    
    // ENCOLA TAREA ASÍNCRONA (Requerimiento 3.7 y 4.3)
    // Si el estado requiere integraciones externas
    if ([4, 7].includes(nextStatusId)) {
      await creditQueue.add('PROCESS_WEBHOOK_NOTIFICATION', {
        creditId: id,
        newStatusId: nextStatusId
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 }
      });
    }

    return updated;
  }
}
import { PrismaClient } from '@prisma/client';

export class SharedRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async saveIdempotency<T>(key: string, response: T) {
    return await (this.prisma as any).idempotencyKey.create({
      data: { 
        idempotencyKey: key, 
        responsePayload: response 
      }
    });
  }

  async writeAudit(referenceId: string, action: string, ip: string) {
    return await (this.prisma as any).auditLog.create({
      data: { 
        userId: referenceId, 
        action, 
        ipAddress: ip 
      }
    });
  }

  /**
   * Versión corregida: 
   * Se agrega jobType (obligatorio en DB) y se fuerza PENDING
   */
  async queueBackgroundJob(idCredit: string, jobType: string) {
    return await (this.prisma as any).backgroundJob.create({
      data: { 
        idCredit: idCredit,
        jobType: jobType,    // Requerido por el esquema
        status: 'PENDING'    // Requerido para que el worker lo tome
      }
    });
  }
}
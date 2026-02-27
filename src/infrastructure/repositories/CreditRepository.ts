import { randomUUID, createHash } from 'crypto';
import { EncryptionService } from '../security/EncryptionService';

export class CreditRepository {
  constructor(private prisma: any) {}

  //Consultar una solicitud individual
  async getById(id: string) {
    return await this.prisma.creditRequest.findUnique({
      where: { id },
      include: {
        piiData: true, 
        status: true,  
        history: {
          orderBy: { changedAt: 'desc' } 
        }
      }
    });
  }

  // guarda la solicitud de credito
  async saveFullApplication(dto: any) {
    const docHash = createHash('sha256').update(dto.docNumber).digest('hex');
    const correlationId = randomUUID();

    const provider = await this.prisma.bankProvider.findFirst({
      where: { countryCode: dto.countryCode }
    });

    if (!provider) {
      throw new Error(`No existe un proveedor bancario configurado para el país: ${dto.countryCode}`);
    }

    return await this.prisma.$transaction(async (tx: any) => {
      const request = await tx.creditRequest.create({
        data: {
          countryCode: dto.countryCode,
          amount: dto.amount,
          monthlyIncome: dto.monthlyIncome,
          currencyCode: dto.currencyCode || 'USD',
          currentStatusId: 1, 
          piiData: {
            create: {
              fullNameEnc: EncryptionService.encrypt(dto.fullName),
              docType: dto.docType,
              docNumberEnc: EncryptionService.encrypt(dto.docNumber),
              docNumberHash: docHash,
              email: EncryptionService.encrypt(dto.email),
              phone: EncryptionService.encrypt(dto.phone),
            }
          },
          history: {
            create: {
              fromStatusId: 1,
              toStatusId: 1,
              correlationId: correlationId,
              metadata: { 
                message: "Solicitud ingresada correctamente",
                providerIdentified: provider.providerName 
              }
            }
          },
          backgroundJobs: {
            create: {
              jobType: 'CREDIT_ANALYSIS',
              status: 'PENDING'
            }
          }
        }
      });

      //Nueva solicitud creada 
      await tx.realtimeEvent.create({
        data: {
          idCredit: request.id,
          eventType: 'APPLICATION_CREATED',
          isConsumed: false
        }
      });

      return request;
    });
  }

  //  Actualización de estado 
  async updateStatus(creditId: string, toStatusId: number, message: string) {
    const currentRecord = await this.prisma.creditRequest.findUnique({
      where: { id: creditId },
      select: { currentStatusId: true }
    });

    if (!currentRecord) throw new Error("Solicitud no encontrada");

    return await this.prisma.$transaction(async (tx: any) => {
      // Actualización de estado 
      const updated = await tx.creditRequest.update({
        where: { id: creditId },
        data: { 
          currentStatusId: toStatusId,
          updatedAt: new Date()
        }
      });

     
      await tx.requestHistory.create({
        data: {
          idCredit: creditId,
          fromStatusId: currentRecord.currentStatusId,
          toStatusId: toStatusId,
          correlationId: randomUUID(),
          metadata: { 
            message: message || "Cambio de estado procesado",
            source: "application_layer" 
          }
        }
      });

      // Cambio de estado 
      await tx.realtimeEvent.create({
        data: {
          idCredit: creditId,
          eventType: 'STATUS_CHANGED',
          isConsumed: false
        }
      });

      //Disparar trabajo en segundo plano 
      await tx.backgroundJob.create({
        data: {
          idCredit: creditId,
          jobType: 'SEND_STATUS_NOTIFICATION',
          status: 'PENDING'
        }
      });

      return updated;
    });
  }

  /**
   * Recepción de Webhooks Externos
   */
  async saveWebhook(externalEventId: string, payload: any) {
    const applicationId = payload.applicationId;

    return await this.prisma.$transaction(async (tx: any) => {
     
      const webhookEntry = await tx.webhookInbox.create({
        data: {
          externalEventId, // evita procesar el mismo evento dos veces
          payload,
          processedAt: null 
        }
      });

      // Generar el trabajo a ser procesado de forma asíncrona 
      // Esto permite que el flujo NO sea bloqueante para la API principal 
      await tx.backgroundJob.create({
        data: {
          idCredit: applicationId,
          jobType: 'PROCESS_WEBHOOK_DATA',
          status: 'PENDING'
        }
      });

      return webhookEntry;
    });
  }

  // Listado paginado y filtrado 
  async getPaginatedCredits(filters: { 
    country?: string, 
    statusId?: number, 
    startDate?: string, 
    endDate?: string,
    page: number, 
    limit: number 
  }) {
    const skip = (filters.page - 1) * filters.limit;

    const where: any = {};
    if (filters.country) where.countryCode = filters.country; 
    if (filters.statusId) where.currentStatusId = filters.statusId;
    
    if (filters.startDate || filters.endDate) {
      where.requestedAt = {
        ...(filters.startDate && { gte: new Date(filters.startDate) }),
        ...(filters.endDate && { lte: new Date(filters.endDate) }),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.creditRequest.findMany({
        where,
        select: { 
          id: true, 
          countryCode: true, 
          amount: true, 
          currencyCode: true,
          currentStatusId: true, 
          requestedAt: true 
        },
        orderBy: { requestedAt: 'desc' }, 
        skip,
        take: filters.limit,
      }),
      this.prisma.creditRequest.count({ where })
    ]);

    return { 
      data, 
      total, 
      page: filters.page, 
      lastPage: Math.ceil(total / filters.limit) 
    };
  }
}
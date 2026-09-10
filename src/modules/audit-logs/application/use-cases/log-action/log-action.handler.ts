import { IAuditLogRepository } from "../../../domain/repositories/audit-log-repository.interface";
import { LogActionCommand, logActionSchema } from "./log-action.command";
import { AuditLogEntity } from "../../../domain/entities/audit-log.entity";
import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service";
import { AuditLogEntryCreatedEvent } from "../../../domain/events/audit-log.events";

export class LogActionHandler {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async execute(command: LogActionCommand): Promise<AuditLogEntity> {
    const validatedData = logActionSchema.parse(command);

    const log = await this.auditLogRepository.create({
      action: validatedData.action,
      entityName: validatedData.entityName,
      entityId: validatedData.entityId ?? null,
      actorId: validatedData.actorId,
      details: validatedData.details ?? {},
      ipAddress: validatedData.ipAddress ?? null,
    });

    await eventDispatcher.dispatch(new AuditLogEntryCreatedEvent(log));

    return log;
  }
}

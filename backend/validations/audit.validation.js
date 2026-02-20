import { z } from "zod";

export const auditQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});
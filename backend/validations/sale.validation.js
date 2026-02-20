import { z } from "zod";

export const createSaleSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive()
    })
  ).min(1)
});

export const saleIdParamSchema = z.object({
  id: z.string().uuid()
});
export const salesQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  productId: z.string().uuid().optional(),
  minAmount: z.string().optional(),
  maxAmount: z.string().optional()
});
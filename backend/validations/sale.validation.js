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
import { z } from "zod";

export const adjustInventorySchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int()
});
export const updateInventorySchema = z.object({
  quantity: z.number().int().min(0),
  reason: z.string().min(3)
});
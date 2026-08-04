import { z } from "zod";

export const orderItemSchema = z.object({
  id: z.string().max(60),
  name: z.string().min(1).max(120),
  qty: z.number().int().min(1).max(99),
  price: z.number().int().min(0).max(10_000_000),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1).max(50),
  method: z.enum(["qris", "transfer", "cod"]),
  bankId: z.enum(["bca", "mandiri", "bri", "bni"]).optional(),
  customer: z.object({
    name: z.string().min(2).max(100),
    phone: z.string().min(6).max(20),
    email: z.string().email().max(160).optional().or(z.literal("")),
    address: z.string().min(5).max(300),
    notes: z.string().max(300).optional().or(z.literal("")),
  }),
});

export const orderKeySchema = z.object({
  code: z.string().min(4).max(30),
  token: z.string().min(8).max(64),
});

export const proofSchema = orderKeySchema.extend({
  fileName: z.string().min(1).max(140),
  contentType: z.string().min(3).max(80),
  dataBase64: z.string().min(32).max(7_000_000),
});

export const adminStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["pending_payment", "awaiting_confirmation", "paid", "expired", "cod_unpaid", "rejected"]),
  note: z.string().max(300).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderStatusKey = z.infer<typeof adminStatusSchema>["status"];

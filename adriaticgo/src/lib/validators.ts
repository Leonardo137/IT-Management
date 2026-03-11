import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["CUSTOMER", "RESTAURANT_OWNER", "DELIVERY_PERSON"]),
});

export const orderSchema = z.object({
  restaurantId: z.string().min(1),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  deliveryLat: z.number().optional(),
  deliveryLng: z.number().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, "Order must have at least one item"),
});

export const orderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "PICKED_UP",
    "DELIVERING",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export const menuItemSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean().optional(),
});

export const deliveryLocationSchema = z.object({
  currentLat: z.number(),
  currentLng: z.number(),
});

export const deliveryStatusSchema = z.object({
  status: z.enum(["ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;

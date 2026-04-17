import { z } from "zod";

// ─── Auth Schemas ────────────────────────────────────────

export const SignUpSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  role: z.enum(["user", "owner", "deliveryBoy", "admin"]),
});

export const SignInSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const SendOtpSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const VerifyOtpSchema = z.object({
  email: z.string().email("Invalid email format"),
  otp: z.union([z.string(), z.number()]),
});

// ─── Shop Schema ─────────────────────────────────────────
// Multer sends form fields as strings, so we accept strings for numeric fields.
// .passthrough() allows extra keys added by multer (e.g. file metadata).

export const ShopSchema = z.object({
  name: z.string().min(2, "Shop name is too short"),
  city: z.string().min(2, "City name is too short"),
  address: z.string().min(5, "Address is too short"),
  latitude: z.union([z.string(), z.number()]).optional(),
  longitude: z.union([z.string(), z.number()]).optional(),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
}).passthrough();

// ─── Item Schema ─────────────────────────────────────────
// Same passthrough reasoning as ShopSchema (multer form data).

export const ItemSchema = z.object({
  name: z.string().min(2, "Item name is too short"),
  category: z.string().min(1, "Category is required"),
  price: z.union([z.string(), z.number()]),
  foodType: z.enum(["Veg", "Non-Veg"]),
  isBestSeller: z.union([z.boolean(), z.string()]).optional(),
  discountPrice: z.union([z.string(), z.number()]).optional(),
}).passthrough();

// ─── Order Schema ────────────────────────────────────────

export const OrderSchema = z.object({
  paymentMethod: z.enum(["cod", "online"]),
  deliveryAddress: z.object({
    flatNo: z.string().optional(),
    street: z.string().optional(),
    landmark: z.string().optional(),
    latitude: z.number({ message: "Delivery latitude is required" }),
    longitude: z.number({ message: "Delivery longitude is required" }),
  }),
  cartItems: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number().int().positive(),
    shop: z.string(),
    image: z.string().optional(),
  })).min(1, "Cart cannot be empty"),
  totalAmount: z.number().positive("Total must be greater than zero"),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
});

// ─── Payment Schemas ─────────────────────────────────────

export const CreatePaymentOrderSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
});

export const VerifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, "Order ID is required"),
  razorpay_payment_id: z.string().min(1, "Payment ID is required"),
  razorpay_signature: z.string().min(1, "Signature is required"),
});

// ─── User Location Schema ────────────────────────────────

export const UpdateLocationSchema = z.object({
  lat: z.union([z.string(), z.number()]),
  lon: z.union([z.string(), z.number()]),
});

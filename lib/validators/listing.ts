/**
 * RE:GALIA — Listing Validators
 * ==============================
 * Zod schemas for listing creation/edit forms.
 */
import { z } from 'zod'

export const listingSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(300, 'Title is too long'),
  description: z
    .string()
    .max(5000, 'Description is too long')
    .optional(),
  category: z.enum(['bridal', 'evening', 'accessories'], {
    message: 'Category is required',
  }),
  condition: z.enum(['new_unworn', 'excellent', 'good'], {
    message: 'Condition is required',
  }),
  listing_type: z.enum(['peer_to_peer', 'sample_sale', 'brand_direct']).default('peer_to_peer'),
  size_us: z
    .string()
    .max(20)
    .optional(),
  bust_cm: z
    .number()
    .positive('Must be positive')
    .max(300, 'Invalid measurement')
    .optional()
    .nullable(),
  waist_cm: z
    .number()
    .positive('Must be positive')
    .max(300, 'Invalid measurement')
    .optional()
    .nullable(),
  hips_cm: z
    .number()
    .positive('Must be positive')
    .max(300, 'Invalid measurement')
    .optional()
    .nullable(),
  height_cm: z
    .number()
    .positive('Must be positive')
    .max(300, 'Invalid measurement')
    .optional()
    .nullable(),
  silhouette: z
    .enum(['a_line', 'ball_gown', 'mermaid', 'trumpet', 'sheath', 'fit_and_flare', 'empire', 'column'])
    .optional()
    .nullable(),
  train_style: z
    .enum(['none', 'sweep', 'court', 'chapel', 'cathedral', 'royal'])
    .optional()
    .nullable(),
  price: z
    .number()
    .positive('Price must be greater than 0')
    .max(999999.99, 'Price is too high'),
  msrp: z
    .number()
    .nonnegative('MSRP must be 0 or greater')
    .max(999999.99, 'MSRP is too high')
    .optional()
    .nullable(),
  order_number: z
    .string()
    .min(1, 'Order number is required')
    .max(100, 'Order number is too long'),
  product_id: z.string().optional().nullable(),
  images: z
    .array(z.string().url('Each image must be a valid URL'))
    .min(2, 'At least 2 photos of you wearing the dress are required')
    .max(10, 'Maximum 10 images allowed'),
})

export type ListingInput = z.infer<typeof listingSchema>

export const profileSchema = z.object({
  display_name: z
    .string()
    .min(1, 'Display name is required')
    .max(100, 'Display name is too long'),
  full_name: z
    .string()
    .max(200, 'Full name is too long')
    .optional()
    .nullable(),
  phone: z
    .string()
    .max(30, 'Phone number is too long')
    .regex(/^[+\d\s()-]*$/, 'Invalid phone number format')
    .optional()
    .nullable(),
  avatar_url: z
    .string()
    .url('Must be a valid URL')
    .max(500, 'URL is too long')
    .optional()
    .nullable(),
})

export type ProfileInput = z.infer<typeof profileSchema>

export const productSchema = z.object({
  style_name: z
    .string()
    .min(1, 'Style name is required')
    .max(300, 'Style name is too long'),
  sku: z
    .string()
    .max(100, 'SKU is too long')
    .optional()
    .nullable(),
  category: z.enum(['bridal', 'evening', 'accessories'], {
    message: 'Category is required',
  }),
  silhouette: z
    .string()
    .max(100)
    .optional()
    .nullable(),
  train_style: z
    .string()
    .max(100)
    .optional()
    .nullable(),
  msrp: z
    .number()
    .nonnegative('MSRP must be 0 or greater')
    .max(999999.99, 'MSRP is too high')
    .optional()
    .nullable(),
  description: z
    .string()
    .max(5000, 'Description is too long')
    .optional()
    .nullable(),
})

export type ProductInput = z.infer<typeof productSchema>

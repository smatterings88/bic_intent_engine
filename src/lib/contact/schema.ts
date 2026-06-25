import { z } from "zod";

export const contactInquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Valid email is required").max(320),
  affiliation: z.string().trim().max(200).optional(),
  subject: z.string().trim().min(1, "Subject is required").max(300),
  message: z.string().trim().min(1, "Message is required").max(10000),
});

export type ContactInquiry = z.infer<typeof contactInquirySchema>;

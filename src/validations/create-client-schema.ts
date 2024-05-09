import { z } from 'zod'

export const createClientSchema = z.object({
    name: z.string(),
    cpf: z.string(),
    phone: z.string(),
    email: z.string().email(),
    address: z.string(),
    number: z.string(),
    neighborhood: z.string(),
    complement: z.string().optional(),
    zipCode: z.string(),
});
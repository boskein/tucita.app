import { z } from 'zod';

// Business registration form
export const businessRegistrationSchema = z.object({
  businessName: z.string().min(1, 'El nombre del negocio es requerido'),
  category: z.string().optional(),
  timezone: z.string().min(1, 'La zona horaria es requerida'),
  ownerName: z.string().min(1, 'El nombre del propietario es requerido'),
  ownerEmail: z.string().email('Email inválido'),
});

export type BusinessRegistrationInput = z.infer<typeof businessRegistrationSchema>;

// Service creation/editing
export const serviceSchema = z.object({
  name: z.string().min(1, 'El nombre del servicio es requerido'),
  duration: z.number().min(15).max(480), // 15 minutes to 8 hours
  price: z.number().optional(),
  employeeIds: z.array(z.string()).default([]),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

// Employee creation/editing
export const employeeSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  role: z.string().optional(),
  active: z.boolean().default(true),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;

// Time block validation
export const timeBlockSchema = z.object({
  start: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:mm)'),
  end: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:mm)'),
}).refine((data) => {
  const [startH, startM] = data.start.split(':').map(Number);
  const [endH, endM] = data.end.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  return endMinutes > startMinutes;
}, {
  message: 'La hora de fin debe ser posterior a la hora de inicio',
  path: ['end'],
});

export type TimeBlockInput = z.infer<typeof timeBlockSchema>;

// Weekly schedule blocks
export const weeklyTemplateSchema = z.record(
  z.string(),
  z.array(timeBlockSchema).or(z.literal('closed'))
).refine((data) => {
  // Validate no overlapping blocks per day
  for (const dayKey in data) {
    const dayBlocks = data[dayKey];
    if (dayBlocks === 'closed' || !Array.isArray(dayBlocks)) continue;
    
    // Sort blocks by start time
    const sorted = [...dayBlocks].sort((a, b) => {
      const [aH, aM] = a.start.split(':').map(Number);
      const [bH, bM] = b.start.split(':').map(Number);
      return (aH * 60 + aM) - (bH * 60 + bM);
    });
    
    // Check for overlaps
    for (let i = 0; i < sorted.length - 1; i++) {
      const [endH, endM] = sorted[i].end.split(':').map(Number);
      const [nextStartH, nextStartM] = sorted[i + 1].start.split(':').map(Number);
      const endMinutes = endH * 60 + endM;
      const nextStartMinutes = nextStartH * 60 + nextStartM;
      
      if (endMinutes > nextStartMinutes) {
        return false;
      }
    }
  }
  return true;
}, {
  message: 'Los bloques de tiempo no pueden superponerse',
});

// Booking form (customer data)
export const bookingSchema = z.object({
  serviceId: z.string().min(1, 'Debe seleccionar un servicio'),
  employeeId: z.string().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
  time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
  customerName: z.string().min(1, 'El nombre es requerido'),
  customerEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  customerPhone: z.string().optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

// Re-export all mock services
export * from './mockTenant';
export * from './mockUser';
export * from './mockStaff';
export * from './mockServices';
export * from './mockSchedule';
export * from './mockBookings';
export * from './store';

// Seed demo data
import { createTenant } from './mockTenant';
import { createDefaultOwnerEmployee } from './mockStaff';
import { createService } from './mockServices';
import { setBusinessWeeklyTemplate } from './mockSchedule';
import type { WeeklyTemplate } from '../types';

let seeded = false;

export async function seedDemoData(): Promise<void> {
  if (seeded) return;
  seeded = true;
  
  try {
    // Create demo tenant: "Barbería Elite"
    const tenant = await createTenant({
      name: 'Barbería Elite',
      category: 'Barbería',
      timezone: 'America/Mexico_City',
      ownerName: 'Juan Pérez',
      ownerEmail: 'juan@barberiaelite.com',
    });
    
    // Create owner employee
    const ownerEmployee = await createDefaultOwnerEmployee(tenant.id, 'Juan Pérez');
    
    // Create one service
    await createService(tenant.id, {
      name: 'Corte de cabello',
      duration: 30,
      price: 2500, // $25.00 in cents
      employeeIds: [], // All employees can provide this
      active: true,
    });
    
    // Set basic weekly schedule (Mon-Fri 10:00-14:00, 16:00-20:00)
    const weeklyTemplate: WeeklyTemplate = {
      1: [ // Monday
        { start: '10:00', end: '14:00' },
        { start: '16:00', end: '20:00' },
      ],
      2: [ // Tuesday
        { start: '10:00', end: '14:00' },
        { start: '16:00', end: '20:00' },
      ],
      3: [ // Wednesday
        { start: '10:00', end: '14:00' },
        { start: '16:00', end: '20:00' },
      ],
      4: [ // Thursday
        { start: '10:00', end: '14:00' },
        { start: '16:00', end: '20:00' },
      ],
      5: [ // Friday
        { start: '10:00', end: '14:00' },
        { start: '16:00', end: '20:00' },
      ],
    };
    
    await setBusinessWeeklyTemplate(tenant.id, weeklyTemplate);
  } catch (error) {
    console.error('Error seeding demo data:', error);
  }
}

// Auto-seed on import (for development)
if (typeof window !== 'undefined') {
  seedDemoData();
}

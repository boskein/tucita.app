export type Tenant = {
  id: string;
  slug: string;
  name: string;
  category?: string;
  timezone: string;
  createdAt: string;
};

export type User = {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'staff';
  createdAt: string;
};

export type Employee = {
  id: string;
  tenantId: string;
  userId?: string; // If linked to a User account
  name: string;
  role?: string;
  active: boolean;
  createdAt: string;
};

export type Service = {
  id: string;
  tenantId: string;
  name: string;
  duration: number; // minutes
  price?: number; // optional, in cents or as number
  employeeIds: string[]; // Empty array means all employees can provide this service
  active: boolean;
  createdAt: string;
};

export type TimeBlock = {
  start: string; // HH:mm format
  end: string; // HH:mm format
};

export type WeeklyTemplate = {
  [key: number]: TimeBlock[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
};

export type Schedule = {
  tenantId: string;
  employeeId: string | null; // null = business schedule
  weeklyTemplate: WeeklyTemplate;
  exceptions: {
    [isoDate: string]: TimeBlock[] | 'closed'; // ISO date string (YYYY-MM-DD)
  };
};

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type Booking = {
  id: string;
  tenantId: string;
  serviceId: string;
  employeeId: string | null;
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // HH:mm format
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  status: BookingStatus;
  createdAt: string;
};

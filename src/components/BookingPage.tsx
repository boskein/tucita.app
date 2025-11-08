import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import BookingCalendar from './BookingCalendar';
import SlotList from './SlotList';
import { getTenantBySlug, listServices, listEmployees, computeSlots, createBooking } from '@/lib/mock';
import { formatISODate } from '@/lib/date';
import type { Service, Employee } from '@/lib/types';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

interface BookingPageProps {
  tenantSlug: string;
}

type Step = 'service' | 'employee' | 'datetime' | 'customer' | 'success';

export default function BookingPage({ tenantSlug }: BookingPageProps) {
  const [step, setStep] = useState<Step>('service');
  const [tenant, setTenant] = useState<{ id: string; slug: string; timezone: string; name: string } | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [tenantSlug]);

  useEffect(() => {
    if (selectedService && selectedDate) {
      loadSlots();
    }
  }, [selectedService, selectedEmployee, selectedDate, tenant]);

  const loadData = async () => {
    try {
      const tenantData = await getTenantBySlug(tenantSlug);
      if (!tenantData) {
        toast.error('Negocio no encontrado');
        window.location.href = '/';
        return;
      }

      setTenant({
        id: tenantData.id,
        slug: tenantData.slug,
        timezone: tenantData.timezone,
        name: tenantData.name,
      });

      const [servicesData, employeesData] = await Promise.all([
        listServices(tenantData.id),
        listEmployees(tenantData.id),
      ]);

      setServices(servicesData.filter(s => s.active));
      setEmployees(employeesData.filter(e => e.active));
    } catch (error) {
      toast.error('Error al cargar datos');
    }
  };

  const loadSlots = async () => {
    if (!selectedService || !selectedDate || !tenant) return;

    setLoadingSlots(true);
    try {
      const isoDate = formatISODate(selectedDate);
      const slots = await computeSlots({
        tenant: { id: tenant.id, slug: tenant.slug, timezone: tenant.timezone },
        serviceId: selectedService.id,
        employeeId: selectedEmployee?.id || null,
        isoDate,
      });

      setAvailableSlots(slots);
    } catch (error) {
      toast.error('Error al cargar horarios disponibles');
    } finally {
      setLoadingSlots(false);
    }
  };

  // Pre-compute available dates (simplified - in real app, check multiple days)
  useEffect(() => {
    if (!selectedService || !tenant) return;

    const dates = new Set<string>();
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.add(formatISODate(date));
    }
    setAvailableDates(dates);
  }, [selectedService, tenant]);

  const handleServiceSelect = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    setSelectedService(service);
    
    // If service has specific employees, go to employee selection
    // Otherwise, skip to datetime
    if (service.employeeIds.length > 0) {
      const compatibleEmployees = employees.filter(e => 
        service.employeeIds.length === 0 || service.employeeIds.includes(e.id)
      );
      if (compatibleEmployees.length > 1) {
        setStep('employee');
      } else {
        setSelectedEmployee(compatibleEmployees[0] || null);
        setStep('datetime');
      }
    } else {
      setStep('datetime');
    }
  };

  const handleEmployeeSelect = (employeeId: string | null) => {
    if (employeeId) {
      const employee = employees.find(e => e.id === employeeId);
      setSelectedEmployee(employee || null);
    } else {
      setSelectedEmployee(null);
    }
    setStep('datetime');
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime('');
    setAvailableSlots([]);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime || !tenant) return;

    setSubmitting(true);
    try {
      const booking = await createBooking({
        tenantId: tenant.id,
        serviceId: selectedService.id,
        employeeId: selectedEmployee?.id || null,
        date: formatISODate(selectedDate),
        time: selectedTime,
        customerName,
        customerEmail: customerEmail || undefined,
        customerPhone: customerPhone || undefined,
      });

      setBookingId(booking.id);
      setStep('success');
      toast.success('¡Reserva creada exitosamente!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  if (!tenant) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  if (step === 'success') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold">¡Cita reservada!</h2>
              <p className="text-muted-foreground">
                Tu reserva ha sido confirmada exitosamente.
              </p>
              {selectedService && selectedDate && selectedTime && (
                <div className="mt-6 space-y-2 text-left bg-muted p-4 rounded-lg">
                  <p><strong>Servicio:</strong> {selectedService.name}</p>
                  <p><strong>Fecha:</strong> {selectedDate.toLocaleDateString('es-ES')}</p>
                  <p><strong>Hora:</strong> {selectedTime}</p>
                  {selectedEmployee && (
                    <p><strong>Empleado:</strong> {selectedEmployee.name}</p>
                  )}
                  <p><strong>Cliente:</strong> {customerName}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Reserva una cita</h1>
        <p className="text-muted-foreground">{tenant.name}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Service Selection */}
        {step === 'service' && (
          <Card>
            <CardHeader>
              <CardTitle>Paso 1: Selecciona un servicio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select onValueChange={handleServiceSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - {service.duration} min
                      {service.price && ` ($${(service.price / 100).toFixed(2)})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Employee Selection */}
        {step === 'employee' && selectedService && (
          <Card>
            <CardHeader>
              <CardTitle>Paso 2: Selecciona un empleado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select onValueChange={(value) => handleEmployeeSelect(value === 'auto' ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un empleado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Asignación automática</SelectItem>
                  {employees
                    .filter(e => 
                      selectedService.employeeIds.length === 0 || 
                      selectedService.employeeIds.includes(e.id)
                    )
                    .map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setStep('service')}>
                Volver
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Date & Time Selection */}
        {step === 'datetime' && selectedService && tenant && (
          <Card>
            <CardHeader>
              <CardTitle>Paso 3: Selecciona fecha y hora</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <BookingCalendar
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
              availableDates={availableDates}
              timezone={tenant.timezone}
            />
              {selectedDate && (
                <SlotList
                  slots={availableSlots}
                  onSelect={handleTimeSelect}
                  loading={loadingSlots}
                />
              )}
              {selectedTime && (
                <Button onClick={() => setStep('customer')} className="w-full">
                  Continuar
                </Button>
              )}
              <Button variant="outline" onClick={() => setStep(selectedEmployee ? 'employee' : 'service')}>
                Volver
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Customer Data */}
        {step === 'customer' && selectedService && selectedDate && selectedTime && (
          <Card>
            <CardHeader>
              <CardTitle>Paso 4: Información del cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nombre *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email (opcional)</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Teléfono (opcional)</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep('datetime')}>
                    Volver
                  </Button>
                  <Button type="submit" disabled={submitting || !customerName} className="flex-1">
                    {submitting ? 'Reservando...' : 'Confirmar reserva'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

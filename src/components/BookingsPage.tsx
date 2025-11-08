import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { getTenantBySlug, listBookings, listServices, listEmployees, updateBookingStatus } from '@/lib/mock';
import type { Booking, BookingStatus, Service, Employee } from '@/lib/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { MoreVertical } from 'lucide-react';

interface BookingsPageProps {
  tenantSlug: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  confirmed: 'default',
  cancelled: 'destructive',
  completed: 'secondary',
};

export default function BookingsPage({ tenantSlug }: BookingsPageProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [tenantSlug, statusFilter]);

  const loadData = async () => {
    try {
      const tenant = await getTenantBySlug(tenantSlug);
      if (!tenant) {
        window.location.href = '/register';
        return;
      }

      const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined;
      const [bookingsData, servicesData, employeesData] = await Promise.all([
        listBookings(tenant.id, filters),
        listServices(tenant.id),
        listEmployees(tenant.id),
      ]);

      setBookings(bookingsData);
      setServices(servicesData);
      setEmployees(employeesData);
    } catch (error) {
      toast.error('Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    try {
      await updateBookingStatus(id, status);
      toast.success('Estado actualizado');
      await loadData();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const getServiceName = (serviceId: string) => {
    return services.find(s => s.id === serviceId)?.name || serviceId;
  };

  const getEmployeeName = (employeeId: string | null) => {
    if (!employeeId) return 'Asignación automática';
    return employees.find(e => e.id === employeeId)?.name || employeeId;
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reservas</h2>
          <p className="text-muted-foreground">Gestiona las reservas de tu negocio</p>
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BookingStatus | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="confirmed">Confirmada</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
            <SelectItem value="completed">Completada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay reservas.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      {format(new Date(booking.date + 'T00:00:00'), 'PPP', { locale: es })}
                    </TableCell>
                    <TableCell>{booking.time}</TableCell>
                    <TableCell>{getServiceName(booking.serviceId)}</TableCell>
                    <TableCell>{getEmployeeName(booking.employeeId)}</TableCell>
                    <TableCell>{booking.customerName}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[booking.status] || 'default'}>
                        {STATUS_LABELS[booking.status] || booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {booking.status === 'pending' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            >
                              Confirmar
                            </DropdownMenuItem>
                          )}
                          {booking.status !== 'cancelled' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            >
                              Cancelar
                            </DropdownMenuItem>
                          )}
                          {booking.status === 'confirmed' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(booking.id, 'completed')}
                            >
                              Marcar como completada
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

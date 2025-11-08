import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import ServiceForm from './ServiceForm';
import { getTenantBySlug, listServices, deleteService } from '@/lib/mock';
import type { Service } from '@/lib/types';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';

interface ServicesPageProps {
  tenantSlug: string;
}

export default function ServicesPage({ tenantSlug }: ServicesPageProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [tenantSlug]);

  const loadData = async () => {
    try {
      const tenant = await getTenantBySlug(tenantSlug);
      if (!tenant) {
        window.location.href = '/register';
        return;
      }

      setTenantId(tenant.id);
      const servicesData = await listServices(tenant.id);
      setServices(servicesData);
    } catch (error) {
      toast.error('Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceAdded = async () => {
    if (!tenantId) return;
    const updated = await listServices(tenantId);
    setServices(updated);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return;
    try {
      await deleteService(id);
      toast.success('Servicio eliminado');
      await loadData();
    } catch (error) {
      toast.error('Error al eliminar servicio');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Servicios</h2>
          <p className="text-muted-foreground">Gestiona los servicios de tu negocio</p>
        </div>
        {tenantId && <ServiceForm tenantId={tenantId} onSuccess={handleServiceAdded} />}
      </div>

      <Card>
        <CardContent className="p-0">
          {services.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay servicios. Añade tu primer servicio.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.duration} min</TableCell>
                    <TableCell>
                      {service.price ? `$${(service.price / 100).toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>
                      {service.active ? 'Activo' : 'Inactivo'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <ServiceForm
                          tenantId={tenantId!}
                          service={{ id: service.id, ...service }}
                          onSuccess={handleServiceAdded}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(service.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

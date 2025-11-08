import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ServiceForm from './ServiceForm';
import EmployeeForm from './EmployeeForm';
import WeeklyEditor from './WeeklyEditor';
import { listServices, listEmployees, getBusinessSchedule, setBusinessWeeklyTemplate } from '@/lib/mock';
import { getTenantBySlug } from '@/lib/mock';
import type { Service, Employee, WeeklyTemplate } from '@/lib/types';
import { toast } from 'sonner';

interface OnboardingWizardProps {
  tenantSlug: string;
}

export default function OnboardingWizard({ tenantSlug }: OnboardingWizardProps) {
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [tenantSlug]);

  const loadData = async () => {
    try {
      const tenant = await getTenantBySlug(tenantSlug);
      if (!tenant) {
        toast.error('Negocio no encontrado');
        window.location.href = '/register';
        return;
      }

      setTenantId(tenant.id);
      const [servicesData, employeesData] = await Promise.all([
        listServices(tenant.id),
        listEmployees(tenant.id),
      ]);
      setServices(servicesData);
      setEmployees(employeesData);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceAdded = async () => {
    if (!tenantId) return;
    const updated = await listServices(tenantId);
    setServices(updated);
  };

  const handleEmployeeAdded = async () => {
    if (!tenantId) return;
    const updated = await listEmployees(tenantId);
    setEmployees(updated);
  };

  const handleScheduleSave = async (weekly: WeeklyTemplate) => {
    if (!tenantId) return;
    try {
      await setBusinessWeeklyTemplate(tenantId, weekly);
      toast.success('Horarios guardados');
    } catch (error) {
      toast.error('Error al guardar horarios');
    }
  };

  const handleFinish = () => {
    window.location.href = `/t/${tenantSlug}/app`;
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Configuración inicial</CardTitle>
          <CardDescription>
            Completa estos pasos para configurar tu negocio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="services">Servicios</TabsTrigger>
              <TabsTrigger value="staff">Personal</TabsTrigger>
              <TabsTrigger value="schedule">Horarios</TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Servicios</h3>
                <ServiceForm tenantId={tenantId!} onSuccess={handleServiceAdded} />
              </div>
              {services.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No hay servicios. Añade tu primer servicio.
                </p>
              ) : (
                <ul className="space-y-2">
                  {services.map((service) => (
                    <li key={service.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-semibold">{service.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {service.duration} min
                            {service.price && ` - $${service.price.toFixed(2)}`}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="staff" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Personal</h3>
                <EmployeeForm tenantId={tenantId!} onSuccess={handleEmployeeAdded} />
              </div>
              {employees.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No hay empleados.
                </p>
              ) : (
                <ul className="space-y-2">
                  {employees.map((employee) => (
                    <li key={employee.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-semibold">
                            {employee.name}
                            {employee.role && ` - ${employee.role}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {employee.active ? 'Activo' : 'Inactivo'}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <h3 className="text-lg font-semibold">Horarios del negocio</h3>
              <WeeklyEditor
                tenantId={tenantId!}
                employeeId={null}
                onSave={handleScheduleSave}
              />
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleFinish} size="lg">
              Finalizar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

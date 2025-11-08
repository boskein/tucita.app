import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import EmployeeForm from './EmployeeForm';
import { getTenantBySlug, listEmployees, deleteEmployee, updateEmployee } from '@/lib/mock';
import type { Employee } from '@/lib/types';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface StaffPageProps {
  tenantSlug: string;
}

export default function StaffPage({ tenantSlug }: StaffPageProps) {
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
        window.location.href = '/register';
        return;
      }

      setTenantId(tenant.id);
      const employeesData = await listEmployees(tenant.id);
      setEmployees(employeesData);
    } catch (error) {
      toast.error('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeAdded = async () => {
    if (!tenantId) return;
    const updated = await listEmployees(tenantId);
    setEmployees(updated);
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateEmployee(id, { active: !currentActive });
      toast.success('Estado actualizado');
      await loadData();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleDelete = async (id: string, isOwner: boolean) => {
    if (isOwner) {
      toast.error('No se puede eliminar al propietario');
      return;
    }
    if (!confirm('¿Estás seguro de eliminar este empleado?')) return;
    try {
      await deleteEmployee(id);
      toast.success('Empleado eliminado');
      await loadData();
    } catch (error) {
      toast.error('Error al eliminar empleado');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  const ownerEmployee = employees.find(e => e.role?.toLowerCase().includes('propietario') || e.role?.toLowerCase().includes('owner'));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Personal</h2>
          <p className="text-muted-foreground">Gestiona el personal de tu negocio</p>
        </div>
        {tenantId && <EmployeeForm tenantId={tenantId} onSuccess={handleEmployeeAdded} />}
      </div>

      {employees.length === 1 && ownerEmployee && (
        <Card>
          <CardContent className="p-4 bg-muted">
            <p className="text-sm text-muted-foreground">
              Solo tienes un empleado (propietario). Añade más empleados para asignar servicios específicos.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {employees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay empleados.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => {
                  const isOwner = employee.role?.toLowerCase().includes('propietario') || 
                                 employee.role?.toLowerCase().includes('owner');
                  return (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        {employee.name}
                        {isOwner && <span className="ml-2 text-xs text-muted-foreground">(Propietario)</span>}
                      </TableCell>
                      <TableCell>{employee.role || '-'}</TableCell>
                      <TableCell>
                        <Switch
                          checked={employee.active}
                          onCheckedChange={() => handleToggleActive(employee.id, employee.active)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <EmployeeForm
                            tenantId={tenantId!}
                            employee={{ id: employee.id, ...employee }}
                            onSuccess={handleEmployeeAdded}
                          />
                          {!isOwner && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(employee.id, false)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

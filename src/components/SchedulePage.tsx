import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import WeeklyEditor from './WeeklyEditor';
import ExceptionEditor from './ExceptionEditor';
import { getTenantBySlug, listEmployees } from '@/lib/mock';
import type { Employee } from '@/lib/types';

interface SchedulePageProps {
  tenantSlug: string;
}

export default function SchedulePage({ tenantSlug }: SchedulePageProps) {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
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
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  if (!tenantId) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Horarios</h2>
        <p className="text-muted-foreground">Gestiona los horarios del negocio y empleados</p>
      </div>

      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weekly">Plantilla semanal</TabsTrigger>
          <TabsTrigger value="exceptions">Excepciones</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plantilla semanal</CardTitle>
              <CardDescription>
                Configura los horarios regulares de la semana
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Empleado</label>
                <Select
                  value={selectedEmployeeId || 'business'}
                  onValueChange={(value) => setSelectedEmployeeId(value === 'business' ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">General del negocio</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <WeeklyEditor
                tenantId={tenantId}
                employeeId={selectedEmployeeId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exceptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Excepciones</CardTitle>
              <CardDescription>
                Define horarios especiales o días cerrados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Empleado</label>
                <Select
                  value={selectedEmployeeId || 'business'}
                  onValueChange={(value) => setSelectedEmployeeId(value === 'business' ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">General del negocio</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ExceptionEditor
                tenantId={tenantId}
                employeeId={selectedEmployeeId}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

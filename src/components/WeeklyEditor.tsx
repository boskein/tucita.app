import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { getBusinessSchedule, getEmployeeSchedule, setBusinessWeeklyTemplate, setEmployeeWeeklyTemplate } from '@/lib/mock';
import type { WeeklyTemplate, TimeBlock } from '@/lib/types';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';

interface WeeklyEditorProps {
  tenantId: string;
  employeeId: string | null;
  onSave?: (weekly: WeeklyTemplate) => void;
}

const DAYS = [
  { key: 0, label: 'Domingo' },
  { key: 1, label: 'Lunes' },
  { key: 2, label: 'Martes' },
  { key: 3, label: 'Miércoles' },
  { key: 4, label: 'Jueves' },
  { key: 5, label: 'Viernes' },
  { key: 6, label: 'Sábado' },
];

export default function WeeklyEditor({ tenantId, employeeId, onSave }: WeeklyEditorProps) {
  const [weekly, setWeekly] = useState<WeeklyTemplate>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, [tenantId, employeeId]);

  const loadSchedule = async () => {
    try {
      const schedule = employeeId
        ? await getEmployeeSchedule(tenantId, employeeId)
        : await getBusinessSchedule(tenantId);
      setWeekly(schedule.weeklyTemplate || {});
    } catch (error) {
      toast.error('Error al cargar horarios');
    } finally {
      setLoading(false);
    }
  };

  const addBlock = (day: number) => {
    const dayBlocks = weekly[day] || [];
    setWeekly({
      ...weekly,
      [day]: [...dayBlocks, { start: '09:00', end: '17:00' }],
    });
  };

  const removeBlock = (day: number, index: number) => {
    const dayBlocks = weekly[day] || [];
    const updated = dayBlocks.filter((_, i) => i !== index);
    if (updated.length === 0) {
      const { [day]: _, ...rest } = weekly;
      setWeekly(rest);
    } else {
      setWeekly({ ...weekly, [day]: updated });
    }
  };

  const updateBlock = (day: number, index: number, field: 'start' | 'end', value: string) => {
    const dayBlocks = weekly[day] || [];
    const updated = [...dayBlocks];
    updated[index] = { ...updated[index], [field]: value };
    setWeekly({ ...weekly, [day]: updated });
  };

  const copyToRestOfWeek = (day: number) => {
    const dayBlocks = weekly[day] || [];
    const newWeekly: WeeklyTemplate = { ...weekly };
    DAYS.forEach((d) => {
      if (d.key !== day) {
        newWeekly[d.key] = [...dayBlocks];
      }
    });
    setWeekly(newWeekly);
    toast.success('Horarios copiados al resto de la semana');
  };

  const handleSave = async () => {
    try {
      if (employeeId) {
        await setEmployeeWeeklyTemplate(tenantId, employeeId, weekly);
      } else {
        await setBusinessWeeklyTemplate(tenantId, weekly);
      }
      toast.success('Horarios guardados');
      onSave?.(weekly);
    } catch (error) {
      toast.error('Error al guardar horarios');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      {DAYS.map((day) => {
        const dayBlocks = weekly[day.key] || [];
        return (
          <div key={day.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">{day.label}</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToRestOfWeek(day.key)}
                >
                  Copiar al resto
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock(day.key)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Añadir bloque
                </Button>
              </div>
            </div>
            {dayBlocks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Sin horarios</p>
            ) : (
              <div className="space-y-2">
                {dayBlocks.map((block, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <Input
                      type="time"
                      value={block.start}
                      onChange={(e) => updateBlock(day.key, index, 'start', e.target.value)}
                      className="w-32"
                    />
                    <span>-</span>
                    <Input
                      type="time"
                      value={block.end}
                      onChange={(e) => updateBlock(day.key, index, 'end', e.target.value)}
                      className="w-32"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBlock(day.key, index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Separator />
          </div>
        );
      })}
      <Button onClick={handleSave} className="w-full">
        Guardar horarios
      </Button>
    </div>
  );
}

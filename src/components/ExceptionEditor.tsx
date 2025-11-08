import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { setException } from '@/lib/mock';
import { formatISODate, parseISODate } from '@/lib/date';
import type { TimeBlock } from '@/lib/types';
import { toast } from 'sonner';
import { CalendarIcon, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

interface ExceptionEditorProps {
  tenantId: string;
  employeeId: string | null;
  onSave?: () => void;
}

export default function ExceptionEditor({ tenantId, employeeId, onSave }: ExceptionEditorProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [isClosed, setIsClosed] = useState(false);

  const handleAddBlock = () => {
    setBlocks([...blocks, { start: '09:00', end: '17:00' }]);
  };

  const handleRemoveBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const handleUpdateBlock = (index: number, field: 'start' | 'end', value: string) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], [field]: value };
    setBlocks(updated);
  };

  const handleSave = async () => {
    if (!selectedDate) {
      toast.error('Selecciona una fecha');
      return;
    }

    try {
      const isoDate = formatISODate(selectedDate);
      const exception = isClosed ? 'closed' : blocks;
      await setException(tenantId, employeeId, isoDate, exception);
      toast.success('Excepción guardada');
      setSelectedDate(undefined);
      setBlocks([]);
      setIsClosed(false);
      onSave?.();
    } catch (error) {
      toast.error('Error al guardar excepción');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Seleccionar fecha</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : 'Selecciona una fecha'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {selectedDate && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Cerrado</Label>
            <Switch checked={isClosed} onCheckedChange={setIsClosed} />
          </div>

          {!isClosed && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Bloques de tiempo</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddBlock}>
                  <Plus className="h-4 w-4 mr-1" />
                  Añadir bloque
                </Button>
              </div>
              {blocks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">Sin bloques</p>
              ) : (
                <div className="space-y-2">
                  {blocks.map((block, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <Input
                        type="time"
                        value={block.start}
                        onChange={(e) => handleUpdateBlock(index, 'start', e.target.value)}
                        className="w-32"
                      />
                      <span>-</span>
                      <Input
                        type="time"
                        value={block.end}
                        onChange={(e) => handleUpdateBlock(index, 'end', e.target.value)}
                        className="w-32"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBlock(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedDate && (
            <Button onClick={handleSave} className="w-full">
              Guardar excepción
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

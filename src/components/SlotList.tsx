import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

interface SlotListProps {
  slots: string[];
  onSelect: (slot: string) => void;
  loading?: boolean;
}

export default function SlotList({ slots, onSelect, loading }: SlotListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Selecciona un horario</Label>
        <div className="grid grid-cols-4 gap-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Selecciona un horario</Label>
        <p className="text-sm text-muted-foreground py-4 text-center">
          No hay horarios disponibles para esta fecha
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Selecciona un horario</Label>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((slot) => (
          <Button
            key={slot}
            variant="outline"
            onClick={() => onSelect(slot)}
            className="h-10"
          >
            {slot}
          </Button>
        ))}
      </div>
    </div>
  );
}

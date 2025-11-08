import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { businessRegistrationSchema, type BusinessRegistrationInput } from '@/lib/validators';
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
import { toast } from 'sonner';
import { createTenant } from '@/lib/mock';

const TIMEZONES = [
  { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
  { value: 'America/New_York', label: 'Nueva York (GMT-5)' },
  { value: 'America/Los_Angeles', label: 'Los Ángeles (GMT-8)' },
  { value: 'America/Chicago', label: 'Chicago (GMT-6)' },
  { value: 'America/Denver', label: 'Denver (GMT-7)' },
  { value: 'America/Bogota', label: 'Bogotá (GMT-5)' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
  { value: 'America/Santiago', label: 'Santiago (GMT-3)' },
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
];

const CATEGORIES = [
  'Barbería',
  'Salón de belleza',
  'Spa',
  'Clínica médica',
  'Consultoría',
  'Otro',
];

export default function RegistrationForm() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BusinessRegistrationInput>({
    resolver: zodResolver(businessRegistrationSchema),
    defaultValues: {
      timezone: 'America/Mexico_City',
    },
  });

  const timezone = watch('timezone');

  const onSubmit = async (data: BusinessRegistrationInput) => {
    try {
      const tenant = await createTenant(data);
      toast.success('¡Cuenta creada exitosamente!');
      // Redirect to onboarding
      window.location.href = `/t/${tenant.slug}/onboarding`;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear la cuenta');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="businessName">Nombre del negocio *</Label>
        <Input
          id="businessName"
          {...register('businessName')}
          placeholder="Ej: Barbería Elite"
        />
        {errors.businessName && (
          <p className="text-sm text-destructive">{errors.businessName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoría / Rubro</Label>
        <Select
          value={watch('category') || ''}
          onValueChange={(value) => setValue('category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">Zona horaria *</Label>
        <Select
          value={timezone}
          onValueChange={(value) => setValue('timezone', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.timezone && (
          <p className="text-sm text-destructive">{errors.timezone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="ownerName">Nombre del propietario *</Label>
        <Input
          id="ownerName"
          {...register('ownerName')}
          placeholder="Ej: Juan Pérez"
        />
        {errors.ownerName && (
          <p className="text-sm text-destructive">{errors.ownerName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="ownerEmail">Email del propietario *</Label>
        <Input
          id="ownerEmail"
          type="email"
          {...register('ownerEmail')}
          placeholder="juan@ejemplo.com"
        />
        {errors.ownerEmail && (
          <p className="text-sm text-destructive">{errors.ownerEmail.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>
    </form>
  );
}
